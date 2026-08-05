import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { 
  WORKSHEET_TEMPLATES_API, 
  GET_WORKSHEET_TEMPLATE_FIELDS_API,
  ADD_WORKSHEET_TEMPLATE_FIELDS_BULK_API,
  DELETE_WORKSHEET_TEMPLATE_FIELD_API,
  UPDATE_WORKSHEET_TEMPLATE_FIELD_API,
  GET_SITES_API
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
  Columns,
  X,
  ArrowLeft,
  Type,
  Hash,
  List,
  Calculator,
  Database,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const FeedbackMessage = ({ feedback }) => {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div className={`p-[var(--space-3)] rounded-[var(--radius-lg)] mb-[var(--space-4)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {isSuccess ? <CheckCircle className="w-[var(--icon-md)] h-[var(--icon-md)] shrink-0" /> : <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] shrink-0" />}
      {feedback.text}
    </div>
  );
};

export default function WorksheetTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Fields Drawer State
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const [fieldsModalView, setFieldsModalView] = useState('existing'); // 'existing' | 'new'
  const [existingFields, setExistingFields] = useState([]);
  const [newFieldsData, setNewFieldsData] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFieldData, setEditFieldData] = useState(null);

  const [pageFeedback, setPageFeedback] = useState(null);
  const [drawerFeedback, setDrawerFeedback] = useState(null);
  const [modalFeedback, setModalFeedback] = useState(null);

  const showFeedback = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter(null), 3000);
  };
  const [sitesList, setSitesList] = useState([]);
  
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

  const fetchSites = async () => {
    try {
      const res = await apiClient.get(GET_SITES_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSitesList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchSites();
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
        showFeedback(setPageFeedback, 'success', "Worksheet template deleted successfully");
        fetchTemplates();
      } else {
        showFeedback(setPageFeedback, 'error', res.data?.message || "Failed to delete worksheet template");
      }
    } catch (err) {
      console.error("Error deleting worksheet template:", err);
      showFeedback(setPageFeedback, 'error', err.response?.data?.message || "Error deleting worksheet template");
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
        showFeedback(setPageFeedback, 'success', `Worksheet template ${selectedItem ? 'updated' : 'created'} successfully`);
      } else {
        showFeedback(setDrawerFeedback, 'error', res.data?.message || `Failed to ${selectedItem ? 'update' : 'create'} worksheet template`);
      }
    } catch (err) {
      console.error("Error saving worksheet template:", err);
      showFeedback(setDrawerFeedback, 'error', err.response?.data?.message || "Error saving worksheet template");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Manage Fields Logic ---
  const handleOpenFieldsDrawer = async (item) => {
    setSelectedItem(item);
    setShowFieldsDrawer(true);
    setFieldsModalView('existing');
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
      { 
        field_label: "", 
        field_key: "", 
        field_type: "text", 
        is_required: false, 
        source_type: "manual",
        source_key: "",
        formula: "",
        is_read_only: false
      }
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
        showFeedback(setModalFeedback, 'success', "Field deleted successfully");
        fetchTemplates(); // update count
      } else {
        showFeedback(setModalFeedback, 'error', res.data?.message || "Failed to delete field");
      }
    } catch (err) {
      console.error("Error deleting field:", err);
      showFeedback(setModalFeedback, 'error', err.response?.data?.message || "Error deleting field");
    }
  };

  const handleEditClick = (field) => {
    setEditingFieldId(field.field_id);
    setFieldsModalView('edit');
    let config = {};
    if (field.configuration) {
      config = typeof field.configuration === 'object' ? field.configuration : (typeof field.configuration === 'string' ? JSON.parse(field.configuration || '{}') : {});
    }
    setEditFieldData({
      field_label: field.field_label,
      field_key: field.field_key,
      field_type: field.field_type,
      is_required: field.is_required,
      source_type: config.source_type || "manual",
      source_key: config.source_key || "",
      formula: config.formula || "",
      is_read_only: config.is_read_only || false
    });
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditFieldData(null);
    setFieldsModalView('existing');
  };

  const handleUpdateExistingField = async (fieldId) => {
    if (!editFieldData.field_label.trim()) {
      showFeedback(setModalFeedback, 'error', "Field label is required");
      return;
    }
    
    setSubmitting(true);
    try {
      let parsedConfig = {};
      if (editFieldData.source_type === 'system') {
        parsedConfig = { source_type: 'system', source_key: editFieldData.source_key, is_read_only: editFieldData.is_read_only };
      } else if (editFieldData.source_type === 'formula') {
        parsedConfig = { source_type: 'formula', formula: editFieldData.formula, is_read_only: editFieldData.is_read_only };
      } else {
        parsedConfig = { source_type: 'manual' };
      }

      const payload = {
        field_label: editFieldData.field_label,
        field_key: editFieldData.field_key,
        field_type: editFieldData.field_type,
        is_required: editFieldData.is_required,
        configuration: parsedConfig
      };

      const res = await apiClient.put(UPDATE_WORKSHEET_TEMPLATE_FIELD_API(fieldId), payload);
      if (res.data?.success) {
        showFeedback(setModalFeedback, 'success', "Field updated successfully");
        setEditingFieldId(null);
        setFieldsModalView('existing');
        const fetchRes = await apiClient.get(GET_WORKSHEET_TEMPLATE_FIELDS_API(selectedItem.template_id));
        if (fetchRes.data?.success && Array.isArray(fetchRes.data.data)) {
          setExistingFields(fetchRes.data.data);
        }
      } else {
        showFeedback(setModalFeedback, 'error', res.data?.message || "Failed to update field");
      }
    } catch (err) {
      console.error("Error updating field:", err);
      showFeedback(setModalFeedback, 'error', err.response?.data?.message || "Error updating field");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveFields = async () => {
    if (newFieldsData.length === 0) {
      setFieldsModalView('existing');
      return;
    }
    
    // Validate
    const validFields = newFieldsData.filter(f => f.field_label.trim() !== "");
    if (validFields.length === 0) {
      showFeedback(setModalFeedback, 'error', "Please provide valid field labels for all new fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fields: validFields.map((f, idx) => {
          let parsedConfig = {};
          if (f.source_type === 'system') {
            parsedConfig = { source_type: 'system', source_key: f.source_key, is_read_only: f.is_read_only };
          } else if (f.source_type === 'formula') {
            parsedConfig = { source_type: 'formula', formula: f.formula, is_read_only: f.is_read_only };
          } else {
            parsedConfig = { source_type: 'manual' };
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
        showFeedback(setModalFeedback, 'success', "Fields added successfully");
        const fetchRes = await apiClient.get(GET_WORKSHEET_TEMPLATE_FIELDS_API(selectedItem.template_id));
        if (fetchRes.data?.success && Array.isArray(fetchRes.data.data)) {
          setExistingFields(fetchRes.data.data);
        }
        fetchTemplates(); // update count
      } else {
        showFeedback(setModalFeedback, 'error', res.data?.message || "Failed to add fields");
      }
    } catch (err) {
      console.error("Error saving fields:", err);
      showFeedback(setModalFeedback, 'error', err.response?.data?.message || "Error saving fields");
    } finally {
      setSubmitting(false);
      setFieldsModalView('existing');
      setNewFieldsData([]);
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
        <FeedbackMessage feedback={pageFeedback} />
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
        <FeedbackMessage feedback={drawerFeedback} />
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
      {showFieldsDrawer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-[var(--space-4)]">
          <div className="bg-white rounded-[var(--radius-2xl)] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-layout-border)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[var(--space-4)] border-b border-[var(--color-layout-border)] bg-slate-50/80 backdrop-blur-md">
              <div className="flex items-center gap-[var(--space-3)]">
                <div className="w-[clamp(2.5rem,2rem+1.5vw,3rem)] h-[clamp(2.5rem,2rem+1.5vw,3rem)] rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-sm">
                  <Columns className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
                </div>
                <div>
                  <h2 className="text-[var(--text-lg)] font-bold text-slate-800 leading-tight">Manage Template Fields</h2>
                  <p className="text-[var(--text-xs)] text-slate-500 mt-0.5">Fields for {selectedItem?.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFieldsDrawer(false)}
                className="p-[var(--space-2)] text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-[var(--radius-lg)] transition-colors"
              >
                <X className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-[var(--space-5)] scrollbar-hide bg-white">
              <div className="space-y-[var(--space-6)]">
                <FeedbackMessage feedback={modalFeedback} />
          
          {/* Existing Fields Section */}
          {fieldsModalView === 'existing' && (
          <div>
            <div className="flex items-center justify-between mb-[var(--space-3)]">
              <h4 className="text-[var(--text-sm)] font-bold text-slate-800">
                Existing Fields ({existingFields.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  if (newFieldsData.length === 0) handleAddFieldRow();
                  setFieldsModalView('new');
                }}
                className="btn-3d-secondary px-[var(--space-3)] h-[var(--btn-height-sm)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)]"
              >
                <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                Add New Fields
              </button>
            </div>
            
            {loadingFields ? (
              <p className="text-[var(--text-xs)] text-slate-500 py-4 text-center border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] border-dashed">Loading existing fields...</p>
            ) : existingFields.length === 0 ? (
              <p className="text-[var(--text-xs)] text-slate-500 py-4 text-center border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] border-dashed">No fields found. Add some below.</p>
            ) : (
              <div className="border border-[var(--color-layout-border)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-layout-border)] max-h-[60vh] overflow-y-auto scrollbar-hide">
                {existingFields.map(field => {
                  let config = {};
                  if (field.configuration) {
                    try {
                      config = typeof field.configuration === 'object' ? field.configuration : JSON.parse(field.configuration);
                    } catch (e) {}
                  }

                  const getFieldIcon = (type) => {
                    switch (type) {
                      case 'number': return <Hash className="w-4 h-4 text-blue-500" />;
                      case 'date': return <CalendarDays className="w-4 h-4 text-green-500" />;
                      case 'dropdown': return <List className="w-4 h-4 text-purple-500" />;
                      case 'formula': return <Calculator className="w-4 h-4 text-orange-500" />;
                      default: return <Type className="w-4 h-4 text-slate-500" />;
                    }
                  };

                  return (
                    <div key={field.field_id} className="p-[var(--space-4)] flex items-start sm:items-center justify-between gap-[var(--space-4)] bg-white hover:bg-slate-50 transition-colors group">
                      <div className="flex gap-[var(--space-3)]">
                        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          {getFieldIcon(field.field_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-[var(--space-2)] flex-wrap">
                            <span className="text-[var(--text-sm)] font-bold text-slate-800">{field.field_label}</span>
                            {field.is_required && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-rose-200">Required</span>
                            )}
                            {config.is_read_only && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-slate-200">Read Only</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-1.5)] text-[var(--text-xs)] text-slate-500 flex-wrap">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
                              {field.field_key}
                            </span>
                            
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            
                            <span className="capitalize font-medium text-slate-600">
                              {field.field_type}
                            </span>
                            
                            {config.source_type && config.source_type !== 'manual' && (
                              <>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <div className="flex items-center gap-1 text-blue-600 font-medium">
                                  <Database className="w-3.5 h-3.5" />
                                  <span className="capitalize">{config.source_type} Source</span>
                                  {config.source_type === 'system' && config.source_key && (
                                    <span className="text-slate-500 font-normal">({config.source_key})</span>
                                  )}
                                  {config.source_type === 'formula' && config.formula && (
                                    <span className="text-slate-500 font-mono font-normal bg-slate-100 px-1 rounded border border-slate-200">({config.formula})</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditClick(field)}
                          className="p-2 text-slate-400 hover:text-[var(--color-primary-top)] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Field"
                        >
                          <Edit3 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingField(field.field_id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Field"
                        >
                          <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Edit Field Section */}
          {fieldsModalView === 'edit' && editFieldData && (
          <div>
            <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-[var(--space-1.5)] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors"
                title="Back to Existing Fields"
              >
                <ArrowLeft className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              </button>
              <h4 className="text-[var(--text-sm)] font-bold text-slate-800">Edit Field: {editFieldData.field_label}</h4>
            </div>

            <div className="p-[var(--card-padding)] border border-[var(--color-layout-border)] rounded-[var(--radius-xl)] bg-slate-50 relative space-y-[var(--space-4)] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Label <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editFieldData.field_label}
                    onChange={(e) => setEditFieldData({...editFieldData, field_label: e.target.value})}
                    className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                    required
                  />
                </div>
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Type</label>
                  <select
                    value={editFieldData.field_type}
                    onChange={(e) => setEditFieldData({...editFieldData, field_type: e.target.value})}
                    className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="formula">Formula</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Source Type</label>
                  <select
                    value={editFieldData.source_type}
                    onChange={(e) => setEditFieldData({...editFieldData, source_type: e.target.value})}
                    className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                  >
                    <option value="manual">Manual</option>
                    <option value="system">System</option>
                    <option value="formula">Formula</option>
                  </select>
                </div>

                {editFieldData.source_type === 'system' && (
                  <div>
                    <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Source Key (Site)</label>
                    <select
                      value={editFieldData.source_key}
                      onChange={(e) => setEditFieldData({...editFieldData, source_key: e.target.value})}
                      className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                    >
                      <option value="">Select Site</option>
                      {sitesList.map(site => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editFieldData.source_type === 'formula' && (
                  <div>
                    <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Formula</label>
                    <input
                      type="text"
                      value={editFieldData.formula}
                      onChange={(e) => setEditFieldData({...editFieldData, formula: e.target.value})}
                      placeholder="e.g. reading_from + reading_to"
                      className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                    />
                  </div>
                )}

                <div className="md:col-span-2 flex flex-wrap items-center gap-[var(--space-4)] pt-[var(--space-2)] border-t border-[var(--color-layout-border)] mt-[var(--space-2)]">
                  <div className="flex items-center gap-[var(--space-2)] bg-white px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] cursor-pointer" onClick={() => setEditFieldData({...editFieldData, is_required: !editFieldData.is_required})}>
                    <input
                      type="checkbox"
                      id={`edit-req-${editingFieldId}`}
                      checked={editFieldData.is_required}
                      onChange={(e) => setEditFieldData({...editFieldData, is_required: e.target.checked})}
                      className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={`edit-req-${editingFieldId}`} className="text-[var(--text-sm)] text-slate-700 cursor-pointer font-medium" onClick={(e) => e.preventDefault()}>
                      Is Required?
                    </label>
                  </div>
                  {(editFieldData.source_type === 'system' || editFieldData.source_type === 'formula') && (
                    <div className="flex items-center gap-[var(--space-2)] bg-white px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] cursor-pointer" onClick={() => setEditFieldData({...editFieldData, is_read_only: !editFieldData.is_read_only})}>
                      <input
                        type="checkbox"
                        id={`edit-ro-${editingFieldId}`}
                        checked={editFieldData.is_read_only}
                        onChange={(e) => setEditFieldData({...editFieldData, is_read_only: e.target.checked})}
                        className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`edit-ro-${editingFieldId}`} className="text-[var(--text-sm)] text-slate-700 cursor-pointer font-medium" onClick={(e) => e.preventDefault()}>
                        Is Read Only?
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Add New Fields Section */}
          {fieldsModalView === 'new' && (
          <div>
            <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-3)]">
              <button
                type="button"
                onClick={() => setFieldsModalView('existing')}
                className="p-[var(--space-1.5)] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors"
                title="Back to Existing Fields"
              >
                <ArrowLeft className="w-[var(--icon-md)] h-[var(--icon-md)]" />
              </button>
              <h4 className="text-[var(--text-sm)] font-bold text-slate-800">Add New Fields</h4>
            </div>
            
            <div className="space-y-[var(--space-4)]">
              {newFieldsData.map((field, idx) => (
                <div key={idx} className="p-[var(--card-padding)] border border-[var(--color-layout-border)] rounded-[var(--radius-xl)] bg-slate-50 relative space-y-[var(--space-4)] shadow-sm">
                  <div className="flex items-center justify-between mb-[var(--space-2)]">
                    <h5 className="text-[var(--text-sm)] font-bold text-slate-800 flex items-center gap-[var(--space-2)]">
                      <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)] text-[var(--color-primary-top)]" />
                      New Field {idx + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleRemoveFieldRow(idx)}
                      className="p-[var(--space-1.5)] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[var(--radius-md)] transition-colors"
                      title="Remove Field"
                    >
                      <Trash2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Label <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={field.field_label}
                        onChange={(e) => handleNewFieldChange(idx, 'field_label', e.target.value)}
                        placeholder="e.g. Project Name"
                        className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleNewFieldChange(idx, 'field_type', e.target.value)}
                        className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="formula">Formula</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Source Type</label>
                      <select
                        value={field.source_type}
                        onChange={(e) => handleNewFieldChange(idx, 'source_type', e.target.value)}
                        className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                      >
                        <option value="manual">Manual</option>
                        <option value="system">System</option>
                        <option value="formula">Formula</option>
                      </select>
                    </div>
                    
                    {field.source_type === 'system' && (
                      <div>
                        <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Source Key (Site)</label>
                        <select
                          value={field.source_key}
                          onChange={(e) => handleNewFieldChange(idx, 'source_key', e.target.value)}
                          className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                        >
                          <option value="">Select Site</option>
                          {sitesList.map(site => (
                            <option key={site.site_id} value={site.site_id}>
                              {site.site_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {field.source_type === 'formula' && (
                      <div>
                        <label className="text-[var(--text-xs)] font-medium text-slate-600 mb-[var(--space-1)] block">Formula</label>
                        <input
                          type="text"
                          value={field.formula}
                          onChange={(e) => handleNewFieldChange(idx, 'formula', e.target.value)}
                          placeholder="e.g. reading_from + reading_to"
                          className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2 flex flex-wrap items-center gap-[var(--space-4)] pt-[var(--space-2)] border-t border-[var(--color-layout-border)] mt-[var(--space-2)]">
                      <div className="flex items-center gap-[var(--space-2)] bg-white px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] cursor-pointer" onClick={() => handleNewFieldChange(idx, 'is_required', !field.is_required)}>
                        <input
                          type="checkbox"
                          id={`req-${idx}`}
                          checked={field.is_required}
                          onChange={(e) => handleNewFieldChange(idx, 'is_required', e.target.checked)}
                          className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label htmlFor={`req-${idx}`} className="text-[var(--text-sm)] text-slate-700 cursor-pointer font-medium" onClick={(e) => e.preventDefault()}>
                          Is Required?
                        </label>
                      </div>
                      {(field.source_type === 'system' || field.source_type === 'formula') && (
                        <div className="flex items-center gap-[var(--space-2)] bg-white px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] cursor-pointer" onClick={() => handleNewFieldChange(idx, 'is_read_only', !field.is_read_only)}>
                          <input
                            type="checkbox"
                            id={`read-only-${idx}`}
                            checked={field.is_read_only}
                            onChange={(e) => handleNewFieldChange(idx, 'is_read_only', e.target.checked)}
                            className="w-4 h-4 text-[var(--color-primary-top)] rounded border-slate-300 focus:ring-[var(--color-primary-top)] cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={`read-only-${idx}`} className="text-[var(--text-sm)] text-slate-700 cursor-pointer font-medium" onClick={(e) => e.preventDefault()}>
                            Is Read Only?
                          </label>
                        </div>
                      )}
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
          )}
        </div>
      </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-[var(--space-3)] p-[var(--space-4)] border-t border-[var(--color-layout-border)] bg-slate-50/80 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  if (fieldsModalView === 'new') setFieldsModalView('existing');
                  else if (fieldsModalView === 'edit') handleCancelEdit();
                  else setShowFieldsDrawer(false);
                }}
                className="px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium text-slate-700 bg-white border border-[var(--color-secondary-border)] hover:bg-slate-50 transition-colors shadow-sm"
              >
                {fieldsModalView === 'existing' ? 'Close' : 'Cancel'}
              </button>
              
              {fieldsModalView === 'new' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveFields();
                  }}
                  disabled={submitting}
                  className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)]"
                >
                  {submitting ? 'Saving...' : 'Save New Fields'}
                </button>
              )}

              {fieldsModalView === 'edit' && (
                <button
                  type="button"
                  onClick={() => handleUpdateExistingField(editingFieldId)}
                  disabled={submitting}
                  className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)]"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
