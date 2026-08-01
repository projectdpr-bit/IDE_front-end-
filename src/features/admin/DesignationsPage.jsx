import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { GET_ROLES_API, ADD_ROLE_API, EDIT_ROLE_API } from "@/utils/ApiHelper";
import { Award, Search, Plus, Loader2, ShieldCheck, RefreshCw, AlertCircle, Edit3, Trash2 } from "lucide-react";

export default function DesignationsPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer & Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // For Edit
  const [roleToDelete, setRoleToDelete] = useState(null); // For Delete confirmation

  // Form State for Adding / Editing Role
  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
    setErrors: setFormErrors,
  } = useForm({ role_name: "", description: "" }, {
    role_name: [validators.required],
    description: [validators.required],
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch Roles via GET API
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(GET_ROLES_API);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setRoles(response.data.data);
      } else {
        setRoles([]);
        setError(response.data?.message || "Failed to retrieve roles from server.");
      }
    } catch (err) {
      console.error("Error fetching roles from GET /admin/roles:", err);
      setRoles([]);
      setError(
        err.response?.data?.message || "Failed to connect to server. Please check network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Reset form when opening add drawer or edit role
  const handleOpenAddDrawer = () => {
    setSelectedRole(null);
    setFormData({ role_name: "", description: "" });
    setFormErrors({});
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenEditDrawer = (role) => {
    setSelectedRole(role);
    setFormData({ role_name: role.role_name || "", description: role.description || "" });
    setFormErrors({});
    setFormError("");
    setShowAddModal(true);
  };

  // Submit Handler for POST (create) and PUT (edit) /admin/roles API
  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (selectedRole) {
        // PUT /admin/roles/:id API call
        const response = await apiClient.put(EDIT_ROLE_API(selectedRole.role_id), {
          role_name: formData.role_name,
          description: formData.description,
        });

        if (response.data && response.data.success) {
          // Close SideDrawer, reset form and auto-reload GET roles data
          setSelectedRole(null);
          setShowAddModal(false);
          setFormData({ role_name: "", description: "" });
          fetchRoles(); // Auto-reload live GET API data
        } else {
          setFormError(response.data?.message || "Failed to update role.");
        }
      } else {
        // POST /admin/roles API call
        const response = await apiClient.post(ADD_ROLE_API, {
          role_name: formData.role_name,
          description: formData.description,
        });

        if (response.data && response.data.success) {
          // Close Drawer, reset form and auto-reload GET roles data
          setShowAddModal(false);
          setFormData({ role_name: "", description: "" });
          fetchRoles(); // Reload GET API data
        } else {
          setFormError(response.data?.message || "Failed to create role.");
        }
      }
    } catch (err) {
      console.error("Error saving role via API:", err);
      setFormError(
        err.response?.data?.message || "Failed to save role. Please check connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Filter roles based on searchQuery (matching role_name, role_id, description)
  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase();
    return (
      (role.role_name && role.role_name.toLowerCase().includes(q)) ||
      (role.role_id && role.role_id.toString().toLowerCase().includes(q)) ||
      (role.description && role.description.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Award className="w-7 h-7 text-[#DC2604]" />
              Roles & Designations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System access roles, permissions & role descriptions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchRoles}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
              title="Refresh Roles API"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#DC2604]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenAddDrawer}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Role
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Role ID, Name, or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
          <span className="text-2xs font-bold text-slate-400 hidden sm:inline-block">
            Total Roles: {filteredRoles.length}
          </span>
        </div>

        {/* Error Banner */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#DC2604] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchRoles}
              className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom transition-colors cursor-pointer"
            >
              Retry GET
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-[#DC2604] animate-spin" />
            <p className="text-xs font-medium text-slate-500">Fetching Roles via GET /admin/roles...</p>
          </div>
        )}

        {/* Roles Grid - Displays role_id, role_name, description, and Edit/Delete buttons */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                No roles found matching "{searchQuery}".
              </div>
            ) : (
              filteredRoles.map((role) => (
                <div
                  key={role.role_id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Role Name & Role ID Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {role.role_name}
                          </h3>
                          {/* {role.is_system_role && (
                            <span className="inline-flex items-center gap-1 text-2xs font-bold text-slate-400">
                              <ShieldCheck className="w-3 h-3 text-[#DC2604]" /> System Role
                            </span>
                          )} */}
                        </div>
                      </div>

                      {/* Role ID Badge */}
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-2xs font-extrabold shrink-0 border border-slate-200/60">
                        ID: {role.role_id}
                      </span>
                    </div>

                    {/* Description Box */}
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100/80">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {role.description || "No description provided for this role."}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Footer: Edit & Delete Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-2xs font-mono font-semibold text-slate-400">
                      {/* Role #{role.role_id} */}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrawer(role)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Edit Role"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setRoleToDelete(role)}
                        className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 text-[#DC2604] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Reusable Global Right Side Drawer Panel */}
      <SideDrawer
        isOpen={showAddModal || Boolean(selectedRole)}
        onClose={() => {
          setShowAddModal(false);
          setSelectedRole(null);
          setFormError("");
        }}
        title={selectedRole ? `Edit Role (ID: ${selectedRole.role_id})` : "Add New Role"}
        subtitle={selectedRole ? "Modify existing system role permissions" : "Create a new role definition for users"}
        icon={Award}
        submitText={selectedRole ? "Update Role" : "Save Role"}
        loading={submitting}
        onSubmit={handleSubmitRole}
      >
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {formError}
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Role Name</label>
          <input
            type="text"
            name="role_name"
            value={formData.role_name}
            onChange={handleChange}
            placeholder="e.g. Store Keeper"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC2604]/15 font-medium transition-all text-slate-900 ${formErrors.role_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          />
          {formErrors.role_name && <p className="text-red-500 text-xs mt-1">{formErrors.role_name}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Role Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Manages site inventory"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC2604]/15 font-medium h-32 resize-none transition-all text-slate-900 ${formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          />
          {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
        </div>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setRoleToDelete(null)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-[#DC2604] rounded-2xl border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Role "{roleToDelete.role_name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete role ID #{roleToDelete.role_id}? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
