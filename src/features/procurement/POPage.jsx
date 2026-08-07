import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { FileText, Plus, Search, Loader2, Trash2, PackagePlus, Edit3, Download } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_POS_API, ADD_PO_API, GET_VENDORS_API, GET_PROJECT_API, GET_BOQ_ITEMS_API } from "@/utils/ApiHelper";
import SideDrawer from "@/components/ui/SideDrawer";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/utils/authStorage";
import { saveAs } from "file-saver";
import { formatIndianCurrency } from "@/utils/formatters";

// ─── helpers ────────────────────────────────────────────────
const EMPTY_PROJECT_ITEM = { material_id: "", quantity: "", unit_price: "" };
const EMPTY_OFFICE_ITEM = { item_description: "", unit: "", quantity: "", unit_price: "" };

function formatCurrency(val) {
  return formatIndianCurrency(val);
}

// ─── Component ───────────────────────────────────────────────
export default function POPage() {
  const user = useAuthStore((s) => s.user);

  // ── list state
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── drawer + submit
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── dropdown data
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);

  // ── form state
  const [poType, setPoType] = useState("project");
  const [vendorId, setVendorId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isAdvance, setIsAdvance] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [completionPeriod, setCompletionPeriod] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_PROJECT_ITEM }]);
  
  // ── billing state
  const [taxType, setTaxType] = useState("cgst_sgst"); // 'cgst_sgst' or 'igst'
  const [taxRate, setTaxRate] = useState(18); // Default 18%

  // ── field errors
  const [errors, setErrors] = useState({});

  // ─────────────────────────────────────────────────────────
  // Fetch lists
  // ─────────────────────────────────────────────────────────
  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(GET_POS_API);
      setPos(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setPos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const vRes = await apiClient.get(GET_VENDORS_API).catch(() => ({ data: { data: [] } }));
      const pRes = await apiClient.get(GET_PROJECT_API).catch(() => ({ data: { data: [] } }));
      const mRes = await apiClient.get(GET_BOQ_ITEMS_API).catch((err) => {
        console.error("Error fetching BOQ Items:", err);
        return { data: { data: [] } };
      });

      setVendors(vRes.data?.data || []);
      setProjects(pRes.data?.data || []);
      setMaterials(mRes.data?.data || []);
    } catch {
      // silently ignore – selects stay empty
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPOs();
      fetchDropdowns();
    }, 0);
  }, []);

  // ─────────────────────────────────────────────────────────
  // Drawer helpers
  // ─────────────────────────────────────────────────────────
  const openDrawer = () => {
    setPoType("project");
    setVendorId("");
    setProjectId("");
    setIsAdvance(false);
    setPaymentTerms("");
    setCompletionPeriod("");
    setContactPerson("");
    setContactEmail("");
    setItems([{ ...EMPTY_PROJECT_ITEM }]);
    setTaxType("cgst_sgst");
    setTaxRate(18);
    setErrors({});
    setSubmitError("");
    setShowDrawer(true);
  };

  // switch po_type → reset items
  const handlePoTypeChange = (type) => {
    setPoType(type);
    setItems(type === "project" ? [{ ...EMPTY_PROJECT_ITEM }] : [{ ...EMPTY_OFFICE_ITEM }]);
    setErrors({});
  };

  // ─── item line helpers
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      poType === "project" ? { ...EMPTY_PROJECT_ITEM } : { ...EMPTY_OFFICE_ITEM },
    ]);

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) =>
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  // ─────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!vendorId) err.vendorId = "Vendor is required";
    if (poType === "project" && !projectId) err.projectId = "Project is required";

    items.forEach((item, i) => {
      if (poType === "project") {
        if (!item.material_id) err[`item_${i}_material`] = "Material required";
        if (!item.quantity) err[`item_${i}_quantity`] = "Qty required";
        if (!item.unit_price) err[`item_${i}_unit_price`] = "Price required";
      } else {
        if (!item.item_description) err[`item_${i}_desc`] = "Description required";
        if (!item.unit) err[`item_${i}_unit`] = "Unit required";
        if (!item.quantity) err[`item_${i}_quantity`] = "Qty required";
        if (!item.unit_price) err[`item_${i}_unit_price`] = "Price required";
      }
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ─────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      // ── Get employee_id from localStorage (most reliable source)
      const currentUser = authStorage.getUser();
      const rawId = currentUser?.employeeId ?? currentUser?.employee_id ?? currentUser?.id ?? user?.employeeId ?? user?.employee_id ?? user?.id ?? null;
      const createdBy = rawId ? parseInt(rawId) : null;

      const subTotal = items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0);
      const taxAmount = (subTotal * taxRate) / 100;
      const grandTotal = subTotal + taxAmount;

      let payload;

      if (poType === "project") {
        payload = {
          po_type: "project",
          project_id: parseInt(projectId),
          vendor_id: parseInt(vendorId),
          created_by: createdBy,
          sub_total: subTotal,
          tax_type: taxType,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: grandTotal,
          is_advance_included: isAdvance,
          items: items.map((it) => ({
            boq_item_id: parseInt(it.material_id),
            quantity: parseFloat(it.quantity),
            unit_price: parseFloat(it.unit_price),
          })),
        };

        if (contactPerson) payload.contact_person = contactPerson;
        if (contactEmail) payload.contact_email = contactEmail;

        if (isAdvance && (paymentTerms || completionPeriod)) {
          payload.special_conditions = {};
          if (paymentTerms) payload.special_conditions.payment_terms = paymentTerms;
          if (completionPeriod) payload.special_conditions.completion_period = completionPeriod;
        }
      } else {
        payload = {
          po_type: "office",
          vendor_id: parseInt(vendorId),
          created_by: createdBy,
          sub_total: subTotal,
          tax_type: taxType,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: grandTotal,
          items: items.map((it) => ({
            item_description: it.item_description,
            unit: it.unit,
            quantity: parseFloat(it.quantity),
            unit_price: parseFloat(it.unit_price),
          })),
        };
      }

      // ── Debug: log payload before sending
      console.log("[PO Submit] Payload →", JSON.stringify(payload, null, 2));

      const res = await apiClient.post(ADD_PO_API, payload);
      if (res.data?.success) {
        setShowDrawer(false);
        fetchPOs();
      } else {
        setSubmitError(res.data?.message || "Failed to create PO");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Error creating PO");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────────────────
  const filteredPOs = pos.filter((p) =>
    p.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputCls = (hasErr) =>
    `w-full px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2604]/20 transition-all ${hasErr ? "border-red-400" : "border-slate-200 focus:border-[#DC2604]"
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

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FileText className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Purchase Orders</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Manage purchase orders and view details</p>
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openDrawer}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create PO
            </button>
          </div>
        </div>

        {/* ── Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2604]/20 focus:border-[#DC2604] transition-all"
            />
          </div>
        </div>

        {/* ── Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">PO Number</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Vendor</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold text-center">PDF</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#DC2604]" />
                        <p>Loading Purchase Orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                      No Purchase Orders found
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po, i) => (
                    <tr key={po.po_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{po.po_number}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${po.po_type === "project" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
                          }`}>
                          {po.po_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{po.vendor_name}</td>
                      <td className="px-6 py-4 text-slate-600">{po.project_name || "—"}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{formatCurrency(po.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${po.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                          po.status === "pending" ? "bg-amber-100 text-amber-700" :
                            po.status === "draft" ? "bg-slate-100 text-slate-600" :
                              "bg-slate-100 text-slate-700"
                          }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{po.created_by_name}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          title="Download PDF"
                          onClick={() => handleDownloadPDF(po.pdf_url || po.file_url || po.document_url, `PO_${po.po_number}.pdf`)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Edit PO"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete PO"
                            className="p-1.5 text-[#DC2604]/70 hover:text-[#DC2604] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
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

      {/* ════════════════════════════════════════
          Create PO Drawer
      ════════════════════════════════════════ */}
      <SideDrawer
        isOpen={showDrawer}
        onClose={() => !submitting && setShowDrawer(false)}
        title="Create Purchase Order"
        icon={FileText}
        subtitle="Fill in the details to generate a new PO"
        submitText={submitting ? "Creating..." : "Create PO"}
        onSubmit={handleSubmit}
        loading={submitting}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">

          {/* ── PO Type Toggle */}
          <div>
            <label className={labelCls}>PO Type *</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 w-fit">
              {["project", "office"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePoTypeChange(type)}
                  className={`px-5 py-2 text-xs font-bold capitalize transition-all ${poType === type
                    ? "bg-[#DC2604] text-white shadow-sm"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ── Vendor */}
          <div>
            <label className={labelCls}>Vendor *</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className={inputCls(errors.vendorId)}
            >
              <option value="">— Select Vendor —</option>
              {vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
              ))}
            </select>
            {errors.vendorId && <p className="text-red-500 text-xs mt-1">{errors.vendorId}</p>}
          </div>

          {/* ── Project (only for project type) */}
          {poType === "project" && (
            <div>
              <label className={labelCls}>Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={inputCls(errors.projectId)}
              >
                <option value="">— Select Project —</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_code} – {p.project_name}
                  </option>
                ))}
              </select>
              {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>}
            </div>
          )}

          {/* ── Contact Details (only project) */}
          {poType === "project" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Contact Person (Optional)</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Vivek Gupta/9910026776"
                  className={inputCls(false)}
                />
              </div>
              <div>
                <label className={labelCls}>Contact Email (Optional)</label>
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. scm@iedinfra.com"
                  className={inputCls(false)}
                />
              </div>
            </div>
          )}

          {/* ── Advance (only project) */}
          {poType === "project" && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <input
                id="is_advance"
                type="checkbox"
                checked={isAdvance}
                onChange={(e) => setIsAdvance(e.target.checked)}
                className="w-4 h-4 accent-[#DC2604] cursor-pointer"
              />
              <label htmlFor="is_advance" className="text-xs font-semibold text-amber-800 cursor-pointer select-none">
                Include Advance Payment
              </label>
            </div>
          )}

          {/* ── Special Conditions (only project and if advance is included) */}
          {poType === "project" && isAdvance && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Special Conditions (Optional)</p>
              <div>
                <label className={labelCls}>Payment Terms</label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. 10% payment shall be released as advance..."
                  className={inputCls(false) + " resize-none"}
                />
              </div>
              <div>
                <label className={labelCls}>Completion Period</label>
                <textarea
                  rows={2}
                  value={completionPeriod}
                  onChange={(e) => setCompletionPeriod(e.target.value)}
                  placeholder="e.g. Within 4-5 weeks from date of release..."
                  className={inputCls(false) + " resize-none"}
                />
              </div>
            </div>
          )}

          {/* ── Items */}
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
                  {/* Remove button */}
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

                  {poType === "project" ? (
                    /* ─ Project item fields */
                    <>
                      <div>
                        <label className={labelCls}>Material *</label>
                        <select
                          value={item.material_id}
                          onChange={(e) => updateItem(idx, "material_id", e.target.value)}
                          className={inputCls(errors[`item_${idx}_material`])}
                        >
                          <option value="">— Select Material / BOQ —</option>
                          {materials.map((m) => (
                            <option key={m.boq_item_id || m.material_id} value={m.boq_item_id || m.material_id}>
                              {m.item_code || m.material_code} - {m.description || m.material_name}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${idx}_material`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_material`]}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Quantity *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            placeholder="0"
                            className={inputCls(errors[`item_${idx}_quantity`])}
                          />
                          {errors[`item_${idx}_quantity`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_quantity`]}</p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>Unit Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                            placeholder="0.00"
                            className={inputCls(errors[`item_${idx}_unit_price`])}
                          />
                          {errors[`item_${idx}_unit_price`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_unit_price`]}</p>
                          )}
                        </div>
                      </div>
                      {item.quantity && item.unit_price && (
                        <p className="text-xs text-right font-semibold text-slate-700">
                          Line Total: {formatCurrency(parseFloat(item.quantity) * parseFloat(item.unit_price))}
                        </p>
                      )}
                    </>
                  ) : (
                    /* ─ Office item fields */
                    <>
                      <div>
                        <label className={labelCls}>Item Description *</label>
                        <input
                          type="text"
                          value={item.item_description}
                          onChange={(e) => updateItem(idx, "item_description", e.target.value)}
                          placeholder="e.g. Printer Paper A4 Bundle"
                          className={inputCls(errors[`item_${idx}_desc`])}
                        />
                        {errors[`item_${idx}_desc`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_desc`]}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={labelCls}>Unit *</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(idx, "unit", e.target.value)}
                            placeholder="Box, Nos..."
                            className={inputCls(errors[`item_${idx}_unit`])}
                          />
                          {errors[`item_${idx}_unit`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_unit`]}</p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>Qty *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            placeholder="0"
                            className={inputCls(errors[`item_${idx}_quantity`])}
                          />
                          {errors[`item_${idx}_quantity`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_quantity`]}</p>
                          )}
                        </div>
                        <div>
                          <label className={labelCls}>Unit Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                            placeholder="0.00"
                            className={inputCls(errors[`item_${idx}_unit_price`])}
                          />
                          {errors[`item_${idx}_unit_price`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_unit_price`]}</p>
                          )}
                        </div>
                      </div>
                      {item.quantity && item.unit_price && (
                        <p className="text-xs text-right font-semibold text-slate-700">
                          Line Total: {formatCurrency(parseFloat(item.quantity) * parseFloat(item.unit_price))}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* ── Billing Section */}
            {items.some((it) => it.quantity && it.unit_price) && (
              <div className="mt-6 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Billing Summary</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Tax Type</label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value)}
                      className={inputCls(false)}
                    >
                      <option value="cgst_sgst">CGST + SGST</option>
                      <option value="igst">IGST</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tax Rate</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className={inputCls(false)}
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% {taxType === 'cgst_sgst' ? '(9% CGST + 9% SGST)' : ''}</option>
                      <option value={28}>28% {taxType === 'cgst_sgst' ? '(14% CGST + 14% SGST)' : ''}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Sub Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0))}
                    </span>
                  </div>
                  
                  {taxType === "cgst_sgst" ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST ({taxRate / 2}%):</span>
                        <span className="font-semibold">
                          {formatCurrency((items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0) * taxRate) / 200)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST ({taxRate / 2}%):</span>
                        <span className="font-semibold">
                          {formatCurrency((items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0) * taxRate) / 200)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST ({taxRate}%):</span>
                      <span className="font-semibold">
                        {formatCurrency((items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0) * taxRate) / 100)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-lg font-bold text-[#DC2604]">
                    <span>Grand Total:</span>
                    <span>
                      {formatCurrency(
                        items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0) * (1 + taxRate / 100)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Submit error */}
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
