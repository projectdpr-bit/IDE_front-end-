import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Store, Search, Loader2, ArrowUp, ArrowDown } from "lucide-react";

export default function StockAgingPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState([
    {
      id: "MAT-001",
      code: "CBL-120",
      name: "120 sq mm Cable",
      category: "Electrical",
      in_stock: 500,
      unit: "mtr",
      min_stock: 100,
      last_inward: "2023-09-15",
      aging_days: 45,
    },
    {
      id: "MAT-002",
      code: "TRF-250",
      name: "250 kVA Transformer",
      category: "Equipment",
      in_stock: 2,
      unit: "nos",
      min_stock: 5,
      last_inward: "2023-08-10",
      aging_days: 80,
    }
  ]);

  const filteredItems = stockItems.filter((item) =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Store className="w-7 h-7 text-[#DC2604]" />
              Stock & Aging
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitor current inventory levels and stock aging analysis</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Material Code, Name or Category..."
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
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Material Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Current Stock</th>
                  <th className="px-6 py-4 font-semibold">Min. Level</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Last Inward</th>
                  <th className="px-6 py-4 font-semibold text-right">Aging (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#DC2604]" />
                        <p>Loading Stock Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                      No materials found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, i) => {
                    const isLowStock = item.in_stock <= item.min_stock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 text-xs">{i + 1}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{item.code}</td>
                        <td className="px-6 py-4 text-slate-800">{item.name}</td>
                        <td className="px-6 py-4 text-slate-500">{item.category}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {item.in_stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.min_stock}</td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                              <ArrowDown className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                              <ArrowUp className="w-3 h-3" /> Healthy
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{item.last_inward}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${
                            item.aging_days > 60 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.aging_days}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
