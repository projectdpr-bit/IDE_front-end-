import DashboardLayout from "@/layouts/DashboardLayout";
import { Building2, Plus, Search } from "lucide-react";

export default function ClientsPage() {
  const clients = [
    { id: 1, name: "Tata Power Delhi Distribution", code: "TPDDL-01", projects: 4, status: "Active" },
    { id: 2, name: "Uttar Pradesh Power Corp (UPPCL)", code: "UPPCL-08", projects: 6, status: "Active" },
    { id: 3, name: "Adani Electricity Infrastructure", code: "AEIL-03", projects: 2, status: "Pending Approval" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients Management</h1>
            <p className="text-xs text-slate-500 mt-1">Manage infrastructure client organizations and assignments</p>
          </div>
          <button type="button" className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /> Add New Client
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search clients by name or client code..." className="w-full text-xs outline-none bg-transparent" />
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Client Code</th>
                  <th className="p-4">Assigned Projects</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#044C75]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                    </td>
                    <td className="p-4 font-mono">{c.code}</td>
                    <td className="p-4">{c.projects} Projects</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button type="button" className="text-xs font-semibold text-[#044C75] hover:underline cursor-pointer">
                        Edit Details
                      </button>
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
