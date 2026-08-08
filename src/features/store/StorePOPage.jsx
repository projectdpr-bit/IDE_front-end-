import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Loader2, Search, FileText, UploadCloud } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_STORE_DISPATCH_ITEMS_API } from "@/utils/ApiHelper";
import InwardVerificationModal from "./components/InwardVerificationModal";

export default function StorePOPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [dispatchItems, setDispatchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchDispatchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(GET_STORE_DISPATCH_ITEMS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDispatchItems(res.data.data);
      } else {
        setDispatchItems([]);
      }
    } catch (err) {
      console.error("Error fetching dispatch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDispatchItems();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const filteredItems = dispatchItems.filter(item => 
    item.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.di_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="
              w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)]
              rounded-[var(--radius-lg)]
              bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)]
              flex items-center justify-center
              shadow-[0_4px_12px_var(--color-primary-shadow)]
            ">
              <FileText className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Dispatch Items (PO)</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">
                Items dispatched from procurement pending for inward
              </p>
            </div>
          </div>
        </div>

        {/* Filters / Search Bar */}
        <div className="flex flex-wrap gap-[var(--space-3)] bg-white p-[var(--card-padding)] rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
            <input
              type="text"
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
              placeholder="Search by PO, DI, Project..."
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
            <table className="w-full min-w-[800px] border-collapse text-[var(--text-sm)]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    PO Number
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    DI Number & Date
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Project
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Item Name
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                    Qty
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-[var(--space-10)] text-slate-500">
                      <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] animate-spin mx-auto text-[var(--color-primary-top)]" />
                      <p className="mt-[var(--space-2)] text-[var(--text-sm)]">Loading dispatch items...</p>
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr key={`${item.po_number}-${item.di_number}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <span className="font-medium text-[var(--color-primary-top)]">{item.po_number}</span>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <div className="font-medium">{item.di_number}</div>
                        <div className="text-[var(--text-xs)] text-slate-500">
                          {item.di_date ? new Date(item.di_date).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <div className="font-medium truncate max-w-[200px]" title={item.project_name}>{item.project_name}</div>
                        <div className="text-[var(--text-xs)] text-slate-500">{item.project_code}</div>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)]">
                        {item.item_name}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right font-medium">
                        {item.qty}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        <button
                          title="Upload Invoice for Inward"
                          onClick={() => {
                            setSelectedPO(item);
                            setShowInwardModal(true);
                          }}
                          className="
                            btn-3d-secondary
                            px-[var(--space-3)] h-[var(--btn-height-sm)]
                            rounded-[var(--radius-md)]
                            text-[var(--text-xs)] font-medium
                            inline-flex items-center gap-[var(--space-2)]
                            cursor-pointer
                            hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200
                            transition-colors duration-200
                          "
                        >
                          <UploadCloud className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                          <span>Upload Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-[var(--space-10)] text-[var(--text-sm)] text-slate-500">
                      No dispatch items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <InwardVerificationModal
        isOpen={showInwardModal}
        onClose={() => setShowInwardModal(false)}
        selectedPO={selectedPO}
        onSuccess={() => {
          fetchDispatchItems(); // Refresh the list
        }}
      />
    </DashboardLayout>
  );
}
