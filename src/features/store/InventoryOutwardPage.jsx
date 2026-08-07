import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ArrowUpRight, Search, Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import apiClient from "@/lib/axios";
import { STORE_STOCK_OUTWARD_API } from "@/utils/ApiHelper";
import ManualOutwardPanel from "./components/ManualOutwardPanel";

export default function InventoryOutwardPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [outwardLogs, setOutwardLogs] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isManualPanelOpen, setIsManualPanelOpen] = useState(false);

  const fetchOutwardLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(STORE_STOCK_OUTWARD_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOutwardLogs(res.data.data);
      } else {
        setOutwardLogs([]);
      }
    } catch (err) {
      console.error("Error fetching outward logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutwardLogs();
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

  const filteredLogs = outwardLogs.filter((log) =>
    (log.outward_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.store_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.site_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.issued_to_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.issued_by_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.remarks || "").toLowerCase().includes(searchQuery.toLowerCase())
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
              <ArrowUpRight className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Outward Logs</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">
                History of all material issuance (Outward) to Sites / Engineers
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button 
              onClick={() => setIsManualPanelOpen(true)}
              className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
              New Outward
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-[var(--space-3)] bg-white p-[var(--card-padding)] rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
            <input
              type="text"
              placeholder="Search by Outward No, Store, Site, Issued To..."
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
                    Outward Number
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Store Name
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Site Name
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Issued To
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Issued By
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Issued At
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Remarks
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
                      <p className="mt-[var(--space-2)] text-[var(--text-sm)]">Loading Outward Logs...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-[var(--space-10)] text-[var(--text-sm)] text-slate-500">
                      No Outward Logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => {
                    const isExpanded = expandedRows.has(log.outward_id);
                    const itemsCount = log.total_items ?? (log.items ? log.items.length : 0);

                    return (
                      <React.Fragment key={log.outward_id || i}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] text-slate-400 border-b border-[var(--color-layout-border)]">
                            {i + 1}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] font-semibold text-[var(--color-primary-top)] border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.outward_number}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.store_name || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.site_name || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            <div className="font-medium">{log.issued_to_name || "—"}</div>
                            {log.issue_type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize mt-0.5">
                                {log.issue_type}
                              </span>
                            )}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.issued_by_name || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                            {log.issued_at ? new Date(log.issued_at).toLocaleString() : "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-600 border-b border-[var(--color-layout-border)] max-w-xs truncate" title={log.remarks}>
                            {log.remarks || "—"}
                          </td>
                          <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => toggleRow(log.outward_id)}
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
                                      <th className="py-2.5 px-4">BOQ Item</th>
                                      <th className="py-2.5 px-4">Batch Number</th>
                                      <th className="py-2.5 px-4 text-right">Quantity</th>
                                      <th className="py-2.5 px-4">Unit</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {log.items.map((item) => (
                                      <tr key={item.outward_item_id || item.material_id} className="text-xs">
                                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                                          <div>{item.material_name}</div>
                                          {item.material_code && (
                                            <div className="text-[10px] text-slate-400 font-mono">{item.material_code}</div>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-600">{item.boq_item_name || "—"}</td>
                                        <td className="py-2.5 px-4 text-slate-600 font-mono">{item.batch_number || "—"}</td>
                                        <td className="py-2.5 px-4 font-bold text-slate-900 text-right">{item.quantity}</td>
                                        <td className="py-2.5 px-4 text-slate-500">{item.unit}</td>
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
      
      {/* Manual Outward Side Panel */}
      <ManualOutwardPanel 
        isOpen={isManualPanelOpen} 
        onClose={() => setIsManualPanelOpen(false)} 
        onSuccess={() => {
          fetchOutwardLogs();
        }}
      />
    </DashboardLayout>
  );
}
