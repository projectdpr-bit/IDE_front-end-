import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { CalendarCheck, MapPin, FileCheck, CheckCircle2 } from "lucide-react";

export default function SeniorSiteSupervisorDashboard() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
            🏗️ Senior Site Supervisor Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hello, {user?.fullName || user?.employeeCode || "Supervisor"}!
          </h1>
          <p className="mt-1 text-sky-100 text-xs md:text-sm">
            Manage site activities, oversee site supervisors, and monitor daily progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-[#044C75]">
              <CalendarCheck className="w-5 h-5" />
              <h3 className="font-bold text-slate-800 text-sm">Attendance Today</h3>
            </div>
            <p className="text-xs text-slate-500">Punched In at 08:30 AM via GPS</p>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" /> Marked Present
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-primary-top">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-slate-800 text-sm">Assigned Locations</h3>
            </div>
            <p className="text-xs font-bold text-slate-800">Multiple Feeder Lines</p>
            <p className="text-[11px] text-slate-500">Overseeing 4 active sites</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-purple-600">
              <FileCheck className="w-5 h-5" />
              <h3 className="font-bold text-slate-800 text-sm">Approvals Pending</h3>
            </div>
            <p className="text-xs text-slate-500">Site Work Entries: <strong>12</strong></p>
            <p className="text-xs text-slate-500">Material Indents: <strong>3</strong></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
