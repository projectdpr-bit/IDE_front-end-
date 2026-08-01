import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Building2, FolderGit2, Store, Users, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { title: "Total Clients", count: "24", sub: "+2 this month", icon: Building2, color: "text-[#044C75] bg-sky-50 border-sky-100" },
    { title: "Active Projects", count: "12", sub: "8 Feeder Lines", icon: FolderGit2, color: "text-primary-top bg-orange-50 border-orange-100" },
    { title: "Central Stores", count: "8", sub: "1,420 items in stock", icon: Store, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Total Employees", count: "142", sub: "Across 5 Sub-Divisions", icon: Users, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
                👑 Admin Control Center
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.fullName || user?.employeeCode || "Admin"}!
              </h1>
              <p className="mt-1 text-sky-100 text-xs md:text-sm">
                Full system access across all five hierarchy levels & ERP modules.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs space-y-1 shrink-0">
              <p><span className="text-sky-200">Admin Code:</span> <strong className="font-mono text-white">{user?.employeeCode || "IED_01"}</strong></p>
              <p><span className="text-sky-200">Scope:</span> <strong className="text-white">Global Enterprise</strong></p>
            </div>
          </div>
        </div> */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ title, count, sub, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{count}</h3>
                <p className="text-2xs font-medium text-slate-400 mt-0.5">{sub}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Events & Modules Progress Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity & Module Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live tracking of events, assigned modules, user actions & completion status</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Event</th>
                  <th className="py-3.5 px-5">Modules</th>
                  <th className="py-3.5 px-5">By (Name)</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {[
                  {
                    event: "Sub-Station Feeder 11kV Expansion",
                    module: "Project",
                    byName: "Alok Sharma (Senior Engineer)",
                    date: "2026-07-28",
                    status: "Active",
                  },
                  {
                    event: "Step-Down Transformers Purchase Order Approval",
                    module: "Procurements",
                    byName: "Procurement Admin",
                    date: "2026-07-27",
                    status: "Pending",
                  },
                  {
                    event: "Central Store Inventory Material Issue",
                    module: "Store Manager",
                    byName: "Ramesh Kumar (Store Mgr)",
                    date: "2026-07-26",
                    status: "Completed",
                  },
                  {
                    event: "Sub-Station CAD Blueprint SLD Rev 3.2",
                    module: "Drawing",
                    byName: "Rahul Mehta (Lead Designer)",
                    date: "2026-07-25",
                    status: "In Progress",
                  },
                  {
                    event: "Site Manager Feeder 108 Assignment",
                    module: "Senior Engineer",
                    byName: "Vikram Roy (Senior Engineer)",
                    date: "2026-07-24",
                    status: "Active",
                  },
                  {
                    event: "System Roles & Designations Mapping",
                    module: "Designations",
                    byName: "Admin User",
                    date: "2026-07-23",
                    status: "Completed",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">{row.event}</p>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{row.module}</span>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{row.byName}</p>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-500">{row.date}</td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      {row.status === "Active" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          Active
                        </span>
                      )}
                      {row.status === "Pending" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          Pending
                        </span>
                      )}
                      {row.status === "In Progress" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                          In Progress
                        </span>
                      )}
                      {row.status === "Completed" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
