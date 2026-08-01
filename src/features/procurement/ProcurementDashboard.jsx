import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingBag, FileSpreadsheet, Truck, Users } from "lucide-react";

export default function ProcurementDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { title: "Total Vendors", count: "45", sub: "+5 this month", icon: Users, color: "text-[#044C75] bg-sky-50 border-sky-100" },
    { title: "Active POs", count: "18", sub: "12 Pending Approval", icon: ShoppingBag, color: "text-primary-top bg-orange-50 border-orange-100" },
    { title: "Pending DIs", count: "5", sub: "Dispatch Instructions", icon: Truck, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "BOQ Processed", count: "340", sub: "Items evaluated", icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
                📑 Procurement Workspace
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.fullName || user?.employeeCode || "Procurement Manager"}!
              </h1>
              <p className="mt-1 text-sky-100 text-xs md:text-sm">
                Manage Vendors, Purchase Orders (PO), and Dispatch Instructions (DI).
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs space-y-1 shrink-0">
              <p><span className="text-sky-200">Role:</span> <strong className="font-mono text-white">Procurement</strong></p>
              <p><span className="text-sky-200">Scope:</span> <strong className="text-white">Central Operations</strong></p>
            </div>
          </div>
        </div>

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
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Procurement Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live tracking of Purchase Orders, DIs, and Vendor interactions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Activity</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Vendor</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {[
                  {
                    activity: "PO-2026-0045 (Transformers)",
                    type: "Purchase Order",
                    vendor: "TechCorp Equipments",
                    date: "2026-07-28",
                    status: "Pending",
                  },
                  {
                    activity: "DI-2026-0012 Generation",
                    type: "Dispatch Instruction",
                    vendor: "Global Wires Ltd",
                    date: "2026-07-27",
                    status: "Completed",
                  },
                  {
                    activity: "Vendor Onboarding Review",
                    type: "Vendor",
                    vendor: "Smart Cables Inc",
                    date: "2026-07-26",
                    status: "In Progress",
                  },
                  {
                    activity: "PO-2026-0044 (Poles)",
                    type: "Purchase Order",
                    vendor: "Steel Infra Builders",
                    date: "2026-07-25",
                    status: "Completed",
                  },
                  {
                    activity: "Material Quality Check",
                    type: "Inspection",
                    vendor: "TechCorp Equipments",
                    date: "2026-07-24",
                    status: "Active",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">{row.activity}</p>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{row.type}</span>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{row.vendor}</p>
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
