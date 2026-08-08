import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { CheckCircle, Loader2, AlertCircle, History } from "lucide-react";
import apiClient from "@/lib/axios";
import { 
  GET_SUPERVISOR_HISTORY_ENTRIES_API
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

export default function SupervisorHistoryPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const roles = Array.from(
    new Set(entries.map(e => e.engineer_role).filter(Boolean))
  );

  const roleFilteredEntries = entries.filter(e => 
    selectedRole === "all" || e.engineer_role === selectedRole
  );

  const templates = Array.from(
    new Map(roleFilteredEntries.map(e => [e.template_id, e.template_title])).entries()
  ).map(([id, title]) => ({ id, title }));

  const filteredEntries = roleFilteredEntries.filter(e => {
    if (selectedTemplateId && String(e.template_id) !== String(selectedTemplateId)) return false;
    return true;
  });

  const dynamicKeys = Array.from(
    new Set(
      filteredEntries.reduce((acc, entry) => {
        if (entry.data) {
          Object.keys(entry.data).forEach(k => acc.add(k));
        }
        return acc;
      }, new Set())
    )
  );



  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_SUPERVISOR_HISTORY_ENTRIES_API);
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
  }, []);



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
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">View past worksheet entries.</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-[var(--card-padding)] rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm flex flex-wrap gap-[var(--space-4)]">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[var(--text-xs)] font-semibold text-slate-600 mb-[var(--space-1)] block">1. Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedTemplateId(""); // reset template when role changes
              }}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            >
              <option value="all">All Roles</option>
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[var(--text-xs)] font-semibold text-slate-600 mb-[var(--space-1)] block">2. Select Template <span className="text-red-500">*</span></label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            >
              <option value="">-- Choose a Template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title} (ID: {t.id})</option>
              ))}
            </select>
          </div>
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

        {/* Table / Empty State */}
        {!loading && !error && !selectedTemplateId && (
          <div className="flex flex-col items-center justify-center py-[var(--space-16)] bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-[var(--space-4)]">
              <History className="w-8 h-8" />
            </div>
            <p className="text-[var(--text-base)] font-medium text-slate-600">Please select a Template to view history.</p>
          </div>
        )}

        {!loading && !error && selectedTemplateId && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm overflow-hidden flex flex-col min-w-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
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
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Date
                    </th>
                    {dynamicKeys.map(key => (
                      <th key={key} className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                        {formatKey(key)}
                      </th>
                    ))}
                    <th className="sticky top-0 right-0 z-20 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-md border-b border-l border-[var(--color-layout-border)] whitespace-nowrap text-right shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-layout-border)] bg-white">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5 + dynamicKeys.length} className="px-[var(--table-cell-px)] py-[var(--space-12)] text-center text-slate-500">
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
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                          {new Date(entry.recorded_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        {dynamicKeys.map(key => (
                          <td key={key} className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                            {entry.data && entry.data[key] !== null && entry.data[key] !== undefined && entry.data[key] !== "" 
                              ? String(entry.data[key]) 
                              : "-"}
                          </td>
                        ))}
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
