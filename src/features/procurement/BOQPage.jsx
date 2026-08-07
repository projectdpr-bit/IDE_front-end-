import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { PackageSearch, Plus, Search, Loader2, Edit3, Trash2, FileUp, ListPlus, PlusCircle } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_BOQ_ITEMS_API, ADD_BOQ_ITEM_API, IMPORT_BOQ_ITEMS_API, GET_PROCUREMENT_PROJECTS_API } from "@/utils/ApiHelper";
import SideDrawer from "@/components/ui/SideDrawer";
import * as XLSX from "xlsx";
import { formatIndianCurrency } from "@/utils/formatters";

function formatCurrency(val) {
  return formatIndianCurrency(val);
}

export default function BOQPage() {
  const [boqItems, setBoqItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Single Add/Edit State
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    project_id: "",
    name: "",
    unit: "",
    boq_qty: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});

  // Multi Add State
  const [showMultiAddDrawer, setShowMultiAddDrawer] = useState(false);
  const [multiSubmitting, setMultiSubmitting] = useState(false);
  const [multiSubmitError, setMultiSubmitError] = useState("");
  const [multiFormData, setMultiFormData] = useState({
    project_id: "",
    items: [
      { name: "", item_type: "", unit: "", boq_qty: "" }
    ]
  });

  // Import State
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importFormData, setImportFormData] = useState({
    project_id: "",
    file: null,
  });

  const fetchBOQItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_BOQ_ITEMS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBoqItems(res.data.data);
      } else {
        setBoqItems([]);
      }
    } catch (err) {
      console.error("Error fetching BOQ Items:", err);
      setError("Failed to load BOQ Items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get(GET_PROCUREMENT_PROJECTS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchBOQItems();
      fetchProjects();
    }, 0);
  }, []);

  const handleOpenAddDrawer = (item = null) => {
    if (item) {
      setEditingId(item.boq_item_id);
      setFormData({
        project_id: item.project_id || "",
        name: item.name || item.description || "",
        unit: item.unit || "",
        boq_qty: item.boq_qty || "",
        status: item.status || "active",
      });
    } else {
      setEditingId(null);
      setFormData({
        project_id: "",
        name: "",
        unit: "",
        boq_qty: "",
        status: "active",
      });
    }
    setFormErrors({});
    setSubmitError("");
    setShowAddDrawer(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const err = {};
    if (!formData.project_id) err.project_id = "Project is required";
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.unit.trim()) err.unit = "Unit is required";
    if (!formData.boq_qty) err.boq_qty = "BOQ Qty is required";
    if (!formData.status) err.status = "Status is required";
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        project_id: parseInt(formData.project_id),
        name: formData.name,
        unit: formData.unit,
        boq_qty: parseFloat(formData.boq_qty),
        status: formData.status,
      };
      
      const url = editingId ? `${ADD_BOQ_ITEM_API}/${editingId}` : ADD_BOQ_ITEM_API;
      const method = editingId ? "put" : "post";

      const res = await apiClient[method](url, payload);
      if (res.data?.success) {
        setShowAddDrawer(false);
        fetchBOQItems();
      } else {
        setSubmitError(res.data?.message || `Failed to ${editingId ? "update" : "create"} BOQ Item`);
      }
    } catch (err) {
      console.error("Error saving BOQ Item:", err);
      setSubmitError(err.response?.data?.message || "Error saving BOQ Item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BOQ Item?")) return;
    try {
      const res = await apiClient.delete(`${ADD_BOQ_ITEM_API}/${id}`);
      if (res.data?.success) {
        fetchBOQItems();
      } else {
        alert(res.data?.message || "Failed to delete BOQ Item");
      }
    } catch (err) {
      console.error("Error deleting BOQ Item:", err);
      alert(err.response?.data?.message || "Error deleting BOQ Item");
    }
  };

  const handleMultiChange = (index, field, value) => {
    const newItems = [...multiFormData.items];
    newItems[index][field] = value;
    setMultiFormData(prev => ({ ...prev, items: newItems }));
  };

  const addMultiRow = () => {
    setMultiFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", item_type: "", unit: "", boq_qty: "" }]
    }));
  };

  const removeMultiRow = (index) => {
    if (multiFormData.items.length > 1) {
      setMultiFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleMultiSubmit = async (e) => {
    e.preventDefault();
    if (!multiFormData.project_id) {
      setMultiSubmitError("Please select a project.");
      return;
    }
    
    // validate items
    const validItems = multiFormData.items.filter(item => item.name && item.unit && item.boq_qty);
    if (validItems.length === 0) {
      setMultiSubmitError("Please add at least one valid item with Name, Unit, and BOQ Qty.");
      return;
    }

    setMultiSubmitting(true);
    setMultiSubmitError("");

    try {
      const payload = {
        project_id: parseInt(multiFormData.project_id),
        items: validItems.map(item => ({
          name: item.name,
          item_type: item.item_type || "",
          unit: item.unit,
          boq_qty: parseFloat(item.boq_qty)
        }))
      };

      const res = await apiClient.post(IMPORT_BOQ_ITEMS_API, payload);
      if (res.data?.success) {
        setShowMultiAddDrawer(false);
        fetchBOQItems();
      } else {
        setMultiSubmitError(res.data?.message || "Failed to add multiple BOQ Items");
      }
    } catch (err) {
      console.error("Error saving multiple BOQ Items:", err);
      setMultiSubmitError(err.response?.data?.message || "Error saving multiple BOQ Items");
    } finally {
      setMultiSubmitting(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFormData.project_id) {
      setImportError("Please select a project.");
      return;
    }
    if (!importFormData.file) {
      setImportError("Please select a file to import.");
      return;
    }

    setImporting(true);
    setImportError("");

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const arrayBuffer = evt.target.result;
          const dataBuffer = new Uint8Array(arrayBuffer);
          const wb = XLSX.read(dataBuffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          if (data.length === 0) {
            setImportError("The file is empty or invalid.");
            setImporting(false);
            return;
          }

          // Map items to required structure
          const formattedItems = data.map(item => ({
            description: item.description || item.Description || "",
            unit: item.unit || item.Unit || "",
            boq_qty: parseFloat(item.boq_qty || item.boqQty || item['BOQ Qty'] || item.Qty || 0),
            rate: parseFloat(item.rate || item.Rate || 0)
          }));

          const payload = {
            project_id: parseInt(importFormData.project_id),
            items: formattedItems
          };

          const res = await apiClient.post(IMPORT_BOQ_ITEMS_API, payload, {
            timeout: 0, // Disable timeout for heavy bulk imports
          });
          if (res.data?.success) {
            setShowImportDrawer(false);
            setImportFormData({ project_id: "", file: null });
            fetchBOQItems();
          } else {
            setImportError(res.data?.message || "Failed to import BOQ Items");
            setImporting(false);
          }
        } catch (error) {
          console.error("Error parsing file or uploading:", error);
          if (error?.message?.includes("Cannot find file")) {
             setImportError("Invalid Excel file: The file appears to be corrupted, empty, or not a valid .xlsx spreadsheet.");
          } else {
             setImportError("Failed to parse the file or upload data.");
          }
          setImporting(false);
        }
      };
      
      reader.onerror = () => {
        setImportError("Error reading the file.");
        setImporting(false);
      };
      
      reader.readAsArrayBuffer(importFormData.file);
      
    } catch (err) {
      console.error("Error initiating import:", err);
      setImportError("An unexpected error occurred.");
      setImporting(false);
    }
  };

  const filteredItems = boqItems.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.item_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputCls = (hasErr) =>
    `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-900 ${
      hasErr ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15"
    }`;
  
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <PackageSearch className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">BOQ Management</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Manage procurement Bill of Quantities (BOQ), items, and inventory catalog</p>
            </div>
          </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setImportError("");
                setImportFormData({ project_id: "", file: null });
                setShowImportDrawer(true);
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <FileUp className="w-4 h-4" /> Import BOQ
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddDrawer()}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New BOQ
            </button>
            <button
              type="button"
              onClick={() => {
                setMultiSubmitError("");
                setMultiFormData({ project_id: "", items: [{ name: "", item_type: "", unit: "", boq_qty: "" }] });
                setShowMultiAddDrawer(true);
              }}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <ListPlus className="w-4 h-4" /> Multi BOQ Item
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search BOQ by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-[#DC2604] animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading BOQ Items...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={fetchBOQItems} className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom">
              Retry
            </button>
          </div>
        )}

        {/* BOQ Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Item Code</th>
                    <th className="py-3.5 px-5">Name</th>
                    <th className="py-3.5 px-5">Unit</th>
                    <th className="py-3.5 px-5">BOQ Qty</th>
                    <th className="py-3.5 px-5">Executed Qty</th>
                    <th className="py-3.5 px-5">Balance Qty</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-500">
                        No BOQ items found.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.boq_item_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-mono text-slate-500 font-bold">{item.item_code || "N/A"}</td>
                        <td className="py-4 px-5 font-bold text-slate-900 min-w-50 whitespace-normal">
                          {item.name || item.description || "—"}
                        </td>
                        <td className="py-4 px-5">
                          {item.unit ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.unit}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-4 px-5 text-slate-800 font-bold">{item.boq_qty}</td>
                        <td className="py-4 px-5 text-emerald-600 font-semibold">{item.executed_qty}</td>
                        <td className="py-4 px-5 text-amber-600 font-semibold">{item.balance_qty}</td>
                        <td className="py-4 px-5">
                          {item.status === "active" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                              {item.status || "Unknown"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Edit BOQ Item"
                              onClick={() => handleOpenAddDrawer(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete BOQ Item"
                              onClick={() => handleDelete(item.boq_item_id)}
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
        )}
      </div>

      {/* Import BOQ Drawer */}
      <SideDrawer
        isOpen={showImportDrawer}
        onClose={() => setShowImportDrawer(false)}
        title="Import BOQ Items"
        subtitle="Upload an Excel file to bulk import BOQ items"
        icon={FileUp}
        submitText={importing ? "Importing..." : "Import BOQ Items"}
        onSubmit={handleImportSubmit}
        loading={importing}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Import Details</h4>
            
            <div>
              <label className={labelCls}>Select Project <span className="text-red-500">*</span></label>
              <select
                value={importFormData.project_id}
                onChange={(e) => setImportFormData(prev => ({ ...prev, project_id: e.target.value }))}
                className={inputCls(!importFormData.project_id && importError)}
              >
                <option value="">-- Select Project --</option>
                {projects.map(proj => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Excel File <span className="text-red-500">*</span></label>
              
              <div className={`relative border-2 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-pointer group ${importError && !importFormData.file ? "border-red-400" : "border-slate-300 hover:border-[#DC2604]/50"}`}>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .xml"
                  onChange={(e) => {
                    setImportFormData(prev => ({ ...prev, file: e.target.files[0] }));
                    if (importError) setImportError("");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Choose an Excel file"
                />
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-none">
                  <div className="p-3 bg-slate-100 rounded-full group-hover:bg-[#DC2604]/10 transition-colors">
                    <FileUp className="w-5 h-5 text-slate-500 group-hover:text-[#DC2604] transition-colors" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {importFormData.file ? (
                      <span className="text-[#DC2604] break-all">{importFormData.file.name}</span>
                    ) : (
                      "Click to upload or drag and drop"
                    )}
                  </div>
                  {!importFormData.file && (
                    <p className="text-xs font-medium text-slate-400">
                      XLSX, XLS, or CSV format
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                <span className="text-blue-700 font-semibold text-xs shrink-0 mt-0.5">Note:</span> 
                <p className="text-xs text-slate-600 leading-relaxed">
                  File must contain columns: <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-200 text-2xs mx-1">description, unit, boq_qty, rate</span>
                </p>
              </div>
            </div>
          </div>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {importError}
            </div>
          )}
        </div>
      </SideDrawer>

      {/* Add/Edit BOQ Drawer */}
      <SideDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title={editingId ? "Edit BOQ Item" : "Create New BOQ Item"}
        subtitle={editingId ? "Update existing BOQ item details" : "Add a new BOQ item to the catalog"}
        icon={PackageSearch}
        submitText={submitting ? "Saving..." : (editingId ? "Update BOQ Item" : "Create BOQ Item")}
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Item Details</h4>

            <div>
              <label className={labelCls}>Project <span className="text-red-500">*</span></label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={inputCls(formErrors.project_id)}
              >
                <option value="">-- Select Project --</option>
                {projects.map(proj => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
              {formErrors.project_id && <p className="text-red-500 text-xs mt-1">{formErrors.project_id}</p>}
            </div>

            <div>
              <label className={labelCls}>Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Item name..."
                className={inputCls(formErrors.name)}
              />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Unit <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. Nos, MT, Cum"
                  className={inputCls(formErrors.unit)}
                />
                {formErrors.unit && <p className="text-red-500 text-xs mt-1">{formErrors.unit}</p>}
              </div>
              <div>
                <label className={labelCls}>BOQ Qty <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="boq_qty"
                  value={formData.boq_qty}
                  onChange={handleChange}
                  placeholder="0"
                  step="any"
                  min="0"
                  className={inputCls(formErrors.boq_qty)}
                />
                {formErrors.boq_qty && <p className="text-red-500 text-xs mt-1">{formErrors.boq_qty}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Status <span className="text-red-500">*</span></label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputCls(formErrors.status)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
            </div>

          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {submitError}
            </div>
          )}
        </div>
      </SideDrawer>

      {/* Multi BOQ Items Drawer */}
      <SideDrawer
        isOpen={showMultiAddDrawer}
        onClose={() => setShowMultiAddDrawer(false)}
        title="Add Multi BOQ Items"
        subtitle="Add multiple BOQ items at once"
        icon={ListPlus}
        submitText={multiSubmitting ? "Saving..." : "Save All Items"}
        onSubmit={handleMultiSubmit}
        loading={multiSubmitting}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Project Selection</h4>
            <div>
              <label className={labelCls}>Project <span className="text-red-500">*</span></label>
              <select
                value={multiFormData.project_id}
                onChange={(e) => setMultiFormData(prev => ({ ...prev, project_id: e.target.value }))}
                className={inputCls(!multiFormData.project_id && multiSubmitError.includes('project'))}
              >
                <option value="">-- Select Project --</option>
                {projects.map(proj => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Items List</h4>
              <button
                type="button"
                onClick={addMultiRow}
                className="text-[#DC2604] hover:text-primary-bottom font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Row
              </button>
            </div>

            {multiFormData.items.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative">
                {multiFormData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMultiRow(index)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleMultiChange(index, "name", e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DC2604] focus:ring-1 focus:ring-[#DC2604]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Item Type</label>
                    <input
                      type="text"
                      value={item.item_type}
                      onChange={(e) => handleMultiChange(index, "item_type", e.target.value)}
                      placeholder="e.g. 1CX300"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DC2604] focus:ring-1 focus:ring-[#DC2604]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Unit <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleMultiChange(index, "unit", e.target.value)}
                      placeholder="e.g. Rmt, Nos"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DC2604] focus:ring-1 focus:ring-[#DC2604]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">BOQ Qty <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={item.boq_qty}
                      onChange={(e) => handleMultiChange(index, "boq_qty", e.target.value)}
                      placeholder="0"
                      step="any"
                      min="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DC2604] focus:ring-1 focus:ring-[#DC2604]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {multiSubmitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {multiSubmitError}
            </div>
          )}
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
