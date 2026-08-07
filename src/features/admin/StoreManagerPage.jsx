import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { GET_STORES_LIST_API, ADD_STORE_API, ASSIGN_STORE_MANAGER_API, GET_STORE_MANAGER_LIST_API } from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { formatIndianCurrency } from "@/utils/formatters";
import { Store, UserCheck, Plus, Search, ChevronRight, Loader2, AlertCircle } from "lucide-react";

export default function StoreManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [stores, setStores] = useState([]);
  const [storeManagersList, setStoreManagersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Form State for Create Store Drawer
  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm({ store_name: "", location: "" }, {
    store_name: [validators.required],
    location: [validators.required]
  });

  // Form State for Assign Manager Drawer
  const {
    values: assignData,
    errors: assignErrors,
    handleChange: handleAssignChange,
    validateAll: validateAssign,
    setValues: setAssignData,
  } = useForm({ employee_id: "" }, {
    employee_id: [validators.required, validators.numeric]
  });

  const fetchStores = async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const [storesRes, managersRes] = await Promise.all([
        apiClient.get(GET_STORES_LIST_API).catch((err) => {
          console.warn("GET /admin/stores failed:", err);
          return { data: { success: false } };
        }),
        apiClient.get(GET_STORE_MANAGER_LIST_API).catch((err) => {
          console.warn("GET /admin/employees/store-managers failed:", err);
          return { data: { success: false } };
        }),
      ]);

      if (storesRes.data?.success && Array.isArray(storesRes.data.data)) {
        setStores(storesRes.data.data);
      } else {
        setStores([]);
      }

      if (managersRes.data?.success && Array.isArray(managersRes.data.data)) {
        setStoreManagersList(managersRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await Promise.resolve();
      fetchStores(true);
    };
    initFetch();
  }, []);

  const handleOpenAddDrawer = () => {
    setFormData({ store_name: "", location: "" });
    setShowAddDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const payload = {
        store_name: formData.store_name,
        location: formData.location
      };
      const res = await apiClient.post(ADD_STORE_API, payload);
      if (res.data?.success) {
        setShowAddDrawer(false);
        fetchStores(); // Reload data on success
      } else {
        alert(res.data?.message || "Failed to create store");
      }
    } catch (err) {
      console.error("Error creating store:", err);
      alert(err.response?.data?.message || "Error creating store");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssign = (store) => {
    setSelectedStore(store);
    setAssignData({ employee_id: store.store_manager_id || "" });
    setShowAssignDrawer(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!validateAssign()) return;

    setSubmittingAssign(true);
    try {
      const isUpdate = selectedStore.project_id !== null;
      const method = isUpdate ? "put" : "post";

      const payload = {
        store_id: parseInt(selectedStore.store_id),
        store_manager_id: parseInt(assignData.employee_id)
      };

      const res = await apiClient[method](ASSIGN_STORE_MANAGER_API, payload);
      if (res.data?.success) {
        setShowAssignDrawer(false);
        fetchStores();
      } else {
        alert(res.data?.message || "Failed to assign manager");
      }
    } catch (err) {
      console.error("Error assigning manager:", err);
      alert(err.response?.data?.message || "Error assigning manager");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.store_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <Store className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Store Manager & Central Depots</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Admin control center for Store Managers, warehouse depots, material inward/outward registers & stock aging.</p>
            </div>
          </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddDrawer}
            className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Store
          </button>
        </div>

        {/* Overview Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Central Depots</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stores.length}</h3>
              <p className="text-2xs font-medium text-slate-400 mt-0.5">Active warehouse stores</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-[#DC2604]">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Store Managers</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {stores.filter((s) => s.status === "Active Manager").length}
              </h3>
              <p className="text-2xs font-medium text-emerald-600/80 mt-0.5">Assigned & active</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatIndianCurrency(17000000)}</h3>
              <p className="text-2xs font-medium text-sky-600 mt-0.5">Stored materials & equipment</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unassigned Depots</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stores.filter((s) => s.status === "Needs Manager").length}
              </h3>
              <p className="text-2xs font-medium text-amber-600/80 mt-0.5">Needs manager assignment</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div> */}

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search depot, store manager, or location..."
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
            <p className="text-xs font-medium text-slate-500">Loading stores...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#DC2604] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={fetchStores} className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom">
              Retry
            </button>
          </div>
        )}

        {/* Stores Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500 text-xs font-medium">No stores found.</div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.store_id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{store.store_name}</h3>
                        <p className="text-xs text-slate-500">{store.location}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold whitespace-nowrap shrink-0 ${
                        store.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {store.status || "Unknown"}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 font-medium">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 whitespace-nowrap">Store Manager ID:</span>
                      <span className="font-bold text-slate-900 truncate">{store.store_manager_id || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 whitespace-nowrap">Project ID:</span>
                      <span className="font-semibold text-slate-700 whitespace-nowrap">{store.project_id || "None"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono whitespace-nowrap">Depot Code: {store.store_code}</span>
                    <button 
                      type="button" 
                      onClick={() => handleOpenAssign(store)}
                      className="text-[#DC2604] font-bold hover:underline cursor-pointer flex items-center gap-1 whitespace-nowrap"
                    >
                      {store.project_id === null ? "Assign Store Manager" : "Update Store Manager"} <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Store Drawer */}
      <SideDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        title="Create New Store"
        subtitle="Add a new warehouse depot to the system"
        icon={Store}
        submitText="Create Store"
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Store Name</label>
          <input
            type="text"
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            placeholder="e.g. Main Ahmedabad Depot"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.store_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          />
          {formErrors.store_name && <p className="text-red-500 text-xs mt-1">{formErrors.store_name}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Sarkhej, Ahmedabad"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${formErrors.location ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          />
          {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
        </div>
      </SideDrawer>

      {/* Assign/Update Manager Drawer */}
      <SideDrawer
        isOpen={showAssignDrawer}
        onClose={() => setShowAssignDrawer(false)}
        title={selectedStore?.project_id === null ? "Assign Store Manager" : "Update Store Manager"}
        subtitle={`For Store: ${selectedStore?.store_name}`}
        icon={UserCheck}
        submitText={selectedStore?.project_id === null ? "Assign Manager" : "Update Manager"}
        onSubmit={handleAssignSubmit}
        loading={submittingAssign}
      >
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Store Manager</label>
          <select
            name="employee_id"
            value={assignData.employee_id}
            onChange={handleAssignChange}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${assignErrors.employee_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          >
            <option value="">Select Store Manager</option>
            {storeManagersList.map((mgr) => (
              <option key={mgr.employee_id} value={mgr.employee_id}>
                {mgr.full_name} (ID: {mgr.employee_id})
              </option>
            ))}
          </select>
          {assignErrors.employee_id && <p className="text-red-500 text-xs mt-1">{assignErrors.employee_id}</p>}
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
