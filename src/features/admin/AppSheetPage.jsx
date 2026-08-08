import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { GET_SOURCE_DATASETS_API, CREATE_SOURCE_DATASET_API, CREATE_DATASET_API, CREATE_SOURCE_DATASET_COLUMNS_BULK_API, GET_DATASET_COLUMNS_API } from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import {
  FileSpreadsheet,
  Database,
  Search,
  Plus,
  Edit3,
  Trash2,
  Columns,
} from "lucide-react";

export default function AppSheetPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(""); // 'source' or 'normal'
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [showColumnDrawer, setShowColumnDrawer] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [columnsData, setColumnsData] = useState([{ column_name: "", column_type: "Text", is_required: false }]);
  const [existingColumns, setExistingColumns] = useState([]);
  
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
  }, [refreshKey]);

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
    setFormData({ dataset_name: "", description: "", display_name: "", source_dataset_ids: [] });
    setShowDrawer(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    if (drawerType === 'normal') {
      if (!formData.display_name?.trim()) {
        alert("Display Name is required.");
        return;
      }
      if (!formData.source_dataset_ids || formData.source_dataset_ids.length === 0) {
        alert("Please select at least one Source Dataset.");
        return;
      }
    }

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
        const payload = {
          dataset_name: formData.dataset_name,
          display_name: formData.display_name,
          description: formData.description,
          source_dataset_ids: formData.source_dataset_ids
        };
        const res = await apiClient.post(CREATE_DATASET_API, payload);
        if (res.data?.success) {
          setShowDrawer(false);
          alert("Normal dataset created successfully");
        } else {
          alert(res.data?.message || "Failed to create normal dataset");
        }
      }
    } catch (err) {
      console.error("Error creating dataset:", err);
      alert(err.response?.data?.message || "Error creating dataset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenColumnDrawer = async (id) => {
    setSelectedDatasetId(id);
    setColumnsData([{ column_name: "", column_type: "Text", is_required: false }]);
    setShowColumnDrawer(true);
    
    // Fetch existing columns to check for uniqueness
    try {
      const res = await apiClient.get(GET_DATASET_COLUMNS_API(id));
      if (res.data?.success && Array.isArray(res.data.data)) {
        setExistingColumns(res.data.data.map(col => col.column_name.toLowerCase()));
      } else {
        setExistingColumns([]);
      }
    } catch (err) {
      console.error("Error fetching existing columns:", err);
      setExistingColumns([]);
    }
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columnsData];
    newColumns[index][field] = field === 'is_required' ? (value === 'true' || value === true) : value;
    setColumnsData(newColumns);
  };

  const addColumnField = () => {
    setColumnsData([...columnsData, { column_name: "", column_type: "Text", is_required: false }]);
  };

  const removeColumnField = (index) => {
    setColumnsData(columnsData.filter((_, i) => i !== index));
  };

  const handleColumnSubmit = async (e) => {
    e.preventDefault();
    const validColumns = columnsData.filter(c => c.column_name.trim() !== "");
    if (validColumns.length === 0) {
      alert("Please enter at least one column name.");
      return;
    }
    
    // Uniqueness validation
    const currentNames = validColumns.map(c => c.column_name.trim().toLowerCase());
    
    // Check for duplicates within the current form
    const hasDuplicateInForm = new Set(currentNames).size !== currentNames.length;
    if (hasDuplicateInForm) {
      alert("Duplicate column names found in your input. Please ensure all names are unique.");
      return;
    }
    
    // Check for duplicates against existing columns
    const duplicateWithExisting = currentNames.find(name => existingColumns.includes(name));
    if (duplicateWithExisting) {
      alert(`The column name "${duplicateWithExisting}" already exists in this dataset. Please use a unique name.`);
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        columns: validColumns.map((c, idx) => ({
          column_name: c.column_name.trim(),
          column_type: c.column_type,
          is_required: c.is_required,
          order_index: idx + 1
        }))
      };
      const res = await apiClient.post(CREATE_SOURCE_DATASET_COLUMNS_BULK_API(selectedDatasetId), payload);
      if (res.data?.success) {
        alert("Columns added successfully");
        setShowColumnDrawer(false);
      } else {
        alert(res.data?.message || "Failed to add columns");
      }
    } catch (err) {
      console.error("Error adding columns:", err);
      alert(err.response?.data?.message || "Error adding columns");
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
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
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
                    <tr key={d.id || d.source_dataset_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap font-mono font-bold text-slate-900">{d.source_dataset_code}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap font-bold text-slate-800">{d.source_dataset_name}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap">{d.description}</td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-[var(--space-2)]">
                          <button
                            onClick={() => handleOpenColumnDrawer(d.id || d.source_dataset_id)}
                            title="Add Columns"
                            className="p-[var(--space-2)] rounded-[var(--radius-md)] text-slate-500 hover:text-[var(--color-primary-bottom)] hover:bg-slate-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <Columns className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                          </button>
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
          {drawerType === 'normal' && (
            <>
              <div>
                <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Cable Execution & Installation Master"
                  className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 border-[var(--color-secondary-border)]"
                />
              </div>
              <div>
                <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Source Datasets</label>
                <div className="border border-[var(--color-secondary-border)] rounded-[var(--radius-lg)] max-h-40 overflow-y-auto bg-white p-[var(--space-2)]">
                  {datasets.map(ds => (
                    <label key={ds.source_dataset_id} className="flex items-center gap-[var(--space-2)] p-[var(--space-1)] hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.source_dataset_ids?.includes(ds.source_dataset_id) || false}
                        onChange={(e) => {
                          const currentIds = formData.source_dataset_ids || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, source_dataset_ids: [...currentIds, ds.source_dataset_id] });
                          } else {
                            setFormData({ ...formData, source_dataset_ids: currentIds.filter(id => id !== ds.source_dataset_id) });
                          }
                        }}
                        className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                      />
                      <span className="text-[var(--text-sm)] text-slate-700">{ds.source_dataset_name}</span>
                    </label>
                  ))}
                  {datasets.length === 0 && (
                    <div className="text-[var(--text-sm)] text-slate-500 p-2 text-center">No source datasets available.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SideDrawer>

      <SideDrawer
        isOpen={showColumnDrawer}
        onClose={() => setShowColumnDrawer(false)}
        title="Add Columns"
        subtitle="Define new columns for the dataset"
        icon={Columns}
        submitText="Save Columns"
        onSubmit={handleColumnSubmit}
        loading={submitting}
      >
        <div className="space-y-[var(--space-4)]">
          {columnsData.map((col, idx) => (
            <div key={idx} className="p-[var(--space-3)] border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] bg-slate-50 relative">
              {columnsData.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColumnField(idx)}
                  className="absolute top-[var(--space-2)] right-[var(--space-2)] text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)]">
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Column Name</label>
                  <input
                    type="text"
                    value={col.column_name}
                    onChange={(e) => handleColumnChange(idx, 'column_name', e.target.value)}
                    placeholder="e.g. Cable_Type"
                    className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Column Type</label>
                  <select
                    value={col.column_type}
                    onChange={(e) => handleColumnChange(idx, 'column_type', e.target.value)}
                    className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]"
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Date">Date</option>
                    <option value="Boolean">Boolean</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-[var(--space-2)]">
                  <input
                    type="checkbox"
                    id={`req-${idx}`}
                    checked={col.is_required}
                    onChange={(e) => handleColumnChange(idx, 'is_required', e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                  />
                  <label htmlFor={`req-${idx}`} className="text-[var(--text-sm)] text-slate-700 select-none cursor-pointer">
                    Is Required?
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addColumnField}
            className="w-full flex items-center justify-center gap-[var(--space-2)] h-[var(--btn-height-md)] border-2 border-dashed border-[var(--color-secondary-border)] rounded-[var(--radius-lg)] text-slate-500 hover:text-[var(--color-primary-top)] hover:border-[var(--color-primary-top)] hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
            <span className="text-[var(--text-sm)] font-medium">Add Another Column</span>
          </button>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
