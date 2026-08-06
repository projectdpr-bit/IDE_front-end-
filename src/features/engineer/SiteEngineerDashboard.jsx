import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { CalendarCheck, MapPin, ClipboardList, CheckCircle2 } from "lucide-react";

export default function SiteEngineerDashboard() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-6)] max-w-[var(--content-max-width)] mx-auto w-full">
        <div className="bg-gradient-to-r from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] rounded-[var(--radius-2xl)] p-[var(--space-6)] md:p-[var(--space-8)] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
          <span className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-white/20 text-white text-[var(--text-xs)] font-bold uppercase tracking-wider inline-block mb-[var(--space-3)] backdrop-blur-sm">
            👷‍♂️ Site Engineer Workspace
          </span>
          <h1 className="text-[var(--text-3xl)] font-extrabold tracking-tight">
            Hello, {user?.fullName || user?.employeeCode || "Engineer"}!
          </h1>
          <p className="mt-[var(--space-2)] text-white/90 text-[var(--text-sm)] max-w-2xl">
            Manage site execution, track material usage, and oversee daily progress at your assigned locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-[var(--color-primary-top)]">
               <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-[var(--color-primary-top)]/10 flex items-center justify-center">
                 <CalendarCheck className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Attendance Today</h3>
            </div>
            <p className="text-[var(--text-xs)] text-slate-500">Punched In at 08:30 AM via GPS</p>
            <span className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-green-50 text-green-700 text-[var(--text-2xs)] font-bold flex items-center gap-[var(--space-1)] w-fit border border-green-200">
              <CheckCircle2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" /> Marked Present
            </span>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-blue-600">
              <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-blue-50 flex items-center justify-center">
                 <MapPin className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Assigned Location</h3>
            </div>
            <p className="text-[var(--text-xs)] font-bold text-slate-800">11KV Feeder Line, Sector 4</p>
            <p className="text-[var(--text-xs)] text-slate-500">Ongoing execution</p>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-amber-600">
              <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-amber-50 flex items-center justify-center">
                 <ClipboardList className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Today's Tasks</h3>
            </div>
            <p className="text-[var(--text-xs)] text-slate-500">Pole Erection: <strong>2 pending</strong></p>
            <p className="text-[var(--text-xs)] text-slate-500">Cable Laying: <strong>500m target</strong></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
