import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CheckCircle, Loader2, AlertCircle, ShieldCheck, XCircle, X, ListFilter } from "lucide-react";
import apiClient from "@/lib/axios";
import { 
  GET_SUPERVISOR_PENDING_ENTRIES_API,
  PUT_SUPERVISOR_WORKSHEET_STATUS_API,
  GET_SUPERVISOR_HISTORY_ENTRIES_API
} from "@/utils/api/hr.api";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/utils/authStorage";

const formatKey = (key) => {
  if (!key) return "";
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function SupervisorApprovalsPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const [selectedHistTemplateId, setSelectedHistTemplateId] = useState("all");
  const [selectedHistProject, setSelectedHistProject] = useState("all");
  const [selectedHistSubDivision, setSelectedHistSubDivision] = useState("all");
  const [selectedHistFeeder, setSelectedHistFeeder] = useState("all");
  const [selectedHistLocation, setSelectedHistLocation] = useState("all");

  const knownSequence = [
    "project",
    "subdivision",
    "feeder",
    "location",
    "readingfrom",
    "readingto",
    "totalcable"
  ];

  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const matchField = (key, keywords) => {
    const k = normalizeString(key);
    return keywords.some(kw => {
      const normKw = normalizeString(kw);
      return k.includes(normKw);
    });
  };

  const isProjectField = (k) => matchField(k, ['project']);
  const isSubDivisionField = (k) => matchField(k, ['subdivision']);
  const isFeederField = (k) => matchField(k, ['feeder']);
  const isLocationField = (k) => matchField(k, ['location']);

  const sortDynamicKeys = (a, b) => {
    const normA = normalizeString(a);
    const normB = normalizeString(b);
    
    const idxA = knownSequence.findIndex(k => normA.includes(k));
    const idxB = knownSequence.findIndex(k => normB.includes(k));

    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  };

  const dynamicKeys = Array.from(
    new Set(
      entries.reduce((acc, entry) => {
        if (entry.data) {
          Object.keys(entry.data).forEach(k => acc.add(k));
        }
        return acc;
      }, new Set())
    )
  ).sort(sortDynamicKeys);

  const baseHistoryEntries = historyEntries.filter(e => e.engineer_role?.toLowerCase() === "site engineer");

  const historyDynamicKeys = Array.from(
    new Set(
      baseHistoryEntries.reduce((acc, entry) => {
        if (entry.data) {
          Object.keys(entry.data).forEach(k => acc.add(k));
        }
        return acc;
      }, new Set())
    )
  ).sort(sortDynamicKeys);

  const histTemplates = Array.from(
    new Map(baseHistoryEntries.map(e => [e.template_id, e.template_title])).entries()
  ).map(([id, title]) => ({ id, title }));

  const templateFilteredHistEntries = baseHistoryEntries.filter(e => selectedHistTemplateId === "all" || String(e.template_id) === String(selectedHistTemplateId));

  const uniqueHistProjects = Array.from(new Set(
    templateFilteredHistEntries.flatMap(e => {
      let pVal = e.project_name || null;
      if (e.data) {
        const key = Object.keys(e.data).find(k => isProjectField(k));
        if (key && e.data[key]) pVal = e.data[key];
      }
      return pVal ? [String(pVal)] : [];
    })
  )).sort();

  const projectFilteredHistEntries = templateFilteredHistEntries.filter(e => {
    if (selectedHistProject === "all") return true;
    let pVal = e.project_name || null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isProjectField(k));
      if (key && e.data[key]) pVal = e.data[key];
    }
    return String(pVal) === selectedHistProject;
  });

  const uniqueHistSubDivisions = Array.from(new Set(
    projectFilteredHistEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isSubDivisionField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const subDivFilteredHistEntries = projectFilteredHistEntries.filter(e => {
    if (selectedHistSubDivision === "all") return true;
    let sVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isSubDivisionField(k));
      if (key && e.data[key]) sVal = e.data[key];
    }
    return String(sVal) === selectedHistSubDivision;
  });

  const uniqueHistFeeders = Array.from(new Set(
    subDivFilteredHistEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isFeederField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const feederFilteredHistEntries = subDivFilteredHistEntries.filter(e => {
    if (selectedHistFeeder === "all") return true;
    let fVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isFeederField(k));
      if (key && e.data[key]) fVal = e.data[key];
    }
    return String(fVal) === selectedHistFeeder;
  });

  const uniqueHistLocations = Array.from(new Set(
    feederFilteredHistEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isLocationField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const filteredHistoryEntries = feederFilteredHistEntries.filter(e => {
    if (selectedHistLocation === "all") return true;
    let lVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isLocationField(k));
      if (key && e.data[key]) lVal = e.data[key];
    }
    return String(lVal) === selectedHistLocation;
  });

  const [processingIds, setProcessingIds] = useState({});

  const fetchEntries = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        apiClient.get(GET_SUPERVISOR_PENDING_ENTRIES_API),
        apiClient.get(GET_SUPERVISOR_HISTORY_ENTRIES_API)
      ]);
      
      if (pendingRes.data?.success) {
        setEntries(pendingRes.data.data || []);
      } else {
        setError(pendingRes.data?.message || "Failed to load pending entries.");
      }

      if (historyRes.data?.success) {
        setHistoryEntries(historyRes.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pending entries:", err);
      setError("Failed to load pending entries.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDirectApprove = async (entry) => {
    setProcessingIds(prev => ({ ...prev, [entry.entry_id]: "approved" }));
    try {
      const payload = {
        status: "approved",
        remarks: "Approved"
      };
      const res = await apiClient.put(`${PUT_SUPERVISOR_WORKSHEET_STATUS_API}/${entry.entry_id}/status`, payload);
      if (res.data?.success) {
        await fetchEntries(true);
      } else {
        alert(res.data?.message || "Failed to approve entry.");
      }
    } catch (err) {
      console.error("Error approving entry:", err);
      alert(err.response?.data?.message || "An error occurred while approving the entry.");
    } finally {
      setProcessingIds(prev => {
        const next = { ...prev };
        delete next[entry.entry_id];
        return next;
      });
    }
  };

  const handleRejectClick = (entry) => {
    setSelectedEntry(entry);
    setRejectRemarks("");
  };

  const confirmReject = async () => {
    if (!selectedEntry || !rejectRemarks.trim()) return;

    setProcessingIds(prev => ({ ...prev, [selectedEntry.entry_id]: "rejected" }));
    try {
      const payload = {
        status: "rejected",
        remarks: rejectRemarks.trim()
      };
      const res = await apiClient.put(`${PUT_SUPERVISOR_WORKSHEET_STATUS_API}/${selectedEntry.entry_id}/status`, payload);
      if (res.data?.success) {
        setSelectedEntry(null);
        setRejectRemarks("");
        await fetchEntries(true);
      } else {
        alert(res.data?.message || "Failed to reject entry.");
      }
    } catch (err) {
      console.error("Error rejecting entry:", err);
      alert(err.response?.data?.message || "An error occurred while rejecting the entry.");
    } finally {
      setProcessingIds(prev => {
        const next = { ...prev };
        delete next[selectedEntry.entry_id];
        return next;
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-[var(--space-4)] h-full max-w-[var(--content-max-width)] mx-auto w-full">
        {/* Left Side: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto space-y-[var(--space-6)] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <ShieldCheck className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Pending Approvals</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">Review and approve pending worksheet entries.</p>
            </div>
          </div>
        </div>


        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-[var(--space-12)] space-y-[var(--space-3)]">
            <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-[var(--color-primary-top)] animate-spin" />
            <p className="text-[var(--text-xs)] font-medium text-slate-500">Loading pending entries...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-[var(--card-padding)] bg-rose-50 border border-rose-200 rounded-[var(--radius-xl)] flex flex-wrap items-center justify-between gap-[var(--space-3)] text-rose-800 text-[var(--text-sm)]">
            <div className="flex items-center gap-[var(--space-3)]">
              <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] text-[var(--color-primary-top)] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={fetchEntries} className="btn-3d-primary px-[var(--space-4)] h-[var(--btn-height-sm)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Pending Approvals Table */}
        {!loading && !error && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm flex flex-col min-w-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <table className="w-full min-w-[800px] border-collapse text-[var(--text-sm)]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Template
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Engineer
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left hidden md:table-cell">
                      Project
                    </th>

                    {dynamicKeys.map(key => (
                      <th key={key} className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                        {formatKey(key)}
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Date
                    </th>
                    <th className="sticky top-0 right-0 z-20 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-md border-b border-l border-[var(--color-layout-border)] whitespace-nowrap text-right shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-layout-border)] bg-white">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5 + dynamicKeys.length} className="px-[var(--table-cell-px)] py-[var(--space-12)] text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-3)]">
                            <CheckCircle className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
                          </div>
                          <p className="text-[var(--text-sm)]">No pending entries found for approval.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.entry_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600 font-medium">
                          {entry.template_title}
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-medium">{entry.engineer_name}</span>
                            <span className="text-[var(--text-2xs)] text-slate-500">{entry.engineer_role}</span>
                          </div>
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600 hidden md:table-cell">
                          <span className="truncate block max-w-[150px]" title={entry.project_name}>{entry.project_name}</span>
                        </td>

                        {dynamicKeys.map(key => (
                          <td key={key} className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                            {entry.data && entry.data[key] !== null && entry.data[key] !== undefined && entry.data[key] !== "" 
                              ? String(entry.data[key]) 
                              : "-"}
                          </td>
                        ))}
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                          {new Date(entry.recorded_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="sticky right-0 bg-white z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-right border-l border-[var(--color-layout-border)] shadow-[-4px_0_12px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-center justify-end gap-[var(--space-2)]">
                            <button 
                              onClick={() => handleDirectApprove(entry)}
                              disabled={!!processingIds[entry.entry_id]}
                              className="btn-3d-primary px-[var(--space-3)] h-[var(--btn-height-sm)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-medium inline-flex items-center gap-[var(--space-1)] disabled:opacity-70 disabled:cursor-not-allowed"
                              title="Approve"
                            >
                              {processingIds[entry.entry_id] === "approved" ? (
                                <Loader2 className="w-[var(--icon-sm)] h-[var(--icon-sm)] animate-spin" />
                              ) : (
                                <CheckCircle className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleRejectClick(entry)}
                              disabled={!!processingIds[entry.entry_id]}
                              className="px-[var(--space-3)] h-[var(--btn-height-sm)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-medium inline-flex items-center gap-[var(--space-1)] bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject"
                            >
                              {processingIds[entry.entry_id] === "rejected" ? (
                                <Loader2 className="w-[var(--icon-sm)] h-[var(--icon-sm)] animate-spin" />
                              ) : (
                                <XCircle className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History / Approved Table (only render if there's any data at all) */}
        {!loading && !error && baseHistoryEntries.length > 0 && (
          <div className="mt-4 pb-8">
            <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
              <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
              <h2 className="text-[var(--text-lg)] font-bold text-slate-800">Approved History (Site Engineer)</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-[var(--space-3)] mb-[var(--space-4)]">
              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <ListFilter className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)] pointer-events-none" />
                <select
                  value={selectedHistTemplateId}
                  onChange={(e) => {
                    setSelectedHistTemplateId(e.target.value);
                    setSelectedHistProject("all");
                    setSelectedHistSubDivision("all");
                    setSelectedHistFeeder("all");
                    setSelectedHistLocation("all");
                  }}
                  className="w-full h-[var(--input-height)] pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
                >
                  <option value="all">All Templates</option>
                  {histTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <select
                  value={selectedHistProject}
                  onChange={(e) => {
                    setSelectedHistProject(e.target.value);
                    setSelectedHistSubDivision("all");
                    setSelectedHistFeeder("all");
                    setSelectedHistLocation("all");
                  }}
                  className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
                >
                  <option value="all">All Projects</option>
                  {uniqueHistProjects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <select
                  value={selectedHistSubDivision}
                  onChange={(e) => {
                    setSelectedHistSubDivision(e.target.value);
                    setSelectedHistFeeder("all");
                    setSelectedHistLocation("all");
                  }}
                  className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
                >
                  <option value="all">All Sub Divisions</option>
                  {uniqueHistSubDivisions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <select
                  value={selectedHistFeeder}
                  onChange={(e) => {
                    setSelectedHistFeeder(e.target.value);
                    setSelectedHistLocation("all");
                  }}
                  className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
                >
                  <option value="all">All Feeders</option>
                  {uniqueHistFeeders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="relative flex-1 min-w-[160px] max-w-[220px]">
                <select
                  value={selectedHistLocation}
                  onChange={(e) => setSelectedHistLocation(e.target.value)}
                  className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
                >
                  <option value="all">All Locations</option>
                  {uniqueHistLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {(selectedHistTemplateId !== "all" || selectedHistProject !== "all" || selectedHistSubDivision !== "all" || selectedHistFeeder !== "all" || selectedHistLocation !== "all") && (
                <button
                  onClick={() => {
                    setSelectedHistTemplateId("all");
                    setSelectedHistProject("all");
                    setSelectedHistSubDivision("all");
                    setSelectedHistFeeder("all");
                    setSelectedHistLocation("all");
                  }}
                  className="h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-[var(--space-2)] text-[var(--text-xs)] font-bold shrink-0 shadow-sm"
                  title="Clear all filters"
                >
                  <X className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                  Clear
                </button>
              )}
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm flex flex-col min-w-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <table className="w-full min-w-[800px] border-collapse text-[var(--text-sm)]">
                  <thead>
                    <tr>
                      {selectedHistTemplateId === "all" && (
                        <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                          Template
                        </th>
                      )}
                      <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                        Engineer
                      </th>
                      <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left hidden md:table-cell">
                        Project
                      </th>

                      {historyDynamicKeys.map(key => (
                        <th key={`hist-${key}`} className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                          {formatKey(key)}
                        </th>
                      ))}
                      <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                        Date
                      </th>
                      <th className="sticky top-0 right-0 z-20 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-md border-b border-l border-[var(--color-layout-border)] whitespace-nowrap text-center shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-layout-border)] bg-white">
                    {filteredHistoryEntries.length === 0 ? (
                      <tr>
                        <td colSpan={(selectedHistTemplateId === "all" ? 5 : 4) + historyDynamicKeys.length} className="px-[var(--table-cell-px)] py-[var(--space-12)] text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-3)]">
                              <CheckCircle className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
                            </div>
                            <p className="text-[var(--text-sm)]">No history entries found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistoryEntries.map((entry) => (
                        <tr key={`hist-${entry.entry_id}`} className="hover:bg-slate-50/60 transition-colors">
                          {selectedHistTemplateId === "all" && (
                            <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600 font-medium">
                              {entry.template_title}
                            </td>
                          )}
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-medium">{entry.engineer_name}</span>
                              <span className="text-[var(--text-2xs)] text-slate-500">{entry.engineer_role}</span>
                            </div>
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600 hidden md:table-cell">
                            <span className="truncate block max-w-[150px]" title={entry.project_name}>{entry.project_name}</span>
                          </td>

                          {historyDynamicKeys.map(key => (
                            <td key={`hist-${entry.entry_id}-${key}`} className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                              {entry.data && entry.data[key] !== null && entry.data[key] !== undefined && entry.data[key] !== "" 
                                ? String(entry.data[key]) 
                                : "-"}
                            </td>
                          ))}
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                            {new Date(entry.recorded_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="sticky right-0 bg-white z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-center border-l border-[var(--color-layout-border)] shadow-[-4px_0_12px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/60 transition-colors">
                            {entry.status === 'approved' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">Approved</span>
                            ) : entry.status === 'rejected' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">Rejected</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Right Panel (Desktop) */}
        <div className={`
          hidden lg:flex flex-col shrink-0 bg-white border border-[var(--color-layout-border)]
          rounded-[var(--radius-xl)] shadow-sm transition-all duration-300 overflow-hidden
          ${selectedEntry ? 'w-[var(--panel-width)] opacity-100 border-[var(--color-layout-border)]' : 'w-0 opacity-0 border-transparent'}
        `}>
          <div className="w-[var(--panel-width)] flex flex-col h-full">
            {/* Sticky panel header */}
            <div className="flex items-center justify-between p-[var(--card-padding)] border-b border-[var(--color-layout-border)] sticky top-0 bg-white z-10 shrink-0">
              <h2 className="text-[var(--text-base)] font-semibold text-slate-800">Reject Entry</h2>
              <button onClick={() => setSelectedEntry(null)} className="p-[var(--space-2)] rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
                <X className="w-[var(--icon-md)] h-[var(--icon-md)] text-slate-500" />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-[var(--card-padding)] space-y-[var(--space-4)] scrollbar-thin scrollbar-thumb-slate-200">
              {selectedEntry && (
                <>
                  <div className="bg-slate-50 p-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-layout-border)]">
                    <p className="text-[var(--text-xs)] text-slate-500 font-medium">Template</p>
                    <p className="text-[var(--text-sm)] font-semibold text-slate-800">{selectedEntry.template_title}</p>
                    <p className="text-[var(--text-xs)] text-slate-500 font-medium mt-[var(--space-2)]">Engineer</p>
                    <p className="text-[var(--text-sm)] font-semibold text-slate-800">{selectedEntry.engineer_name}</p>
                  </div>
                  <div>
                    <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
                      Rejection Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectRemarks}
                      onChange={(e) => setRejectRemarks(e.target.value)}
                      className="w-full min-h-[120px] p-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 resize-y"
                      placeholder="Please provide a detailed reason for rejection..."
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={confirmReject}
                    disabled={!rejectRemarks.trim() || !!processingIds[selectedEntry.entry_id]}
                    className="btn-3d-primary w-full h-[var(--btn-height-lg)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center justify-center gap-[var(--space-2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds[selectedEntry.entry_id] === "rejected" ? (
                      <Loader2 className="w-[var(--icon-sm)] h-[var(--icon-sm)] animate-spin" />
                    ) : (
                      <XCircle className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                    )}
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: backdrop + drawer */}
      {selectedEntry && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] flex justify-end" onClick={() => setSelectedEntry(null)}>
          <div className="w-[85vw] max-w-[380px] bg-white h-full shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-[var(--card-padding)] border-b border-[var(--color-layout-border)] sticky top-0 bg-white z-10 shrink-0">
              <h2 className="text-[var(--text-base)] font-semibold text-slate-800">Reject Entry</h2>
              <button onClick={() => setSelectedEntry(null)} className="p-[var(--space-2)] rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
                <X className="w-[var(--icon-md)] h-[var(--icon-md)] text-slate-500" />
              </button>
            </div>
            <div className="flex-1 p-[var(--card-padding)] space-y-[var(--space-4)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <div className="bg-slate-50 p-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-layout-border)]">
                <p className="text-[var(--text-xs)] text-slate-500 font-medium">Template</p>
                <p className="text-[var(--text-sm)] font-semibold text-slate-800">{selectedEntry.template_title}</p>
                <p className="text-[var(--text-xs)] text-slate-500 font-medium mt-[var(--space-2)]">Engineer</p>
                <p className="text-[var(--text-sm)] font-semibold text-slate-800">{selectedEntry.engineer_name}</p>
              </div>
              <div>
                <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
                  Rejection Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full min-h-[120px] p-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 resize-y"
                  placeholder="Please provide a detailed reason for rejection..."
                />
              </div>
              <button
                onClick={confirmReject}
                disabled={!rejectRemarks.trim() || !!processingIds[selectedEntry.entry_id]}
                className="btn-3d-primary w-full h-[var(--btn-height-lg)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center justify-center gap-[var(--space-2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingIds[selectedEntry.entry_id] === "rejected" ? (
                  <Loader2 className="w-[var(--icon-sm)] h-[var(--icon-sm)] animate-spin" />
                ) : (
                  <XCircle className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
