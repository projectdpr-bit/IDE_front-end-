import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { formatIndianCurrency } from "@/utils/formatters";
import { Building2, FolderGit2, FileText, CheckCircle2 } from "lucide-react";

export default function ClientDashboard() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
            🏢 Client Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || "Client Representative"}!
          </h1>
          <p className="mt-1 text-sky-100 text-xs md:text-sm">
            Track site project progress, BOQ allocations, and client billing reports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Projects</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">4</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-[#044C75] bg-sky-50 border-sky-100">
              <FolderGit2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Progress</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">82%</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-emerald-600 bg-emerald-50 border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Invoices</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatIndianCurrency(1420000)}</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-purple-600 bg-purple-50 border-purple-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
