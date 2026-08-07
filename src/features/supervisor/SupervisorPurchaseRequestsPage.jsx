import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { FileText, Plus, Loader2, AlertCircle, X, Trash2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { 
  GET_SUPERVISOR_PURCHASE_REQUESTS_API, 
  GET_SUPERVISOR_PROJECTS_API, 
  GET_SUPERVISOR_SITES_API, 
  GET_SUPERVISOR_BOQ_ITEMS_API 
} from "@/utils/api/hr.api";
import SideDrawer from "@/components/ui/SideDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/utils/authStorage";

export default function SupervisorPurchaseRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  const [formData, setFormData] = useState({
    project_id: "",
    site_id: "",
    items: [
      { boq_item_id: "", quantity: "", remarks: "" }
    ]
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_SUPERVISOR_PURCHASE_REQUESTS_API);
      if (res.data?.success) {
        setRequests(res.data.data || []);
      } else {
        setError(res.data?.message || "Failed to load purchase requests.");
      }
    } catch (err) {
      console.error("Error fetching purchase requests:", err);
      setError("Failed to load purchase requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [projRes, siteRes, boqRes] = await Promise.all([
        apiClient.get(GET_SUPERVISOR_PROJECTS_API),
        apiClient.get(GET_SUPERVISOR_SITES_API),
        apiClient.get(GET_SUPERVISOR_BOQ_ITEMS_API)
      ]);
      if (projRes.data?.success) setProjects(projRes.data.data || []);
      if (siteRes.data?.success) setSites(siteRes.data.data || []);
      if (boqRes.data?.success) setBoqItems(boqRes.data.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "project_id") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        site_id: "", // Reset site when project changes
        items: [{ boq_item_id: "", quantity: "", remarks: "" }] // Reset items when project changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { boq_item_id: "", quantity: "", remarks: "" }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.project_id || !formData.site_id || formData.items.length === 0) {
      setFormError("Please fill required fields (Project, Site) and add at least one item.");
      return;
    }
    
    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.boq_item_id || !item.quantity) {
        setFormError(`Item ${i + 1} is missing BOQ Item or Quantity.`);
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const currentUser = authStorage.getUser();
      const rawId = currentUser?.employeeId ?? currentUser?.employee_id ?? currentUser?.id ?? user?.employeeId ?? user?.employee_id ?? user?.id ?? null;
      const emp_id = rawId ? parseInt(rawId) : null;

      const payload = {
        project_id: parseInt(formData.project_id),
        site_id: parseInt(formData.site_id),
        requested_by: emp_id,
        status: "pending",
        items: formData.items.map(item => ({
          boq_item_id: parseInt(item.boq_item_id),
          quantity: parseFloat(item.quantity),
          remarks: item.remarks || ""
        }))
      };
      
      console.log("Submitting PR payload:", JSON.stringify(payload, null, 2));
      
      const res = await apiClient.post(GET_SUPERVISOR_PURCHASE_REQUESTS_API, payload);
      if (res.data?.success) {
        setShowModal(false);
        setFormData({
          project_id: "",
          site_id: "",
          items: [{ boq_item_id: "", quantity: "", remarks: "" }]
        });
        fetchRequests(); // refresh list
      } else {
        setFormError(res.data?.message || "Failed to create request.");
      }
    } catch (err) {
      console.error("Error creating request:", err);
      setFormError(err.response?.data?.message || "An error occurred while creating the request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-6)] max-w-[var(--content-max-width)] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FileText className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Purchase Requests</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">Manage your material requests for the site.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button 
              onClick={() => setShowModal(true)}
              className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
              <span>Create Request</span>
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-[var(--space-12)] space-y-[var(--space-3)]">
            <Loader2 className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-[var(--color-primary-top)] animate-spin" />
            <p className="text-[var(--text-xs)] font-medium text-slate-500">Loading purchase requests...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-[var(--card-padding)] bg-rose-50 border border-rose-200 rounded-[var(--radius-xl)] flex flex-wrap items-center justify-between gap-[var(--space-3)] text-rose-800 text-[var(--text-sm)]">
            <div className="flex items-center gap-[var(--space-3)]">
              <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] text-[var(--color-primary-top)] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={fetchRequests} className="btn-3d-primary px-[var(--space-4)] h-[var(--btn-height-sm)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Table / Empty State */}
        {!loading && !error && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] shadow-sm overflow-hidden flex flex-col min-w-0">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      PR Number
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Requested At
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Project ID
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-layout-border)] bg-white">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-[var(--table-cell-px)] py-[var(--space-12)] text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-[var(--space-12)] h-[var(--space-12)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-3)]">
                            <FileText className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
                          </div>
                          <p className="text-[var(--text-sm)]">No purchase requests found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.pr_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{req.pr_number}</span>
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                          {new Date(req.requested_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap text-slate-600">
                          {req.project_id || "-"}
                        </td>
                        <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] whitespace-nowrap">
                          <span className={`inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Request Modal / Side Panel */}
      <SideDrawer
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormError("");
        }}
        title="Create Purchase Request"
        subtitle="Submit a new material request for approval"
        icon={Plus}
        submitText="Create Request"
        onSubmit={handleSubmit}
        loading={submitLoading}
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="p-[var(--space-3)] bg-rose-50 text-rose-700 rounded-[var(--radius-md)] text-[var(--text-sm)] flex items-start gap-[var(--space-2)]">
            <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
              required
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
              Site <span className="text-red-500">*</span>
            </label>
            <select
              name="site_id"
              value={formData.site_id}
              onChange={handleInputChange}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
              required
            >
              <option value="">Select Site</option>
              {sites.filter(s => !s.project_id || s.project_id == formData.project_id).map((s) => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-[var(--space-6)] mb-[var(--space-2)] flex items-center justify-between">
          <h4 className="text-[var(--text-sm)] font-bold text-slate-800">Requested Items</h4>
          <button
            type="button"
            onClick={addItem}
            className="text-[var(--color-primary-top)] hover:bg-red-50 px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold transition-colors flex items-center gap-[var(--space-1)]"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>

        <div className="space-y-[var(--space-4)]">
          {formData.items.map((item, index) => (
            <div key={index} className="p-[var(--space-4)] bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] relative">
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-[var(--space-2)] right-[var(--space-2)] p-[var(--space-1)] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)] mb-[var(--space-3)]">
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
                    BOQ Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={item.boq_item_id}
                    onChange={(e) => handleItemChange(index, "boq_item_id", e.target.value)}
                    className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                    required
                  >
                    <option value="">Select BOQ Item</option>
                    {boqItems.filter(boq => !boq.project_id || boq.project_id == formData.project_id).map((boq) => (
                      <option key={boq.boq_item_id} value={boq.boq_item_id}>
                        {boq.boq_item_name || boq.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                    placeholder="Qty"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
                  Remarks
                </label>
                <input
                  type="text"
                  value={item.remarks}
                  onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                  className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                  placeholder="Optional remarks"
                />
              </div>
            </div>
          ))}
        </div>
      </SideDrawer>

    </DashboardLayout>
  );
}
