import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ArrowDownLeft, Plus, Search, Loader2, Download, Eye, FileText } from "lucide-react";

export default function InventoryInwardPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inwardLogs, setInwardLogs] = useState([
    {
      id: "INV-IN-001",
      date: "2023-10-12",
      vendor: "ABC Suppliers",
      po_number: "PO-2023-100",
      di_number: "DI-2023-050",
      total_items: 5,
      status: "received",
      received_by: "Store Manager",
    },
    {
      id: "INV-IN-002",
      date: "2023-10-15",
      vendor: "XYZ Materials",
      po_number: "PO-2023-102",
      di_number: "DI-2023-052",
      total_items: 2,
      status: "pending",
      received_by: "—",
    }
  ]);

  const filteredLogs = inwardLogs.filter((log) =>
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.po_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ArrowDownLeft className="w-7 h-7 text-[#DC2604]" />
              Inward Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage material receipts (Inward) based on Dispatch Instructions</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Receive Material
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Vendor or PO Number..."
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
                  <th className="px-6 py-4 font-semibold">Inward ID</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Vendor</th>
                  <th className="px-6 py-4 font-semibold">PO Ref</th>
                  <th className="px-6 py-4 font-semibold">DI Ref</th>
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
                        <p>Loading Inward Logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                      No Inward Logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.id}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{log.date}</td>
                      <td className="px-6 py-4 text-slate-600">{log.vendor}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{log.po_number}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{log.di_number}</td>
                      <td className="px-6 py-4 text-slate-600">{log.total_items}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          log.status === "received" ? "bg-emerald-100 text-emerald-700" :
                          log.status === "pending" ? "bg-amber-100 text-amber-700" :
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
                            title="Download MRN"
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
