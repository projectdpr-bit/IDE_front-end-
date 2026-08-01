import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { GET_SOURCE_DATASETS_API, CREATE_SOURCE_DATASET_API } from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import {
  FileSpreadsheet,
  Database,
  Search,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";

export default function AppSheetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(""); // 'source' or 'normal'
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(GET_SOURCE_DATASETS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDatasets(res.data.data);
      } else {
        setDatasets([]);
      }
    } catch (err) {
      console.error("Error fetching source datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm({}, {
    dataset_name: [validators.required],
    description: [validators.required],
  });

  const handleOpenAddDrawer = (type) => {
    setDrawerType(type);
    setSelectedItem(null);
    setFormData({ dataset_name: "", description: "" });
    setShowDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    setSubmitting(true);
    try {
      if (drawerType === 'source') {
        const payload = {
          source_dataset_name: formData.dataset_name,
          description: formData.description
        };
        const res = await apiClient.post(CREATE_SOURCE_DATASET_API, payload);
        if (res.data?.success) {
          setShowDrawer(false);
          fetchDatasets();
          alert("Source dataset created successfully");
        } else {
          alert(res.data?.message || "Failed to create source dataset");
        }
      } else {
        alert("Normal dataset creation API not yet configured");
        setShowDrawer(false);
      }
    } catch (err) {
      console.error("Error creating dataset:", err);
      alert(err.response?.data?.message || "Error creating dataset");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDatasets = datasets.filter((d) => 
    d.source_dataset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.source_dataset_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FileSpreadsheet className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">App Sheet</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">
                Manage Datasets and related data.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
             <button
              type="button"
              onClick={() => handleOpenAddDrawer('normal')}
              className="btn-3d-secondary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              Add Normal Dataset
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddDrawer('source')}
              className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              Add Source Dataset
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-end gap-[var(--space-3)] bg-white rounded-[var(--radius-xl)] p-[var(--space-2)] border border-[var(--color-layout-border)] shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 w-[var(--icon-md)] h-[var(--icon-md)] text-slate-400" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[var(--input-height)] pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-[var(--space-4)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white min-w-0 flex flex-col">
            <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">Dataset Code</th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">Dataset Name</th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">Description</th>
                  <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[var(--text-sm)] text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Loading datasets...</td>
                  </tr>
                ) : filteredDatasets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No datasets found.</td>
                  </tr>
                ) : (
                  filteredDatasets.map(d => (
                    <tr key={d.source_dataset_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap font-mono font-bold text-slate-900">{d.source_dataset_code}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap font-bold text-slate-800">{d.source_dataset_name}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap">{d.description}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-[var(--space-2)]">
                          <button className="p-[var(--space-2)] rounded-[var(--radius-md)] text-slate-500 hover:text-[var(--color-primary-bottom)] hover:bg-slate-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <Edit3 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                          </button>
                          <button className="p-[var(--space-2)] rounded-[var(--radius-md)] text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
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

      <SideDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={drawerType === "source" ? "Add Source Dataset" : "Add Normal Dataset"}
        subtitle="Provide the details for the new dataset"
        icon={Database}
        submitText="Save"
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Dataset Name</label>
            <input
              type="text"
              name="dataset_name"
              value={formData.dataset_name || ""}
              onChange={handleChange}
              placeholder={drawerType === 'source' ? "e.g. Cable_Master_Source" : "e.g. My_Normal_Dataset"}
              className={`w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 ${formErrors.dataset_name ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}`}
            />
            {formErrors.dataset_name && <p className="text-red-500 text-[var(--text-2xs)] mt-[var(--space-1)]">{formErrors.dataset_name}</p>}
          </div>
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Description of the dataset"
              className={`w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 ${formErrors.description ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}`}
            />
            {formErrors.description && <p className="text-red-500 text-[var(--text-2xs)] mt-[var(--space-1)]">{formErrors.description}</p>}
          </div>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
