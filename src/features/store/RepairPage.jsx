import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Wrench, Search, Loader2, Info, Plus } from "lucide-react";
import apiClient from "@/lib/axios";
import { 
  GET_STORE_REPAIR_API, 
  GET_STORE_BOQ_ITEMS_API, 
  GET_STORE_STORES_API 
} from "@/utils/api/store.api";
import { formatIndianCurrency } from "@/utils/formatters";

function NewRepairPanel({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [boqItems, setBoqItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    boq_item_id: "",
    store_id: "",
    quantity: "",
    repair_agent_name: "",
    repair_agent_phone: "",
    repair_agent_company: "",
    repair_agent_address: "",
    reason: "",
    estimated_cost: "",
    sent_date: new Date().toISOString().split("T")[0],
    expected_return_date: "",
    remarks: ""
  });

  useEffect(() => {
    if (isOpen) {
      const fetchDropdowns = async () => {
        try {
          const [boqRes, storeRes] = await Promise.all([
            apiClient.get(GET_STORE_BOQ_ITEMS_API),
            apiClient.get(GET_STORE_STORES_API)
          ]);
          if (boqRes.data?.success) setBoqItems(boqRes.data.data);
          if (storeRes.data?.success) setStores(storeRes.data.data);
        } catch (err) {
          console.error("Error fetching form dropdowns:", err);
        }
      };
      fetchDropdowns();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        boq_item_id: Number(formData.boq_item_id),
        store_id: Number(formData.store_id),
        quantity: Number(formData.quantity),
        estimated_cost: Number(formData.estimated_cost),
      };
      const res = await apiClient.post(GET_STORE_REPAIR_API, payload);
      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.data?.message || "Failed to create repair");
      }
    } catch (err) {
      console.error("Error creating repair:", err);
      alert("Error submitting repair request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end transition-opacity" onClick={onClose}>
      <div className="w-[85vw] max-w-[500px] bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-(--card-padding) border-b border-layout-border bg-white sticky top-0 z-10">
          <h2 className="text-(--text-base) font-bold text-slate-800">New Repair</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-(--card-padding)">
          <form id="repairForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-(--space-4)">
              <div>
                <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">BOQ Item</label>
                <select name="boq_item_id" value={formData.boq_item_id} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none">
                  <option value="">Select Item</option>
                  {boqItems.map(item => (
                    <option key={item.boq_item_id} value={item.boq_item_id}>
                      {item.boq_item_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Store</label>
                <select name="store_id" value={formData.store_id} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none">
                  <option value="">Select Store</option>
                  {stores.map(store => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.store_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" placeholder="Enter quantity" />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-layout-border space-y-(--space-3)">
              <h3 className="text-(--text-sm) font-bold text-slate-700">Agent Details</h3>
              <div className="grid grid-cols-2 gap-(--space-3)">
                <div>
                  <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Agent Name</label>
                  <input type="text" name="repair_agent_name" value={formData.repair_agent_name} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" />
                </div>
                <div>
                  <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Phone Number</label>
                  <input type="text" name="repair_agent_phone" value={formData.repair_agent_phone} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Company</label>
                  <input type="text" name="repair_agent_company" value={formData.repair_agent_company} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Address</label>
                  <textarea name="repair_agent_address" value={formData.repair_agent_address} onChange={handleChange} required rows={2} className="w-full p-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none"></textarea>
                </div>
              </div>
            </div>

            <div>
              <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Reason for Repair</label>
              <textarea name="reason" value={formData.reason} onChange={handleChange} required rows={2} className="w-full p-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" placeholder="Describe the issue..."></textarea>
            </div>

            <div>
              <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Estimated Cost (₹)</label>
              <input type="number" step="0.01" name="estimated_cost" value={formData.estimated_cost} onChange={handleChange} required min="0" className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" placeholder="0.00" />
            </div>

            <div className="grid grid-cols-2 gap-(--space-4)">
              <div>
                <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Sent Date</label>
                <input type="date" name="sent_date" value={formData.sent_date} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" />
              </div>
              <div>
                <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Expected Return</label>
                <input type="date" name="expected_return_date" value={formData.expected_return_date} onChange={handleChange} required className="w-full h-(--input-height) px-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" />
              </div>
            </div>

            <div>
              <label className="text-(--text-xs) font-medium text-slate-600 mb-(--space-1) block">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="w-full p-(--space-3) rounded-lg border border-secondary-border bg-white text-(--text-sm) focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top outline-none" placeholder="Any additional notes..."></textarea>
            </div>

          </form>
        </div>
        <div className="p-(--card-padding) border-t border-layout-border bg-white flex justify-end gap-3 sticky bottom-0">
          <button type="button" onClick={onClose} className="btn-3d-secondary px-(--space-5) h-(--btn-height-md) rounded-lg text-(--text-sm) font-medium">Cancel</button>
          <button type="submit" form="repairForm" disabled={loading} className="btn-3d-primary px-(--space-5) h-(--btn-height-md) rounded-lg text-(--text-sm) font-medium flex items-center justify-center min-w-[100px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RepairPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [repairItems, setRepairItems] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showNewRepairPanel, setShowNewRepairPanel] = useState(false);

  const fetchRepairs = async () => {
    try {
      const res = await apiClient.get(GET_STORE_REPAIR_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRepairItems(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching repairs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredItems = repairItems.filter((item) =>
    item.repair_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.boq_item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.repair_agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.repair_agent_company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-(--space-4) max-w-(--content-max-width) w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <Wrench className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Repairs</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Track stock items sent out for repair</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-(--space-3)">
            <button 
              onClick={() => setShowNewRepairPanel(true)}
              className="btn-3d-primary px-(--space-5) h-(--btn-height-md) rounded-lg text-(--text-sm) font-medium flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-(--icon-sm) h-(--icon-sm)" />
              New Repair
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-(--space-3)">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-(--space-3) top-1/2 -translate-y-1/2 text-slate-400 w-(--icon-md) h-(--icon-md)" />
            <input
              type="text"
              placeholder="Search Repair No, Item, Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-(--input-height) pl-[calc(var(--space-3)*2+var(--icon-md))] pr-(--space-4) rounded-xl border border-secondary-border bg-white text-(--text-sm) text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-top/20 focus:border-primary-top transition-colors duration-150"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-(--space-4) overflow-hidden min-h-0 relative">
          
          {/* Table Area */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-xl border border-layout-border bg-white">
              <table className="w-full min-w-[900px] border-collapse text-(--text-sm)">
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-20 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border border-r whitespace-nowrap text-left">
                      Repair No
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left">
                      Store Name
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left">
                      BOQ Item Name
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-right">
                      Quantity (Unit)
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left">
                      Repair Agent
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left">
                      Reason
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left">
                      Status
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-right">
                      Est. Cost
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-center">
                      Sent - Expected
                    </th>
                    <th className="sticky top-0 z-10 px-(--table-cell-px) py-(--table-cell-py) text-(--text-xs) font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm border-b border-layout-border whitespace-nowrap text-left hidden md:table-cell">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-layout-border">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-(--table-cell-px) py-10 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-(--space-3)">
                          <Loader2 className="w-(--icon-lg) h-(--icon-lg) animate-spin text-primary-top" />
                          <p className="text-(--text-sm)">Loading Repairs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-(--table-cell-px) py-10 text-center text-slate-400 text-(--text-sm)">
                        No repair records found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, i) => (
                      <tr key={item.repair_id || i} className={`hover:bg-slate-50/50 transition-colors group ${selectedAgent?.repair_id === item.repair_id ? 'bg-slate-50' : ''}`}>
                        <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 px-(--table-cell-px) py-(--table-cell-py) font-medium text-primary-top border-r border-layout-border whitespace-nowrap transition-colors">
                          {item.repair_number}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-700 whitespace-nowrap">
                          {item.store_name}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) font-medium text-slate-800 whitespace-nowrap">
                          {item.boq_item_name}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-700 text-right whitespace-nowrap font-semibold">
                          {item.quantity} <span className="text-(--text-xs) font-normal text-slate-400">{item.unit || ''}</span>
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-700 whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedAgent(item)}
                            className="inline-flex items-center gap-1.5 text-primary-top hover:text-primary-bottom hover:underline font-semibold focus:outline-none cursor-pointer transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                            {item.repair_agent_name}
                          </button>
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-600 truncate max-w-[200px]" title={item.reason}>
                          {item.reason}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-(--space-3) py-(--space-1) rounded-full text-(--text-2xs) font-semibold uppercase tracking-wide ${
                            item.status === 'sent_for_repair' ? 'bg-amber-100 text-amber-700' : 
                            item.status === 'repaired' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-700 text-right whitespace-nowrap font-semibold">
                          {formatIndianCurrency(item.estimated_cost)}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-600 whitespace-nowrap text-center text-(--text-xs)">
                          {formatDate(item.sent_date)} <span className="text-slate-400 mx-1">-</span> {formatDate(item.expected_return_date)}
                        </td>
                        <td className="px-(--table-cell-px) py-(--table-cell-py) text-slate-600 whitespace-nowrap text-(--text-xs) hidden md:table-cell">
                          {item.created_by_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Centered Modal (Agent Details) */}
          {selectedAgent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedAgent(null)}>
              <div 
                className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-(--card-padding) border-b border-layout-border bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary-top">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-(--text-base) font-bold text-slate-800">Agent Details</h2>
                      <p className="text-(--text-2xs) text-slate-500">Repair vendor information</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAgent(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                    ✕
                  </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-(--card-padding) space-y-(--space-4)">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="text-(--text-xs) text-slate-500 font-medium uppercase tracking-wide mb-1">Agent Name</p>
                      <p className="text-(--text-sm) text-slate-800 font-semibold">{selectedAgent.repair_agent_name}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="text-(--text-xs) text-slate-500 font-medium uppercase tracking-wide mb-1">Company</p>
                      <p className="text-(--text-sm) text-slate-800 font-medium">{selectedAgent.repair_agent_company}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="text-(--text-xs) text-slate-500 font-medium uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-(--text-sm) text-primary-top font-bold tracking-wide">{selectedAgent.repair_agent_phone}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="text-(--text-xs) text-slate-500 font-medium uppercase tracking-wide mb-1">Address</p>
                      <p className="text-(--text-sm) text-slate-700 font-medium leading-relaxed">{selectedAgent.repair_agent_address}</p>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* New Repair Drawer */}
      <NewRepairPanel 
        isOpen={showNewRepairPanel} 
        onClose={() => setShowNewRepairPanel(false)}
        onSuccess={() => {
          setLoading(true);
          fetchRepairs();
          // Optionally show success toast here
        }}
      />
      
    </DashboardLayout>
  );
}
