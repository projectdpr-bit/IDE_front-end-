import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { GET_VENDORS_API, ADD_VENDOR_API, GET_PROJECT_API, ADD_PURCHASE_ORDER_API } from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { authStorage } from "@/utils/authStorage";
import {
  ShoppingCart,
  Building2,
  Truck,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  PackageCheck,
  Building,
  Phone,
  Mail,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function ProcurementsPage() {
  const [activeTab, setActiveTab] = useState("vendor"); // 'vendor' (default), 'po', 'di'
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Modal States
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Edit
  const [itemToDelete, setItemToDelete] = useState(null); // Delete

  // 1. Vendors Data State
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [projects, setProjects] = useState([]);

  const mockMaterials = [
    { id: 1, name: "Armored Cable 3.5C" },
    { id: 2, name: "High Voltage Breakers" },
    { id: 3, name: "Step-down Transformers (250kVA)" },
  ];

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get(GET_PROJECT_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProjects(res.data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(GET_VENDORS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setVendors(res.data.data);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProjects();
  }, []);

  // 2. Purchase Orders (PO) Data State
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: "PO-2026-082",
      vendor: "Havells India Electricals Ltd.",
      project: "Sub-Station Feeder 11kV Expansion",
      items: "50x Step-down Transformers (250kVA)",
      amount: "₹42,50,000",
      poDate: "2026-07-15",
      status: "Approved",
    },
    {
      id: "PO-2026-083",
      vendor: "Polycab Wires & Cables Ltd.",
      project: "Rural Electrification Line B",
      items: "12,000m Armored Cable 3.5C",
      amount: "₹28,10,000",
      poDate: "2026-07-18",
      status: "Pending",
    },
    {
      id: "PO-2026-084",
      vendor: "ABB Power Infrastructure Corp.",
      project: "Industrial Feeder Line 5 Upgrade",
      items: "12x High Voltage Breakers",
      amount: "₹18,75,000",
      poDate: "2026-07-22",
      status: "Approved",
    },
  ]);

  const [poItems, setPoItems] = useState([{ material_id: "", quantity: "", unit_price: "" }]);

  const addPoItem = () => {
    setPoItems([...poItems, { material_id: "", quantity: "", unit_price: "" }]);
  };
  const removePoItem = (index) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };
  const handlePoItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;
    setPoItems(updated);
  };

  // 3. Dispatch Invoices (DI) Data State
  const [dispatchInvoices, setDispatchInvoices] = useState([
    {
      id: "DI-901",
      poRef: "PO-2026-082",
      vendor: "Havells India Electricals Ltd.",
      carrier: "VRL Logistics (LR: 88412)",
      dispatchDate: "2026-07-26",
      deliverySite: "Feeder 104 Infrastructure Site",
      status: "In Transit",
    },
    {
      id: "DI-902",
      poRef: "PO-2026-084",
      vendor: "ABB Power Infrastructure Corp.",
      carrier: "TCI Freight (LR: 44109)",
      dispatchDate: "2026-07-27",
      deliverySite: "North Zone Sub-Station Depot",
      status: "Delivered",
    },
  ]);

  // Dynamic Validation Rules based on active tab
  const procurementValidationRules = useMemo(() => {
    if (activeTab === "vendor") {
      return {
        vendor_name: [validators.required],
        contact_person: [validators.required],
        phone: [validators.required, validators.mobile],
        email: [validators.email],
        gst_number: [validators.required, validators.gst],
        account_number: [validators.accountNumber],
        ifsc_code: [validators.ifsc],
      };
    } else if (activeTab === "po") {
      return {
        pr_id: [validators.required, validators.numeric],
        vendor_id: [validators.required],
        project_id: [validators.required],
      };
    } else {
      return {
        diNumber: [validators.required],
        poRef: [validators.required],
        carrier: [validators.required],
        deliverySite: [validators.required],
      };
    }
  }, [activeTab]);

  // Form State for Drawer via useForm hook
  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm({}, procurementValidationRules);

  // Handlers for Drawer Open
  const handleOpenAddDrawer = () => {
    setSelectedItem(null);
    if (activeTab === "vendor") {
      setFormData({ vendor_name: "", contact_person: "", phone: "", email: "", address: "", gst_number: "", account_number: "", ifsc_code: "", bank_name: "" });
    } else if (activeTab === "po") {
      setFormData({
        pr_id: "",
        vendor_id: "",
        project_id: "",
      });
      setPoItems([{ material_id: "", quantity: "", unit_price: "" }]);
    } else {
      setFormData({
        diNumber: `DI-${dispatchInvoices.length + 903}`,
        poRef: purchaseOrders[0]?.id || "",
        carrier: "",
        dispatchDate: new Date().toISOString().split("T")[0],
        deliverySite: "Feeder 104 Worksite",
      });
    }
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setShowDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }
    
    if (activeTab === "vendor") {
      setSubmitting(true);
      try {
        const payload = {
          vendor_name: formData.vendor_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          address: formData.address || "",
          gst_number: formData.gst_number,
          bank_details: {
            account_number: formData.account_number || "",
            ifsc_code: formData.ifsc_code || "",
            bank_name: formData.bank_name || "",
          },
          rating: 0,
          status: "active"
        };
        const res = await apiClient.post(ADD_VENDOR_API, payload);
        if (res.data?.success) {
          setShowDrawer(false);
          setSelectedItem(null);
          fetchVendors(); // Reload the data
        } else {
          alert(res.data?.message || "Failed to create vendor");
        }
      } catch (err) {
        console.error("Error creating vendor", err);
        alert(err.response?.data?.message || "Error creating vendor");
      } finally {
        setSubmitting(false);
      }
    } else if (activeTab === "po") {
      setSubmitting(true);
      try {
        const user = authStorage.getUser();
        const employeeId = user?.employeeId ?? user?.employee_id ?? 14; // Fallback to 14 if not found
        
        const formattedItems = poItems.map(item => ({
          material_id: parseInt(item.material_id),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        })).filter(i => i.material_id && !isNaN(i.quantity) && !isNaN(i.unit_price));
        
        if (formattedItems.length === 0) {
          alert("Please add at least one valid material item (select material, provide quantity and price).");
          setSubmitting(false);
          return;
        }

        const payload = {
          pr_id: parseInt(formData.pr_id),
          vendor_id: parseInt(formData.vendor_id),
          project_id: parseInt(formData.project_id),
          created_by: parseInt(employeeId),
          status: "approved",
          items: formattedItems
        };
        const res = await apiClient.post(ADD_PURCHASE_ORDER_API, payload);
        if (res.data?.success) {
          setShowDrawer(false);
          setSelectedItem(null);
          // fetchPurchaseOrders(); // Add here when GET_PURCHASE_ORDERS_API is ready
          alert("Purchase order created successfully.");
        } else {
          alert(res.data?.message || "Failed to create Purchase Order");
        }
      } catch (err) {
        console.error("Error creating PO", err);
        alert(err.response?.data?.message || "Error creating PO");
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowDrawer(false);
      setSelectedItem(null);
    }
  };

  // Filtered Items based on searchQuery
  const filteredVendors = vendors.filter(
    (v) =>
      v.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gst_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.vendor_id)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPOs = purchaseOrders.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDIs = dispatchInvoices.filter(
    (d) =>
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.poRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.carrier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <ShoppingCart className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Procurement & Vendor Management</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Manage suppliers, Purchase Orders (PO), and Dispatch Invoices (DI) across projects.</p>
            </div>
          </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddDrawer}
            className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "vendor" && "Add New Vendor"}
            {activeTab === "po" && "Create Purchase Order (PO)"}
            {activeTab === "di" && "Create Dispatch Invoice (DI)"}
          </button>
        </div>

        {/* Tab Selection Bar & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 3 Main Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("vendor")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "vendor"
                  ? "bg-[#DC2604] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Vendor ({vendors.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("po")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "po"
                  ? "bg-[#DC2604] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Purchase Order (PO) ({purchaseOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("di")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "di"
                  ? "bg-[#DC2604] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <Truck className="w-4 h-4" />
              Dispatch Invoice (DI) ({dispatchInvoices.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeTab.toUpperCase()} records...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TABLE 1: VENDORS (Default Tab) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "vendor" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Vendor ID</th>
                    <th className="py-3.5 px-5">Vendor Name</th>
                    <th className="py-3.5 px-5">Contact Person</th>
                    <th className="py-3.5 px-5">Phone / Email</th>
                    <th className="py-3.5 px-5">GST Number</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No vendors found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((v) => (
                      <tr key={v.vendor_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {v.vendor_id}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                          {v.vendor_name}
                        </td>
                        <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                          {v.contact_person}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{v.phone}</p>
                          <p className="text-2xs text-slate-400 font-mono">{v.email}</p>
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-600 whitespace-nowrap">
                          {v.gst_number}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {v.status || "active"}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDrawer(v)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Edit Vendor"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(v)}
                              className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 text-[#DC2604] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Delete Vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
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

        {/* ------------------------------------------------------------- */}
        {/* TABLE 2: PURCHASE ORDERS (PO) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "po" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">PO Number</th>
                    <th className="py-3.5 px-5">Vendor Name</th>
                    <th className="py-3.5 px-5">Project / Feeder</th>
                    <th className="py-3.5 px-5">Items Specification</th>
                    <th className="py-3.5 px-5">Total Amount (₹)</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No purchase orders found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className="font-bold text-slate-900 font-mono">{po.id}</p>
                          <p className="text-2xs text-slate-400">Date: {po.poDate}</p>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">
                          {po.vendor}
                        </td>
                        <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                          {po.project}
                        </td>
                        <td className="py-4 px-5 max-w-xs truncate font-medium text-slate-700" title={po.items}>
                          {po.items}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 font-mono whitespace-nowrap">
                          {po.amount}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold ${
                              po.status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDrawer(po)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Edit PO"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(po)}
                              className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 text-[#DC2604] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Delete PO"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
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

        {/* ------------------------------------------------------------- */}
        {/* TABLE 3: DISPATCH INVOICE (DI) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "di" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">DI Number</th>
                    <th className="py-3.5 px-5">PO Reference</th>
                    <th className="py-3.5 px-5">Carrier / LR No.</th>
                    <th className="py-3.5 px-5">Dispatch Date</th>
                    <th className="py-3.5 px-5">Delivery Site</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDIs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No dispatch invoices found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredDIs.map((di) => (
                      <tr key={di.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {di.id}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-700 whitespace-nowrap">
                          {di.poRef}
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-800 whitespace-nowrap">
                          {di.carrier}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-600 whitespace-nowrap">
                          {di.dispatchDate}
                        </td>
                        <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                          {di.deliverySite}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold ${
                              di.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                          >
                            {di.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDrawer(di)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              title="Edit DI"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(di)}
                              className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 text-[#DC2604] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Delete DI"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
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

      {/* Global Right Side Drawer for Create/Edit */}
      <SideDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedItem(null);
        }}
        title={
          selectedItem
            ? `Edit ${activeTab.toUpperCase()} (${selectedItem.name || selectedItem.id})`
            : `Add New ${activeTab === "vendor" ? "Vendor" : activeTab === "po" ? "Purchase Order" : "Dispatch Invoice"}`
        }
        subtitle={`Configure ${activeTab.toUpperCase()} details and specifications`}
        icon={activeTab === "vendor" ? Building2 : activeTab === "po" ? ShoppingCart : Truck}
        submitText={selectedItem ? "Update Record" : "Save Record"}
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        {activeTab === "vendor" && (
          <>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Vendor Name</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name || ""}
                onChange={handleChange}
                placeholder="e.g. Havells India Electricals Ltd."
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.vendor_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.vendor_name && <p className="text-red-500 text-xs mt-1">{formErrors.vendor_name}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Contact Person</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person || ""}
                onChange={handleChange}
                placeholder="e.g. Amit Kumar"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.contact_person ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.contact_person && <p className="text-red-500 text-xs mt-1">{formErrors.contact_person}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="sales@vendor.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number || ""}
                onChange={handleChange}
                placeholder="e.g. 07AAACH1234F1Z2"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 font-mono transition-all ${formErrors.gst_number ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.gst_number && <p className="text-red-500 text-xs mt-1">{formErrors.gst_number}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="e.g. Plot No 1, Main Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900"
              />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Bank Details</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 text-xs">Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number || ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 text-xs transition-all ${formErrors.account_number ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                  />
                  {formErrors.account_number && <p className="text-red-500 text-xs mt-1">{formErrors.account_number}</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 text-xs">IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code || ""}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 text-xs transition-all ${formErrors.ifsc_code ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                  />
                  {formErrors.ifsc_code && <p className="text-red-500 text-xs mt-1">{formErrors.ifsc_code}</p>}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 text-xs">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 text-xs"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "po" && (
          <>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">PR ID</label>
              <input
                type="text"
                name="pr_id"
                value={formData.pr_id || ""}
                onChange={handleChange}
                placeholder="e.g. 3"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.pr_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.pr_id && <p className="text-red-500 text-xs mt-1">{formErrors.pr_id}</p>}
            </div>
            
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Select Vendor</label>
              <select
                name="vendor_id"
                value={formData.vendor_id || ""}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.vendor_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
              {formErrors.vendor_id && <p className="text-red-500 text-xs mt-1">{formErrors.vendor_id}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Select Project</label>
              <select
                name="project_id"
                value={formData.project_id || ""}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.project_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
              {formErrors.project_id && <p className="text-red-500 text-xs mt-1">{formErrors.project_id}</p>}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="font-bold text-slate-700">Material Items</label>
                <button 
                  type="button" 
                  onClick={addPoItem} 
                  className="text-xs font-bold text-[#DC2604] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Material
                </button>
              </div>

              <div className="space-y-3">
                {poItems.map((item, index) => (
                  <div key={index} className="flex items-end gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl relative">
                    {poItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removePoItem(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-100 text-[#DC2604] rounded-full flex items-center justify-center hover:bg-rose-200 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex-1">
                      <label className="text-2xs font-bold text-slate-500 block mb-1">Material</label>
                      <select 
                        value={item.material_id}
                        onChange={(e) => handlePoItemChange(index, 'material_id', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#DC2604]"
                      >
                        <option value="">-- Select Material --</option>
                        {mockMaterials.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="text-2xs font-bold text-slate-500 block mb-1">Qty</label>
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handlePoItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#DC2604]"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-2xs font-bold text-slate-500 block mb-1">Unit Price</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handlePoItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#DC2604]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "di" && (
          <>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">DI Number</label>
              <input
                type="text"
                name="diNumber"
                value={formData.diNumber || formData.id || ""}
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Select Purchase Order (PO Ref)</label>
              <select
                name="poRef"
                value={formData.poRef || purchaseOrders[0]?.id || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 font-mono"
              >
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.id} - {po.vendor} ({po.amount})
                  </option>
                ))}
              </select>
              {formErrors.poRef && <p className="text-red-500 text-xs mt-1">{formErrors.poRef}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Carrier / LR Number</label>
              <input
                type="text"
                name="carrier"
                value={formData.carrier || ""}
                onChange={handleChange}
                placeholder="e.g. VRL Logistics (LR: 88412)"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.carrier ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.carrier && <p className="text-red-500 text-xs mt-1">{formErrors.carrier}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Delivery Site Location</label>
              <input
                type="text"
                name="deliverySite"
                value={formData.deliverySite || ""}
                onChange={handleChange}
                placeholder="e.g. Feeder 104 Infrastructure Site"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.deliverySite ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.deliverySite && <p className="text-red-500 text-xs mt-1">{formErrors.deliverySite}</p>}
            </div>
          </>
        )}
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setItemToDelete(null)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-[#DC2604] rounded-2xl border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete "{itemToDelete.name || itemToDelete.id}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this {activeTab.toUpperCase()} record? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
