import DashboardLayout from "@/layouts/DashboardLayout";
import { CalendarCheck, MapPin } from "lucide-react";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site & Feeder Attendance Records</h1>
          <p className="text-xs text-slate-500 mt-1">GPS verified location & site daily attendance logs</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#044C75]" />
              Today's Field Logs
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              GPS Sync Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary-top" />
                <div>
                  <p className="font-bold text-slate-800">Location A3 - Feeder 104</p>
                  <p className="text-slate-500 text-[11px]">Engineer: Suresh Gupta (In: 09:12 AM)</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
