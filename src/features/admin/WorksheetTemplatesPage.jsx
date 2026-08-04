import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { 
  WORKSHEET_TEMPLATES_API, 
  GET_WORKSHEET_TEMPLATE_FIELDS_API,
  ADD_WORKSHEET_TEMPLATE_FIELDS_BULK_API,
  DELETE_WORKSHEET_TEMPLATE_FIELD_API
} from "@/utils/ApiHelper";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import {
  FileText,
  Search,
  Plus,
  Edit3,
  Trash2,
  CalendarDays,
  LayoutList,
  Columns
} from "lucide-react";

export default function WorksheetTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Fields Drawer State
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const [existingFields, setExistingFields] = useState([]);
  const [newFieldsData, setNewFieldsData] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(WORKSHEET_TEMPLATES_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTemplates(res.data.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error("Error fetching worksheet templates:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const {
    values: formData,
    errors: formErrors,
    handleChange,
    validateAll,
    setValues: setFormData,
  } = useForm({}, {
    title: [validators.required],
    description: [validators.required],
    status: [validators.required]
  });

  const handleOpenAddDrawer = () => {
    setSelectedItem(null);
    setFormData({ title: "", description: "", status: "active" });
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item) => {
    setSelectedItem(item);
    setFormData({ 
      title: item.title, 
      description: item.description, 
      status: item.status || "active"
    });
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worksheet template?")) return;
    
    try {
      const res = await apiClient.delete(`${WORKSHEET_TEMPLATES_API}/${id}`);
      if (res.data?.success) {
        alert("Worksheet template deleted successfully");
        fetchTemplates();
      } else {
        alert(res.data?.message || "Failed to delete worksheet template");
      }
    } catch (err) {
      console.error("Error deleting worksheet template:", err);
      alert(err.response?.data?.message || "Error deleting worksheet template");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status
      };

      let res;
      if (selectedItem) {
        res = await apiClient.put(`${WORKSHEET_TEMPLATES_API}/${selectedItem.template_id}`, payload);
      } else {
        res = await apiClient.post(WORKSHEET_TEMPLATES_API, payload);
      }
      
      if (res.data?.success) {
        setShowDrawer(false);
        fetchTemplates();
        alert(`Worksheet template ${selectedItem ? 'updated' : 'created'} successfully`);
      } else {
        alert(res.data?.message || `Failed to ${selectedItem ? 'update' : 'create'} worksheet template`);
      }
    } catch (err) {
      console.error("Error saving worksheet template:", err);
      alert(err.response?.data?.message || "Error saving worksheet template");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Manage Fields Logic ---
  const handleOpenFieldsDrawer = async (item) => {
    setSelectedItem(item);
    setShowFieldsDrawer(true);
    setNewFieldsData([]);
    
    // Fetch existing fields
    setLoadingFields(true);
    try {
      const res = await apiClient.get(GET_WORKSHEET_TEMPLATE_FIELDS_API(item.template_id));
      if (res.data?.success && Array.isArray(res.data.data)) {
        setExistingFields(res.data.data);
      } else {
        setExistingFields([]);
      }
    } catch (err) {
      console.error("Error fetching existing fields:", err);
      setExistingFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleAddFieldRow = () => {
    setNewFieldsData([
      ...newFieldsData, 
      { field_label: "", field_key: "", field_type: "text", is_required: false, configuration: "{}" }
    ]);
  };

  const handleRemoveFieldRow = (index) => {
    setNewFieldsData(newFieldsData.filter((_, i) => i !== index));
  };

  const handleNewFieldChange = (index, field, value) => {
    const arr = [...newFieldsData];
    arr[index][field] = value;
    // Auto-generate field_key if field_label is updated and key is empty
    if (field === 'field_label' && !arr[index].field_key) {
      arr[index].field_key = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    setNewFieldsData(arr);
  };

  const handleDeleteExistingField = async (fieldId) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      const res = await apiClient.delete(DELETE_WORKSHEET_TEMPLATE_FIELD_API(fieldId));
      if (res.data?.success) {
        setExistingFields(existingFields.filter(f => f.field_id !== fieldId));
        alert("Field deleted successfully");
        fetchTemplates(); // update count
      } else {
        alert(res.data?.message || "Failed to delete field");
      }
    } catch (err) {
      console.error("Error deleting field:", err);
      alert(err.response?.data?.message || "Error deleting field");
    }
  };

  const handleSaveFields = async () => {
    if (newFieldsData.length === 0) {
      setShowFieldsDrawer(false);
      return;
    }
    
    // Validate
    const validFields = newFieldsData.filter(f => f.field_label.trim() !== "");
    if (validFields.length === 0) {
      alert("Please provide valid field labels for all new fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fields: validFields.map((f, idx) => {
          let parsedConfig = {};
          try {
            parsedConfig = JSON.parse(f.configuration || "{}");
          } catch (e) {
            console.warn("Invalid JSON in configuration for field:", f.field_label);
          }
          return {
            field_label: f.field_label,
            field_key: f.field_key || f.field_label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            field_type: f.field_type,
            is_required: f.is_required,
            order_index: existingFields.length + idx + 1,
            configuration: parsedConfig
          };
        })
      };

      const res = await apiClient.post(ADD_WORKSHEET_TEMPLATE_FIELDS_BULK_API(selectedItem.template_id), payload);
      if (res.data?.success) {
        alert("Fields added successfully");
        setShowFieldsDrawer(false);
        fetchTemplates(); // update count
      } else {
        alert(res.data?.message || "Failed to add fields");
      }
    } catch (err) {
      console.error("Error saving fields:", err);
      alert(err.response?.data?.message || "Error saving fields");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTemplates = templates.filter((t) => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.template_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-4)] max-w-[var(--content-max-width)] w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FileText className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Worksheet Templates</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">
                Manage worksheet templates and their configuration.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <button
              type="button"
              onClick={handleOpenAddDrawer}
              className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              Add Template
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-end gap-[var(--space-3)] bg-white rounded-[var(--radius-xl)] p-[var(--space-2)] border border-[var(--color-layout-border)] shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 w-[var(--icon-md)] h-[var(--icon-md)] text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[var(--input-height)] pl-[calc(var(--space-3)*2+var(--icon-md))] pr-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Content (Cards Format) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No worksheet templates found.</div>
          ) : (
            <div className="grid gap-[var(--space-4)] grid-cols-[repeat(auto-fit,minmax(clamp(300px,30%,400px),1fr))]">
              {filteredTemplates.map(template => (
                <div key={template.template_id} className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)] shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col group">
                  <div className="flex justify-between items-start mb-[var(--space-3)]">
                    <div>
                      <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-1)]">
                        <span className="text-[var(--text-2xs)] font-mono bg-slate-100 text-slate-600 px-[var(--space-2)] py-0.5 rounded-[var(--radius-md)]">
                          {template.template_code}
                        </span>
                        <span className={`inline-flex items-center px-[var(--space-3)] py-0.5 rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide ${template.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {template.status || 'Unknown'}
                        </span>
                      </div>
                      <h3 className="text-[var(--text-base)] font-bold text-slate-800 line-clamp-1">{template.title}</h3>
                    </div>
                    <div className="flex items-center gap-[var(--space-1)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenFieldsDrawer(template)}
                        className="p-[var(--space-1)] rounded-[var(--radius-md)] text-slate-400 hover:text-[var(--color-primary-top)] hover:bg-slate-100 transition-colors"
                        title="Manage Fields"
                      >
                        <Columns className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                      </button>
                      <button
                        onClick={() => handleOpenEditDrawer(template)}
                        className="p-[var(--space-1)] rounded-[var(--radius-md)] text-slate-400 hover:text-[var(--color-primary-bottom)] hover:bg-slate-100 transition-colors"
                        title="Edit Template"
                      >
                        <Edit3 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.template_id)}
                        className="p-[var(--space-1)] rounded-[var(--radius-md)] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[var(--text-sm)] text-slate-600 mb-[var(--space-4)] line-clamp-2 flex-1">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-[var(--space-3)] border-t border-[var(--color-layout-border)]">
                    <div className="flex items-center gap-[var(--space-2)] text-slate-500">
                      <LayoutList className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                      <span className="text-[var(--text-xs)] font-medium">{template.field_count || 0} Fields</span>
                    </div>
                    <div className="flex items-center gap-[var(--space-2)] text-slate-400">
                      <CalendarDays className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                      <span className="text-[var(--text-xs)]">{new Date(template.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedItem ? "Edit Worksheet Template" : "Add Worksheet Template"}
        subtitle="Provide the details for the worksheet template"
        icon={FileText}
        submitText={selectedItem ? "Update" : "Save"}
        onSubmit={handleFormSubmit}
        loading={submitting}
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="e.g. Cable Work"
              className={`w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 ${formErrors.title ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}`}
            />
            {formErrors.title && <p className="text-red-500 text-[var(--text-2xs)] mt-[var(--space-1)]">{formErrors.title}</p>}
          </div>
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Description of the template"
              className={`w-full py-[var(--space-2)] px-[var(--space-4)] rounded-[var(--radius-lg)] border bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 resize-none ${formErrors.description ? 'border-red-500' : 'border-[var(--color-secondary-border)]'}`}
            />
            {formErrors.description && <p className="text-red-500 text-[var(--text-2xs)] mt-[var(--space-1)]">{formErrors.description}</p>}
          </div>
          <div>
            <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Status</label>
            <select
              name="status"
              value={formData.status || "active"}
              onChange={handleChange}
              className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SideDrawer>

      {/* Fields Drawer */}
      <SideDrawer
        isOpen={showFieldsDrawer}
        onClose={() => setShowFieldsDrawer(false)}
        title="Manage Template Fields"
        subtitle={`Fields for ${selectedItem?.title}`}
        icon={Columns}
        submitText="Save New Fields"
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveFields();
        }}
        loading={submitting}
      >
        <div className="space-y-[var(--space-6)]">
          
          {/* Existing Fields Section */}
          <div>
            <h4 className="text-[var(--text-sm)] font-bold text-slate-800 mb-[var(--space-2)] flex items-center justify-between">
              Existing Fields ({existingFields.length})
            </h4>
            
            {loadingFields ? (
              <p className="text-[var(--text-xs)] text-slate-500 py-4 text-center border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] border-dashed">Loading existing fields...</p>
            ) : existingFields.length === 0 ? (
              <p className="text-[var(--text-xs)] text-slate-500 py-4 text-center border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] border-dashed">No fields found. Add some below.</p>
            ) : (
              <div className="border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-layout-border)] max-h-60 overflow-y-auto">
                {existingFields.map(field => (
                  <div key={field.field_id} className="p-[var(--space-3)] flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <span className="text-[var(--text-sm)] font-semibold text-slate-700">{field.field_label}</span>
                        {field.is_required && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[var(--text-2xs)] text-slate-500 font-mono">
                        <span className="bg-slate-100 px-1 rounded">{field.field_key}</span>
                        <span>•</span>
                        <span>{field.field_type}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingField(field.field_id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-[var(--color-layout-border)]" />

          {/* Add New Fields Section */}
          <div>
            <h4 className="text-[var(--text-sm)] font-bold text-slate-800 mb-[var(--space-3)]">Add New Fields</h4>
            
            <div className="space-y-[var(--space-4)]">
              {newFieldsData.map((field, idx) => (
                <div key={idx} className="p-[var(--space-3)] border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] bg-slate-50 relative space-y-[var(--space-3)]">
                  <button
                    type="button"
                    onClick={() => handleRemoveFieldRow(idx)}
                    className="absolute top-[var(--space-2)] right-[var(--space-2)] text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)] pt-2">
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Label <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={field.field_label}
                        onChange={(e) => handleNewFieldChange(idx, 'field_label', e.target.value)}
                        placeholder="e.g. Project Name"
                        className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Key</label>
                      <input
                        type="text"
                        value={field.field_key}
                        onChange={(e) => handleNewFieldChange(idx, 'field_key', e.target.value)}
                        placeholder="e.g. project_name"
                        className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleNewFieldChange(idx, 'field_type', e.target.value)}
                        className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)]"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="formula">Formula</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-[var(--space-2)] pt-6">
                      <input
                        type="checkbox"
                        id={`req-${idx}`}
                        checked={field.is_required}
                        onChange={(e) => handleNewFieldChange(idx, 'is_required', e.target.checked)}
                        className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)]"
                      />
                      <label htmlFor={`req-${idx}`} className="text-[var(--text-sm)] text-slate-700 cursor-pointer">
                        Is Required?
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block flex justify-between">
                        <span>Configuration (JSON)</span>
                        <span className="text-slate-400 font-normal">Optional</span>
                      </label>
                      <textarea
                        value={field.configuration}
                        onChange={(e) => handleNewFieldChange(idx, 'configuration', e.target.value)}
                        placeholder='{"source_type": "system", "is_read_only": true}'
                        rows={2}
                        className="w-full py-[var(--space-2)] px-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] font-mono text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddFieldRow}
                className="w-full flex items-center justify-center gap-[var(--space-2)] h-[var(--btn-height-md)] border-2 border-dashed border-[var(--color-secondary-border)] rounded-[var(--radius-lg)] text-slate-500 hover:text-[var(--color-primary-top)] hover:border-[var(--color-primary-top)] hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                <span className="text-[var(--text-sm)] font-medium">Add Field</span>
              </button>
            </div>
          </div>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
