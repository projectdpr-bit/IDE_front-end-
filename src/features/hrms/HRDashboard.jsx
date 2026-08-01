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
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
            📋 HRMS Management Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || "HR Manager"}!
          </h1>
          <p className="mt-1 text-sky-100 text-xs md:text-sm">
            Monitor attendance, site employee allocations, and payroll inputs across all projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ title, count, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{count}</h3>
              </div>
              <div className={`p-3.5 rounded-xl border ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
