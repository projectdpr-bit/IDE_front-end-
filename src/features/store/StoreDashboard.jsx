import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Store, PackageCheck, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_STORE_PROJECTS_API } from "@/utils/ApiHelper";
export default function StoreDashboard() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await apiClient.get(GET_STORE_PROJECTS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProjects(res.data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Error fetching store projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshKey]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
            📦 Store & Stock Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || "Store Manager"}!
          </h1>
          <p className="mt-1 text-sky-100 text-xs md:text-sm">
            Manage inventory in/outward logs, debit/credit notes, and stock aging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock Items</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">1,420</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-amber-600 bg-amber-50 border-amber-100">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Inward (DI)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">14 Batches</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-emerald-600 bg-emerald-50 border-emerald-100">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider">Today's Outward (Site)</p>
              <h3 className="text-[var(--text-2xl)] font-bold text-slate-800 mt-[var(--space-1)]">8 Dispatches</h3>
            </div>
            <div className="p-[var(--space-3)] rounded-[var(--radius-xl)] border text-[var(--color-primary-top)] bg-orange-50 border-orange-100">
              <ArrowUpRight className="w-[var(--icon-lg)] h-[var(--icon-lg)]" />
            </div>
          </div>
        </div>

        {/* Active Projects Table Area */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)] shadow-sm flex flex-col gap-[var(--space-4)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--text-base)] font-bold text-slate-800">Active Projects</h2>
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
            <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Project Code
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Project Name
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Start Date
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingProjects ? (
                  <tr>
                    <td colSpan={4} className="text-center py-[var(--space-10)] text-slate-500">
                      <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] animate-spin mx-auto text-[var(--color-primary-top)]" />
                      <p className="mt-[var(--space-2)] text-[var(--text-sm)]">Loading projects...</p>
                    </td>
                  </tr>
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.project_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <span className="font-medium text-[var(--color-primary-top)]">{project.project_code}</span>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        {project.project_name}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <span className={`inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide ${
                          project.status?.toLowerCase() === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-[var(--space-10)] text-[var(--text-sm)] text-slate-500">
                      No active projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
