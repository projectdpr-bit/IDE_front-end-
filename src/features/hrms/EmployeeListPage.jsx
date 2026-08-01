import DashboardLayout from "@/layouts/DashboardLayout";
import { Users, Plus, Search } from "lucide-react";

export default function EmployeeListPage() {
  const employees = [
    { id: 1, name: "Rahul Verma", code: "IED_042", role: "Senior Site Supervisor", site: "Feeder 104", status: "Active" },
    { id: 2, name: "Amit Kumar", code: "IED_018", role: "Store Manager", site: "Central Store", status: "Active" },
    { id: 3, name: "Suresh Gupta", code: "IED_099", role: "Site Engineer", site: "Location A3", status: "On Field" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory & Allocations</h1>
            <p className="text-xs text-slate-500 mt-1">Manage field engineers, managers, and site personnel</p>
          </div>
          <button type="button" className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, employee code, or role..." className="w-full text-xs outline-none bg-transparent" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">Employee</th>
                <th className="p-4">Employee Code</th>
                <th className="p-4">Role</th>
                <th className="p-4">Assigned Location / Site</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-[#044C75] font-bold flex items-center justify-center text-xs">
                      {e.name[0]}
                    </div>
                    <span className="font-bold text-slate-900">{e.name}</span>
                  </td>
                  <td className="p-4 font-mono">{e.code}</td>
                  <td className="p-4">{e.role}</td>
                  <td className="p-4">{e.site}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
