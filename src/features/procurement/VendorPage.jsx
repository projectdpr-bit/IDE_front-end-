import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Users, Plus, Search, Loader2, AlertCircle, Edit3, Trash2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_VENDORS_API, ADD_VENDOR_API } from "@/utils/ApiHelper";
import SideDrawer from "@/components/ui/SideDrawer";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";

export default function VendorPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm(
    {
      vendor_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      gst_number: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      rating: "",
      status: "active",
    },
    {
      vendor_name: [validators.required],
      phone: [validators.mobile],
      email: [validators.email],
      gst_number: [validators.gst],
      account_number: [validators.accountNumber],
      ifsc_code: [validators.ifsc],
      rating: [
        (value) => {
          if (!value) return null;
          const num = parseFloat(value);
          if (isNaN(num) || num < 0 || num > 5) return "Rating must be between 0 and 5";
          return null;
        }
      ]
    }
  );

  const handleOpenAddDrawer = () => {
    setFormData({
      vendor_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      gst_number: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      rating: "",
      status: "active",
    });
    setShowAddDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const payload = {
        vendor_name: formData.vendor_name,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        gst_number: formData.gst_number || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        status: formData.status,
      };

      if (formData.bank_name || formData.account_number || formData.ifsc_code) {
        payload.bank_details = {
          bank_name: formData.bank_name || null,
          account_number: formData.account_number || null,
          ifsc_code: formData.ifsc_code || null,
        };
      }

      const res = await apiClient.post(ADD_VENDOR_API, payload);
      if (res.data?.success) {
        setShowAddDrawer(false);
        fetchVendors();
      } else {
        alert(res.data?.message || "Failed to create vendor");
      }
    } catch (err) {
      console.error("Error creating vendor:", err);
      alert(err.response?.data?.message || "Error creating vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
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
  }, [refreshKey]);

  const filteredVendors = vendors.filter(
    (v) =>
      v.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendor_id?.toString().includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <Users className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Vendor Management</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Manage enterprise vendors, suppliers, and onboarding.</p>
            </div>
          </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddDrawer}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Vendor
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name or ID..."
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
            <p className="text-xs font-medium text-slate-500">Loading vendors...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#DC2604] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={fetchVendors} className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom">
              Retry
            </button>
          </div>
        )}

        {/* Vendor Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Vendor ID</th>
                    <th className="py-3.5 px-5">Vendor Name</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-5">GST Number</th>
                    <th className="py-3.5 px-5">Bank Details</th>
                    <th className="py-3.5 px-5">Address</th>
                    <th className="py-3.5 px-5">Rating</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created At</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-slate-500">
                        No vendors found.
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <tr key={vendor.vendor_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5 font-mono text-slate-500">{vendor.vendor_id}</td>
                        <td className="py-4 px-5 font-bold text-slate-900 min-w-50 whitespace-normal">
                          {vendor.vendor_name}
                        </td>
                        <td className="py-4 px-5 min-w-50">
                          {vendor.contact_person && <p className="font-semibold text-slate-900">{vendor.contact_person}</p>}
                          {vendor.phone && <p className="text-slate-500">{vendor.phone}</p>}
                          {vendor.email && <p className="text-slate-500">{vendor.email}</p>}
                          {!vendor.contact_person && !vendor.phone && !vendor.email && <span className="text-slate-400">N/A</span>}
                        </td>
                        <td className="py-4 px-5">{vendor.gst_number || <span className="text-slate-400">N/A</span>}</td>
                        <td className="py-4 px-5 min-w-50">
                          {vendor.bank_details ? (
                            <>
                              <p className="font-semibold text-slate-900">{vendor.bank_details.bank_name}</p>
                              <p className="text-slate-500 font-mono">A/C: {vendor.bank_details.account_number}</p>
                              <p className="text-slate-500 font-mono">IFSC: {vendor.bank_details.ifsc_code}</p>
                            </>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-5 min-w-62.5 whitespace-normal text-slate-500">
                          {vendor.address || "N/A"}
                        </td>
                        <td className="py-4 px-5">
                          {vendor.rating ? (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                              ⭐ {vendor.rating}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {vendor.status === "active" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {vendor.status || "Unknown"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap text-slate-500">
                          {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Edit Vendor"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete Vendor"
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

      {/* Add Vendor Drawer */}
      <SideDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Create New Vendor"
        subtitle="Onboard a new vendor or supplier to the system"
        icon={Users}
        submitText="Create Vendor"
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Basic Details</h4>
            
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Vendor Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="e.g. M/s Envotain Industries"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.vendor_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.vendor_name && <p className="text-red-500 text-xs mt-1">{formErrors.vendor_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="e.g. 24AAHCE..."
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.gst_number ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.gst_number && <p className="text-red-500 text-xs mt-1">{formErrors.gst_number}</p>}
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Contact Details</h4>
            
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Contact Person</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="e.g. Vivek Gupta"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9910026776"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. xyz@domain.com"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Physical Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address of the vendor..."
                rows="3"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Bank Details & Rating</h4>
            
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.account_number ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.account_number && <p className="text-red-500 text-xs mt-1">{formErrors.account_number}</p>}
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  placeholder="e.g. SBIN0001234"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.ifsc_code ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
                />
                {formErrors.ifsc_code && <p className="text-red-500 text-xs mt-1">{formErrors.ifsc_code}</p>}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Vendor Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="e.g. 4.5"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.rating ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
              />
              {formErrors.rating && <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>}
            </div>
          </div>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
