import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { LABOUR_CONTRACTORS_API } from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { Search, Plus, Users, Edit3, Trash2 } from "lucide-react";

export default function LabourContractorsPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(LABOUR_CONTRACTORS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setContractors(res.data.data);
      } else {
        setContractors([]);
      }
    } catch (err) {
      console.error("Error fetching contractors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [refreshKey]);

  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm({}, {
    name: [validators.required],
    contact_number: [validators.required, validators.mobile],
  });

  const handleOpenAddDrawer = () => {
    setFormData({ name: "", contact_number: "" });
    setShowDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        contact_number: formData.contact_number
      };
      const res = await apiClient.post(LABOUR_CONTRACTORS_API, payload);
      if (res.data?.success) {
        setShowDrawer(false);
        fetchContractors();
        alert(res.data.message || "Contractor created successfully");
      } else {
        alert(res.data?.message || "Failed to create contractor");
      }
    } catch (err) {
      console.error("Error saving contractor:", err);
      alert(err.response?.data?.message || "Something went wrong while saving contractor.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContractors = contractors.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.contact_number?.includes(searchQuery) ||
    c.contractor_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto">
        {/* Page Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="
              w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)]
              rounded-[var(--radius-lg)]
              bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)]
              flex items-center justify-center
              shadow-[0_4px_12px_var(--color-primary-shadow)]
            ">
              <Users className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Labour Contractors</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">Manage labour contractors data</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button 
              onClick={handleOpenAddDrawer}
              className="
                btn-3d-primary
                px-[var(--space-5)] h-[var(--btn-height-md)]
                rounded-[var(--radius-lg)]
                text-[var(--text-sm)] font-medium
                flex items-center gap-[var(--space-2)]
              "
            >
              <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
              Add Contractor
            </button>
          </div>
        </div>

        {/* Filters / Search Bar Row */}
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-slate-400 w-[var(--icon-md)] h-[var(--icon-md)]" />
            <input
              className="
                w-full h-[var(--input-height)]
                pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)]
                rounded-[var(--radius-xl)]
                border border-[var(--color-secondary-border)]
                bg-white text-[var(--text-sm)] text-slate-800
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
                transition-colors duration-150
              "
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white">
            <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Code
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Name
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Contact
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                    Status
                  </th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-[var(--table-cell-px)] py-8 text-center text-[var(--text-sm)] text-slate-500">
                      Loading contractors...
                    </td>
                  </tr>
                ) : filteredContractors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-[var(--table-cell-px)] py-8 text-center text-[var(--text-sm)] text-slate-500">
                      No contractors found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  filteredContractors.map((contractor) => (
                    <tr key={contractor.contractor_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap font-medium">
                        {contractor.contractor_code}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        {contractor.name}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        {contractor.contact_number}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap">
                        <span className={`inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide ${
                          contractor.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {contractor.status}
                        </span>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        <button className="p-[var(--space-2)] rounded-[var(--radius-md)] text-slate-500 hover:text-[var(--color-primary-bottom)] hover:bg-red-50 transition-colors duration-150 inline-flex items-center justify-center">
                          <Edit3 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SideDrawer
        isOpen={showDrawer}
        onClose={() => !submitting && setShowDrawer(false)}
        title="Add Labour Contractor"
        onSubmit={handleFormSubmit}
        loading={submitting}
        submitText="Save Contractor"
        icon={Users}
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
              Contractor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="e.g. ABC Labour Services"
              className={`
                w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)]
                border ${formErrors.name ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}
                bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
                transition-colors duration-150
              `}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number || ""}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className={`
                w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)]
                border ${formErrors.contact_number ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}
                bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]
                transition-colors duration-150
              `}
            />
            {formErrors.contact_number && (
              <p className="text-red-500 text-xs mt-1">{formErrors.contact_number}</p>
            )}
          </div>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
