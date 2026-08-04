import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ArrowDownLeft, Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import apiClient from "@/lib/axios";
import { STORE_STOCK_INWARD_API } from "@/utils/ApiHelper";

export default function InventoryInwardPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inwardLogs, setInwardLogs] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchInwardLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(STORE_STOCK_INWARD_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInwardLogs(res.data.data);
      } else {
        setInwardLogs([]);
      }
    } catch (err) {
      console.error("Error fetching inward logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInwardLogs();
  }, []);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredLogs = inwardLogs.filter((log) =>
    (log.inward_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.vendor_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.po_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.store_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="
              w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)]
              rounded-[var(--radius-lg)]
              bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)]
              flex items-center justify-center
              shadow-[0_4px_12px_var(--color-primary-shadow)]
            ">
              <ArrowDownLeft className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Inward Logs</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">
                History of all stock inward entries received at stores
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-[var(--space-3)] bg-white p-[var(--card-padding)] rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
            <input
              type="text"
              placeholder="Search by Inward No, Vendor, Invoice, PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full h-[var(--input-height)]
                pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)]
                rounded-[var(--radius-xl)]
                border border-[var(--color-secondary-border)]
                bg-slate-50 text-[var(--text-sm)] text-slate-800
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
                transition-colors duration-150
              "
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
            <table className="w-full min-w-[800px] border-collapse text-[var(--text-sm)]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    #
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Inward Number
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Invoice Details
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Vendor
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    PO Number
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Store
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                    Amount
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Received By
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-layout-border)]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-[var(--space-10)] text-slate-500">
                      <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] animate-spin mx-auto text-[var(--color-primary-top)]" />
                      <p className="mt-[var(--space-2)] text-[var(--text-sm)]">Loading Inward Logs...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-[var(--space-10)] text-[var(--text-sm)] text-slate-500">
                      No Inward Logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => {
                    const isExpanded = expandedRows.has(log.inward_id);
                    const itemsCount = log.total_items ?? (log.items ? log.items.length : 0);

                    return (
                      <React.Fragment key={log.inward_id || i}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] text-slate-400 border-b border-[var(--color-layout-border)]">
                            {i + 1}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] font-semibold text-[var(--color-primary-top)] border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.inward_number}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            <div className="font-medium">{log.invoice_number}</div>
                            <div className="text-[var(--text-2xs)] text-slate-400">
                              {log.invoice_date ? new Date(log.invoice_date).toLocaleDateString() : "—"}
                            </div>
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.vendor_name || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.po_number || log.custom_po_number || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.store_name || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-800 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right font-medium">
                            ₹{log.invoice_amount ? Number(log.invoice_amount).toLocaleString('en-IN') : "0"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            <div className="font-medium">{log.received_by_name || "—"}</div>
                            <div className="text-[var(--text-2xs)] text-slate-400">
                              {log.received_at ? new Date(log.received_at).toLocaleString() : "—"}
                            </div>
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => toggleRow(log.inward_id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold transition-colors cursor-pointer text-xs"
                            >
                              <span>{itemsCount} Items</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Items Row */}
                        {isExpanded && log.items && log.items.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={9} className="py-4 px-5">
                              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="bg-slate-100/50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                                      <th className="py-2.5 px-4">Material Name & Code</th>
                                      <th className="py-2.5 px-4">HSN/SAC</th>
                                      <th className="py-2.5 px-4 text-right">Quantity</th>
                                      <th className="py-2.5 px-4">Unit</th>
                                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                                      <th className="py-2.5 px-4 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {log.items.map((item) => (
                                      <tr key={item.inward_item_id || item.material_id} className="text-xs">
                                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                                          <div>{item.material_name}</div>
                                          {item.material_code && (
                                            <div className="text-[10px] text-slate-400 font-mono">{item.material_code}</div>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-600 font-mono">{item.hsn_sac || "—"}</td>
                                        <td className="py-2.5 px-4 font-bold text-slate-900 text-right">{item.quantity}</td>
                                        <td className="py-2.5 px-4 text-slate-500">{item.unit}</td>
                                        <td className="py-2.5 px-4 text-slate-700 text-right font-medium">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 px-4 font-bold text-slate-900 text-right">
                                          ₹{Number(item.quantity * item.unit_price).toLocaleString('en-IN')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
