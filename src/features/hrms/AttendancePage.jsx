import DashboardLayout from "@/layouts/DashboardLayout";
import { CalendarCheck, MapPin } from "lucide-react";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">
        
        {/* Page Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div>
            <h1 className="text-[var(--text-xl)] font-semibold text-slate-800 tracking-tight">Site & Feeder Attendance Records</h1>
            <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">GPS verified location & site daily attendance logs</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-auto min-h-0">
          
          {/* Logs Card */}
          <div className="w-full bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)] shadow-sm flex flex-col gap-[var(--space-4)] h-fit">
            
            <div className="flex items-center justify-between border-b border-[var(--color-layout-border)] pb-[var(--space-3)]">
              <h2 className="text-[var(--text-sm)] font-bold text-slate-800 flex items-center gap-[var(--space-2)]">
                <CalendarCheck className="w-[var(--icon-md)] h-[var(--icon-md)] text-[var(--color-primary-bottom)]" />
                Today's Field Logs
              </h2>
              <span className="inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                GPS Sync Active
              </span>
            </div>

            <div className="flex flex-col gap-[var(--space-3)] text-[var(--text-sm)]">
              <div className="p-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-layout-border)] bg-slate-50 flex items-center justify-between hover:border-[var(--color-primary-top)]/30 transition-colors">
                <div className="flex items-center gap-[var(--space-3)]">
                  <MapPin className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-[var(--color-primary-top)] shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Location A3 - Feeder 104</p>
                    <p className="text-slate-500 text-[var(--text-xs)] mt-0.5">Engineer: Suresh Gupta (In: 09:12 AM)</p>
                  </div>
                </div>
                <span className="font-bold text-slate-700 text-[var(--text-xs)]">Verified</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
