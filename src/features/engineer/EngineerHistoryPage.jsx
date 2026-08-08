import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CheckCircle, Loader2, AlertCircle, History, ListFilter, X } from "lucide-react";
import apiClient from "@/lib/axios";
import { 
  GET_ENGINEER_HISTORY_ENTRIES_API
} from "@/utils/api/hr.api";
import { useAuthStore } from "@/store/useAuthStore";

const formatKey = (key) => {
  if (!key) return "";
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function EngineerHistoryPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedSubDivision, setSelectedSubDivision] = useState("all");
  const [selectedFeeder, setSelectedFeeder] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const baseEntries = entries.filter(e => e.engineer_role?.toLowerCase() === "site engineer" && e.status?.toLowerCase() !== "rejected");

  const templates = Array.from(
    new Map(baseEntries.map(e => [e.template_id, e.template_title])).entries()
  ).map(([id, title]) => ({ id, title }));

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

  const templateFilteredEntries = baseEntries.filter(e => selectedTemplateId === "all" || String(e.template_id) === String(selectedTemplateId));

  const uniqueProjects = Array.from(new Set(
    templateFilteredEntries.flatMap(e => {
      let pVal = e.project_name || null;
      if (e.data) {
        const key = Object.keys(e.data).find(k => isProjectField(k));
        if (key && e.data[key]) pVal = e.data[key];
      }
      return pVal ? [String(pVal)] : [];
    })
  )).sort();

  const projectFilteredEntries = templateFilteredEntries.filter(e => {
    if (selectedProject === "all") return true;
    let pVal = e.project_name || null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isProjectField(k));
      if (key && e.data[key]) pVal = e.data[key];
    }
    return String(pVal) === selectedProject;
  });

  const uniqueSubDivisions = Array.from(new Set(
    projectFilteredEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isSubDivisionField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const subDivFilteredEntries = projectFilteredEntries.filter(e => {
    if (selectedSubDivision === "all") return true;
    let sVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isSubDivisionField(k));
      if (key && e.data[key]) sVal = e.data[key];
    }
    return String(sVal) === selectedSubDivision;
  });

  const uniqueFeeders = Array.from(new Set(
    subDivFilteredEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isFeederField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const feederFilteredEntries = subDivFilteredEntries.filter(e => {
    if (selectedFeeder === "all") return true;
    let fVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isFeederField(k));
      if (key && e.data[key]) fVal = e.data[key];
    }
    return String(fVal) === selectedFeeder;
  });

  const uniqueLocations = Array.from(new Set(
    feederFilteredEntries.flatMap(e => {
      if (e.data) {
        const key = Object.keys(e.data).find(k => isLocationField(k));
        if (key && e.data[key]) return [String(e.data[key])];
      }
      return [];
    })
  )).sort();

  const filteredEntries = feederFilteredEntries.filter(e => {
    if (selectedLocation === "all") return true;
    let lVal = null;
    if (e.data) {
      const key = Object.keys(e.data).find(k => isLocationField(k));
      if (key && e.data[key]) lVal = e.data[key];
    }
    return String(lVal) === selectedLocation;
  });

  const knownSequence = [
    "sub_division",
    "feeder",
    "location_from",
    "location_to",
    "reading_from",
    "reading_to",
    "total_cable"
  ];

  const dynamicKeys = Array.from(
    new Set(
      filteredEntries.reduce((acc, entry) => {
        if (entry.data) {
          Object.keys(entry.data).forEach(k => acc.add(k));
        }
        return acc;
      }, new Set())
    )
  ).sort((a, b) => {
    const idxA = knownSequence.indexOf(a.toLowerCase());
    const idxB = knownSequence.indexOf(b.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });



  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_ENGINEER_HISTORY_ENTRIES_API);
      if (res.data?.success) {
        setEntries(res.data.data || []);
      } else {
        setError(res.data?.message || "Failed to load history entries.");
      }
    } catch (err) {
      console.error("Error fetching history entries:", err);
      setError("Failed to load history entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [refreshKey]);



  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-6)] max-w-[var(--content-max-width)] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <History className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Worksheet History</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">View your past worksheet entries.</p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <ListFilter className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)] pointer-events-none" />
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setSelectedProject("all");
                setSelectedSubDivision("all");
                setSelectedFeeder("all");
                setSelectedLocation("all");
              }}
              className="w-full h-[var(--input-height)] pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
            >
              <option value="all">All Templates</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title} (ID: {t.id})</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedSubDivision("all");
                setSelectedFeeder("all");
                setSelectedLocation("all");
              }}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <select
              value={selectedSubDivision}
              onChange={(e) => {
                setSelectedSubDivision(e.target.value);
                setSelectedFeeder("all");
                setSelectedLocation("all");
              }}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
            >
              <option value="all">All Sub Divisions</option>
              {uniqueSubDivisions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <select
              value={selectedFeeder}
              onChange={(e) => {
                setSelectedFeeder(e.target.value);
                setSelectedLocation("all");
              }}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
            >
              <option value="all">All Feeders</option>
              {uniqueFeeders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 appearance-none"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {(selectedTemplateId !== "all" || selectedProject !== "all" || selectedSubDivision !== "all" || selectedFeeder !== "all" || selectedLocation !== "all") && (
            <button
              onClick={() => {
                setSelectedTemplateId("all");
                setSelectedProject("all");
                setSelectedSubDivision("all");
                setSelectedFeeder("all");
                setSelectedLocation("all");
              }}
              className="h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-xl)] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-[var(--space-2)] text-[var(--text-xs)] font-bold shrink-0 shadow-sm"
              title="Clear all filters"
            >
              <X className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
              Clear
            </button>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-[var(--space-12)] space-y-[var(--space-3)]">
            <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-[var(--color-primary-top)] animate-spin" />
            <p className="text-[var(--text-xs)] font-medium text-slate-500">Loading history entries...</p>
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

        {!loading && !error && baseEntries.length === 0 && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--space-12)] flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-3)]">
              <History className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
            </div>
            <h3 className="text-[var(--text-base)] font-bold text-slate-800 mb-1">No History Available</h3>
            <p className="text-[var(--text-sm)] text-slate-500">You don't have any worksheet history entries.</p>
          </div>
        )}

        {!loading && !error && baseEntries.length > 0 && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm overflow-hidden flex flex-col min-w-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <table className="w-full min-w-[800px] border-collapse text-[var(--text-sm)]">
                <thead>
                  <tr>
                    {selectedTemplateId === "all" && (
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

                    {dynamicKeys.map(key => (
                      <th key={key} className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                        {formatKey(key)}
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Date
                    </th>
                    <th className="sticky top-0 right-0 z-20 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-md border-b border-l border-[var(--color-layout-border)] whitespace-nowrap text-right shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-layout-border)] bg-white">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={(selectedTemplateId === "all" ? 5 : 4) + dynamicKeys.length} className="px-[var(--table-cell-px)] py-[var(--space-12)] text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-3)]">
                            <CheckCircle className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
                          </div>
                          <p className="text-[var(--text-sm)]">No history entries found for the selected filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.entry_id} className="hover:bg-slate-50/60 transition-colors">
                        {selectedTemplateId === "all" && (
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
                          <span className={`inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide ${
                            entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                            entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {entry.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
