import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Store, Search, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_STORE_IN_HAND_STOCK_API } from "@/utils/api/store.api";

export default function InHandStockPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState([]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(GET_STORE_IN_HAND_STOCK_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStockItems(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching in-hand stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [refreshKey]);

  const filteredItems = stockItems.filter((item) =>
    item.boq_item_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <Store className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">In Hand Stock</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">View BOQ item-wise current stock and aging</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
            <input
              type="text"
              placeholder="Search by BOQ Item Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[var(--input-height)] pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col min-w-0">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
              <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      #
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      BOQ Item Name
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      BOQ Quantity
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      Total Inward Quantity
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      Aging (Days)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-layout-border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-[var(--table-cell-px)] py-[var(--space-10)] text-center text-slate-500">
                        <div className="flex flex-col items-center gap-[var(--space-3)]">
                          <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] animate-spin text-[var(--color-primary-top)]" />
                          <p className="text-[var(--text-sm)]">Loading In Hand Stock...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-[var(--table-cell-px)] py-[var(--space-10)] text-center text-slate-400 text-[var(--text-sm)]">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, i) => (
                      <tr key={item.boq_item_id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-slate-400 text-[var(--text-xs)] whitespace-nowrap">
                          {i + 1}
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] font-medium text-slate-800 whitespace-nowrap">
                          {item.boq_item_name}
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-slate-700 text-right whitespace-nowrap font-semibold">
                          {item.boq_qty} <span className="text-[var(--text-xs)] font-normal text-slate-400">{item.unit || ''}</span>
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-slate-700 text-right whitespace-nowrap font-semibold">
                          {item.total_inward_qty} <span className="text-[var(--text-xs)] font-normal text-slate-400">{item.unit || ''}</span>
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-right whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-[var(--space-2)] py-[var(--space-1)] rounded text-[var(--text-xs)] font-bold ${
                            item.aging > 60 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.aging}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
