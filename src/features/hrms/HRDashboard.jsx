import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Users, CalendarCheck, Clock, FileText } from "lucide-react";

export default function HRDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { title: "Total Employees", count: "142", icon: Users, color: "text-[#044C75] bg-sky-50 border-sky-100" },
    { title: "Today's Attendance", count: "94.2%", icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Pending Leave Requests", count: "7", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Payroll Input Status", count: "Ready", icon: FileText, color: "text-purple-600 bg-purple-50 border-purple-100" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] rounded-[var(--radius-2xl)] p-[var(--card-padding)] text-white shadow-lg relative overflow-hidden">
          <span className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-white/20 text-white text-[var(--text-2xs)] font-bold uppercase tracking-wider inline-block mb-[var(--space-3)]">
            📋 HRMS Management Workspace
          </span>
          <h1 className="text-[var(--text-2xl)] font-extrabold tracking-tight">
            Welcome, {user?.fullName || "HR Manager"}!
          </h1>
          <p className="mt-[var(--space-1)] text-white/90 text-[var(--text-xs)] md:text-[var(--text-sm)]">
            Monitor attendance, site employee allocations, and payroll inputs across all projects.
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-[var(--space-4)] grid-cols-[repeat(auto-fit,minmax(clamp(160px,15%+80px,240px),1fr))]">
          {stats.map(({ title, count, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-[var(--text-2xl)] font-bold text-slate-800 mt-[var(--space-1)]">{count}</h3>
              </div>
              <div className={`p-[var(--space-3)] rounded-[var(--radius-xl)] border ${color}`}>
                <Icon className="w-[var(--icon-lg)] h-[var(--icon-lg)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
