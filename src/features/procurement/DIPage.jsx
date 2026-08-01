import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Truck, Plus, Search, Loader2, Edit3, Trash2, PackagePlus, Download } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_DIS_API, ADD_DI_API, GET_POS_API, GET_SITES_API } from "@/utils/ApiHelper";
import SideDrawer from "@/components/ui/SideDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/utils/authStorage";
import { saveAs } from "file-saver";

const EMPTY_ITEM = { po_item_id: "", quantity: "" };

export default function DIPage() {
  const user = useAuthStore((s) => s.user);

  // ── list state
  const [dis, setDis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── dropdown data
  const [pos, setPos] = useState([]);
  const [sites, setSites] = useState([]);
  
  // ── drawer + submit
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [poId, setPoId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [contactPersonSite, setContactPersonSite] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const [formErrors, setFormErrors] = useState({});

  // ─────────────────────────────────────────────────────────
  // Fetch lists
  // ─────────────────────────────────────────────────────────
  const fetchDIs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_DIS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDis(res.data.data);
      } else {
        setDis([]);
      }
    } catch (err) {
      console.error("Error fetching DIs:", err);
      setDis([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [poRes, siteRes] = await Promise.allSettled([
        apiClient.get(GET_POS_API),
        apiClient.get(GET_SITES_API)
      ]);
      
      if (poRes.status === "fulfilled") setPos(poRes.value.data?.data || []);
      if (siteRes.status === "fulfilled") setSites(siteRes.value.data?.data || []);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchDIs();
      fetchDropdowns();
    }, 0);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Drawer & Items helpers
  // ─────────────────────────────────────────────────────────
  const handleOpenAddDrawer = () => {
    setPoId("");
    setSiteId("");
    setContactPersonSite("");
    setItems([{ ...EMPTY_ITEM }]);
    setFormErrors({});
    setSubmitError("");
    setShowAddDrawer(true);
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) =>
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  // ─────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────
  const validateForm = () => {
    const err = {};
    if (!poId) err.poId = "PO is required";
    if (!siteId) err.siteId = "Site is required";

    const selectedPO = pos.find(p => String(p.po_id) === String(poId));
    const poMaterials = selectedPO?.items || [];

    items.forEach((item, i) => {
      if (!item.po_item_id) err[`item_${i}_material`] = "Material required";
      else {
        const poItem = poMaterials.find(pi => String(pi.po_item_id) === String(item.po_item_id));
        const maxQty = poItem ? parseFloat(poItem.quantity) : 0;
        const typedQty = parseFloat(item.quantity) || 0;
        
        const usedInOtherRows = items.reduce((acc, curr, currIdx) => {
          if (currIdx !== i && String(curr.po_item_id) === String(item.po_item_id)) {
            return acc + (parseFloat(curr.quantity) || 0);
          }
          return acc;
        }, 0);
        const remainingAvailable = maxQty - usedInOtherRows;

        if (!item.quantity || typedQty <= 0) {
          err[`item_${i}_quantity`] = "Valid quantity required";
        } else if (typedQty > remainingAvailable) {
          err[`item_${i}_quantity`] = `Max allowed is ${remainingAvailable}`;
        }
      }
    });

    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const currentUser = authStorage.getUser();
      const rawId = currentUser?.employeeId ?? currentUser?.employee_id ?? currentUser?.id ?? user?.employeeId ?? user?.employee_id ?? user?.id ?? null;
      const createdBy = rawId ? parseInt(rawId) : null;

      const payload = {
        po_id: parseInt(poId),
        site_id: parseInt(siteId),
        created_by: createdBy,
        items: items.map((it) => {
          const selectedPO = pos.find(p => String(p.po_id) === String(poId));
          const poItem = selectedPO?.items?.find(pi => String(pi.po_item_id) === String(it.po_item_id));
          return {
            boq_item_id: poItem?.boq_item_id ? parseInt(poItem.boq_item_id) : (poItem?.material_id ? parseInt(poItem.material_id) : null),
            quantity: parseFloat(it.quantity)
          };
        })
      };

      if (contactPersonSite) {
        payload.contact_person_site = contactPersonSite;
      }

      console.log("DI Submit Payload:", JSON.stringify(payload, null, 2));

      const res = await apiClient.post(ADD_DI_API, payload);
      if (res.data?.success) {
        setShowAddDrawer(false);
        fetchDIs();
      } else {
        setSubmitError(res.data?.message || "Failed to create DI");
      }
    } catch (err) {
      console.error("Error creating DI:", err);
      setSubmitError(err.response?.data?.message || "Error creating DI");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDIs = dis.filter(
    (d) =>
      d.di_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.po_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputCls = (hasErr) =>
    `w-full px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2604]/20 transition-all ${
      hasErr ? "border-red-400" : "border-slate-200 focus:border-[#DC2604]"
    }`;
  const labelCls = "block text-xs font-semibold text-slate-700 mb-1";

  const handleDownloadPDF = async (pdfUrl, fileName) => {
    if (!pdfUrl || pdfUrl === "null") {
      alert("PDF URL is not available from the backend.");
      return;
    }
    
    try {
      const baseUrl = import.meta.env.VITE_PUBLIC_URL || "https://rsxdgrq6-5000.inc1.devtunnels.ms/";
      const fullUrl = pdfUrl.startsWith("http") ? pdfUrl : (baseUrl.replace(/\/$/, '') + '/' + pdfUrl.replace(/^\//, ''));
      
      const response = await apiClient.get(fullUrl, {
        responseType: 'blob',
      });
      saveAs(response.data, fileName);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please check backend configuration.");
    }
  };

  const selectedPO = pos.find(p => String(p.po_id) === String(poId));
  const availableMaterials = selectedPO?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Truck className="w-7 h-7 text-[#DC2604]" />
              Dispatch Instructions
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage delivery & dispatch instructions</p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddDrawer}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create DI
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search DI or PO number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2604]/20 focus:border-[#DC2604] transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">DI Number</th>
                  <th className="px-6 py-4 font-semibold">PO Number</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Site</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold text-center">PDF</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#DC2604]" />
                        <p>Loading DIs...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredDIs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      No Dispatch Instructions found
                    </td>
                  </tr>
                ) : (
                  filteredDIs.map((di, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{di.di_number}</td>
                      <td className="px-6 py-4 text-slate-600">{di.po_number}</td>
                      <td className="px-6 py-4 text-slate-600">{di.project_name}</td>
                      <td className="px-6 py-4 text-slate-600">{di.site_name}</td>
                      <td className="px-6 py-4 text-slate-600">{di.created_by_name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(di.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleDownloadPDF(di.pdf_url || di.file_url || di.document_url, `DI_${di.di_number}.pdf`)}
                          title="Download PDF" 
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
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

      {/* Add DI Drawer */}
      <SideDrawer 
        isOpen={showAddDrawer} 
        onClose={() => !submitting && setShowAddDrawer(false)}
        title="Create Dispatch Instruction"
        icon={Truck}
        subtitle="Fill in the details to generate a new DI"
        submitText={submitting ? "Creating..." : "Create DI"}
        onSubmit={handleFormSubmit}
        loading={submitting}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Purchase Order *</label>
              <select
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                className={inputCls(formErrors.poId)}
              >
                <option value="">— Select PO —</option>
                {pos.map((p) => (
                  <option key={p.po_id} value={p.po_id}>
                    {p.po_number}
                  </option>
                ))}
              </select>
              {formErrors.poId && <p className="text-red-500 text-xs mt-1">{formErrors.poId}</p>}
            </div>

            <div>
              <label className={labelCls}>Site *</label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className={inputCls(formErrors.siteId)}
              >
                <option value="">— Select Site —</option>
                {sites.map((s) => (
                  <option key={s.site_id} value={s.site_id}>
                    {s.site_name}
                  </option>
                ))}
              </select>
              {formErrors.siteId && <p className="text-red-500 text-xs mt-1">{formErrors.siteId}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Contact Person Site (Optional)</label>
            <input
              type="text"
              value={contactPersonSite}
              onChange={(e) => setContactPersonSite(e.target.value)}
              placeholder="e.g. Ramesh Kumar / 9876543210"
              className={inputCls(false)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Items *
              </p>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2604] hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-xl bg-white space-y-3 relative"
                >
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <p className="text-xs font-semibold text-slate-400">Item {idx + 1}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Material *</label>
                      <select
                        value={item.po_item_id}
                        onChange={(e) => updateItem(idx, "po_item_id", e.target.value)}
                        className={inputCls(formErrors[`item_${idx}_material`])}
                      >
                        <option value="">— Select Material —</option>
                        {availableMaterials.map((m) => {
                          const maxQty = parseFloat(m.quantity) || 0;
                          const usedInOtherRows = items.reduce((acc, curr, currIdx) => {
                            if (currIdx !== idx && String(curr.po_item_id) === String(m.po_item_id)) {
                              return acc + (parseFloat(curr.quantity) || 0);
                            }
                            return acc;
                          }, 0);
                          const remainingAvailable = maxQty - usedInOtherRows;

                          if (remainingAvailable <= 0 && String(item.po_item_id) !== String(m.po_item_id)) {
                            return null;
                          }

                          return (
                            <option key={m.po_item_id} value={m.po_item_id}>
                              ID: {m.po_item_id} - {m.material_code ? `${m.material_code} - ` : ""}{m.material_name || m.item_description}
                            </option>
                          );
                        })}
                      </select>
                      {formErrors[`item_${idx}_material`] && (
                        <p className="text-red-500 text-xs mt-1">{formErrors[`item_${idx}_material`]}</p>
                      )}
                      {!poId && <p className="text-slate-400 text-2xs mt-1">Select a PO first</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseFloat(val) >= 0) {
                            updateItem(idx, "quantity", val);
                          }
                        }}
                        placeholder="0"
                        className={inputCls(formErrors[`item_${idx}_quantity`])}
                      />
                      {formErrors[`item_${idx}_quantity`] && (
                        <p className="text-red-500 text-xs mt-1">{formErrors[`item_${idx}_quantity`]}</p>
                      )}
                      {(() => {
                        if (!selectedPO || !item.po_item_id) return null;
                        const poItem = (selectedPO.items || []).find(pi => String(pi.po_item_id) === String(item.po_item_id));
                        if (!poItem) return null;

                        const maxQty = parseFloat(poItem.quantity) || 0;
                        const usedInOtherRows = items.reduce((acc, curr, currIdx) => {
                          if (currIdx !== idx && String(curr.po_item_id) === String(item.po_item_id)) {
                            return acc + (parseFloat(curr.quantity) || 0);
                          }
                          return acc;
                        }, 0);
                        const remainingAvailable = maxQty - usedInOtherRows;
                        const typedQty = parseFloat(item.quantity) || 0;
                        const remaining = remainingAvailable - typedQty;

                        if (remaining < 0) {
                          return <p className="text-red-500 text-xs mt-1 font-semibold">Exceeds PO limit by {Math.abs(remaining)}</p>;
                        } else {
                          return <p className="text-emerald-600 text-xs mt-1 font-semibold">Remaining: {remaining}</p>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {submitError}
            </div>
          )}

        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
