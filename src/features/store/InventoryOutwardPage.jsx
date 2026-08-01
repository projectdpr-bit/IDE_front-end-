import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ArrowUpRight, Plus, Search, Loader2, Eye, FileText } from "lucide-react";

export default function InventoryOutwardPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [outwardLogs, setOutwardLogs] = useState([
    {
      id: "INV-OUT-001",
      date: "2023-10-18",
      project: "Project Alpha",
      site: "Site A - Feeder 1",
      engineer: "John Doe",
      total_items: 8,
      status: "dispatched",
    },
    {
      id: "INV-OUT-002",
      date: "2023-10-19",
      project: "Project Beta",
      site: "Site B - Feeder 3",
      engineer: "Jane Smith",
      total_items: 3,
      status: "draft",
    }
  ]);

  const filteredLogs = outwardLogs.filter((log) =>
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.engineer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ArrowUpRight className="w-7 h-7 text-primary-top" />
              Outward Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage material issuance (Outward) to Sites / Engineers</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Issue Material
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Project or Engineer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2604]/20 focus:border-[#DC2604] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Outward ID</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Site / Feeder</th>
                  <th className="px-6 py-4 font-semibold">Issued To</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#DC2604]" />
                        <p>Loading Outward Logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                      No Outward Logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.id}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{log.date}</td>
                      <td className="px-6 py-4 text-slate-600">{log.project}</td>
                      <td className="px-6 py-4 text-slate-600">{log.site}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{log.engineer}</td>
                      <td className="px-6 py-4 text-slate-600">{log.total_items}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          log.status === "dispatched" ? "bg-emerald-100 text-emerald-700" :
                          log.status === "draft" ? "bg-slate-100 text-slate-600" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="View Details"
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Download Challan"
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
