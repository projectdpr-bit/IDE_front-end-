import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Send,
  Calculator,
} from "lucide-react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Formula Evaluator ────────────────────────────────────────────────────────
// Safely evaluates a formula string like "reading_from + reading_to"
// by substituting known field keys with their numeric values.
function evaluateFormula(formulaStr, formData) {
  if (!formulaStr) return 0;
  try {
    // Standardize 'abs(' to 'Math.abs('
    let expr = formulaStr.replace(/\babs\(/g, "Math.abs(");
    
    Object.keys(formData).forEach((key) => {
      const val = Number(formData[key]) || 0;
      expr = expr.split(key).join(String(val));
    });

    // Check for safety: allow digits, operators, and Math.abs
    const testExpr = expr.replace(/Math\.abs/g, "");
    if (/^[0-9+\-*/().\s,]+$/.test(testExpr)) {
      // eslint-disable-next-line no-new-func
      let result = Function('"use strict"; return (' + expr + ")")();
      return isFinite(result) ? Math.round(result * 1000) / 1000 : 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── Single Dynamic Field Renderer ───────────────────────────────────────────
function DynamicField({ field, value, onChange, dynamicOptions }) {
  const { field_label, field_key, field_type, is_required, configuration } = field;

  const inputBase =
    "w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  let dropdownOptions = [];
  if (field_type === "dropdown") {
    const lowerKey = field_key.toLowerCase();
    if (lowerKey === 'project_id' || lowerKey === 'project') {
      dropdownOptions = (dynamicOptions?.projects || []).map(p => ({ label: p.project_name, value: String(p.project_id) }));
    } else if (lowerKey === 'sub_division' || lowerKey === 'sub_divisions') {
      dropdownOptions = (dynamicOptions?.sub_divisions || []).map(s => ({ label: s, value: s }));
    } else if (lowerKey === 'feeder' || lowerKey === 'feeders') {
      dropdownOptions = (dynamicOptions?.feeders || []).map(f => ({ label: f, value: f }));
    } else if (lowerKey === 'location' || lowerKey === 'location_from' || lowerKey === 'location_to') {
      dropdownOptions = (dynamicOptions?.locations || []).map(l => ({ label: l.location, value: l.location }));
    } else {
      dropdownOptions = (configuration?.options || []).map(opt => ({ label: opt, value: opt }));
    }
  }

  const isGPS = 
    (field_key || '').toLowerCase().includes('gps') || 
    (field_label || '').toLowerCase().includes('gps') || 
    (((field_key || '').toLowerCase() === 'location' || (field_label || '').toLowerCase() === 'location') && field_type !== 'dropdown');

  const isTimestamp = 
    (field_key || '').toLowerCase().includes('timestamp') || 
    (field_key || '').toLowerCase().includes('time_stamp') || 
    (field_key || '').toLowerCase().includes('stamp_time') || 
    (field_label || '').toLowerCase().includes('timestamp') || 
    (field_label || '').toLowerCase().includes('time stamp') || 
    (field_label || '').toLowerCase().includes('stamp time');

  // Hide GPS and Timestamp fields from the frontend completely
  if (isGPS || isTimestamp) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      <label
        htmlFor={`field-${field_key}`}
        className="text-[var(--text-xs)] font-semibold text-slate-600 flex items-center gap-1"
      >
        {field_label}
        {is_required && <span className="text-red-500">*</span>}
        {field_type === "formula" && (
          <span className="inline-flex items-center gap-0.5 px-[var(--space-2)] py-px rounded-full bg-amber-100 text-amber-700 text-[var(--text-2xs)] font-bold uppercase tracking-wide ml-1">
            <Calculator className="w-2.5 h-2.5" />
            Auto
          </span>
        )}
      </label>

      {field_type === "number" && (
        <input
          id={`field-${field_key}`}
          type="number"
          required={is_required}
          value={value ?? ""}
          onChange={(e) => onChange(field_key, Number(e.target.value))}
          placeholder={`Enter ${field_label}`}
          className={inputBase}
        />
      )}

      {field_type === "text" && (
        <input
          id={`field-${field_key}`}
          type="text"
          required={is_required}
          value={value ?? ""}
          onChange={(e) => onChange(field_key, e.target.value)}
          placeholder={`Enter ${field_label}`}
          className={inputBase}
        />
      )}

      {field_type === "date" && (
        <input
          id={`field-${field_key}`}
          type="date"
          required={is_required}
          value={value ?? ""}
          onChange={(e) => onChange(field_key, e.target.value)}
          className={inputBase}
        />
      )}

      {field_type === "dropdown" && (
        <select
          id={`field-${field_key}`}
          required={is_required}
          value={value ?? ""}
          onChange={(e) => onChange(field_key, e.target.value)}
          className={inputBase}
        >
          <option value="">Select {field_label}</option>
          {dropdownOptions.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field_type === "formula" && (
        <input
          id={`field-${field_key}`}
          type="number"
          disabled
          value={value ?? 0}
          className={`${inputBase} bg-amber-50/60 border-amber-200 text-amber-800 font-semibold`}
        />
      )}

      {field_key.toLowerCase() === "total_cable" && dynamicOptions?.availableBoqQty !== undefined && (
        <p className={`text-[var(--text-xs)] mt-1 ${Number(value ?? 0) <= dynamicOptions.availableBoqQty ? 'text-green-600' : 'text-red-600 font-semibold'}`}>
          Available Stock: {dynamicOptions.availableBoqQty} {dynamicOptions.boqUnit}
          {Number(value ?? 0) > dynamicOptions.availableBoqQty && " (Exceeds available stock!)"}
        </p>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function WorksheetEntryModal({ isOpen, onClose, template, onSuccess, apiPrefix = "engineer" }) {
  const { user } = useAuthStore();

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [fieldsError, setFieldsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");

  const [boqItems, setBoqItems] = useState([]);
  const [selectedBoqItemId, setSelectedBoqItemId] = useState("");

  const [dynamicOptions, setDynamicOptions] = useState({
    projects: [],
    sub_divisions: [],
    feeders: [],
    locations: []
  });

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PUBLIC_URL || "";

  // Fetch fields when modal opens
  useEffect(() => {
    if (!isOpen || !template?.template_id) return;

    setFields([]);
    setFormData({});
    setFieldsError(null);
    setSubmitError(null);
    setSelectedSiteId("");
    setSelectedBoqItemId("");
    setDynamicOptions({
      projects: [],
      sub_divisions: [],
      feeders: [],
      locations: []
    });

    const fetchFields = async () => {
      try {
        setLoadingFields(true);
        const res = await apiClient.get(
          `${baseUrl}${apiPrefix}/work-sheet-templates/${template.template_id}`
        );
        if (res.data?.success) {
          const fetchedFields = res.data.data?.fields || [];
          setFields(fetchedFields);
          // Pre-seed formula fields to 0
          const seed = {};
          fetchedFields.forEach((f) => {
            if (f.field_type === "formula") seed[f.field_key] = 0;
          });
          setFormData(seed);
        } else {
          setFieldsError(res.data?.message || "Failed to load template fields.");
        }
      } catch (err) {
        setFieldsError(
          err?.response?.data?.message || err.message || "Failed to load fields."
        );
      } finally {
        setLoadingFields(false);
      }
    };

    fetchFields();
  }, [isOpen, template?.template_id, baseUrl]);

  // Fetch Sites for top-level dropdown
  useEffect(() => {
    if (!isOpen) return;
    const fetchSites = async () => {
      try {
        const res = await apiClient.get(`${baseUrl}${apiPrefix}/sites`);
        if (res.data?.success) {
          setSites(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch sites", err);
      }
    };
    fetchSites();
  }, [isOpen, baseUrl, apiPrefix]);

  // Fetch BOQ Items (Stock Matrix)
  useEffect(() => {
    if (!isOpen) return;
    const fetchBoqItems = async () => {
      try {
        let rawUser = null;
        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            rawUser = parsedAuth?.state?.user || parsedAuth?.user || parsedAuth;
          }
        } catch(e) {}
        
        const empId = user?.employee_id || user?.employeeId || user?.id || user?.userId || rawUser?.employee_id || rawUser?.id || 0;
        
        if (!empId) return;

        const res = await apiClient.get(`${baseUrl}${apiPrefix}/stock-matrix?employee_id=${empId}`);
        if (res.data?.success) {
          setBoqItems(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch BOQ items", err);
      }
    };
    fetchBoqItems();
  }, [isOpen, baseUrl, apiPrefix, user]);

  // Fetch dynamic cascading dropdown options
  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      try {
        const res = await apiClient.get(`${baseUrl}${apiPrefix}/work-sheet-options?field=projects`);
        if (res.data?.success) {
          setDynamicOptions(prev => ({ ...prev, projects: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, [isOpen, baseUrl]);

  const projectId = formData['project_id'] || formData['project'];
  useEffect(() => {
    if (!projectId) {
      setDynamicOptions(prev => ({ ...prev, sub_divisions: [] }));
      return;
    }
    const fetchSubDivisions = async () => {
      try {
        const res = await apiClient.get(`${baseUrl}${apiPrefix}/work-sheet-options?field=sub_divisions&project_id=${projectId}`);
        if (res.data?.success) {
          setDynamicOptions(prev => ({ ...prev, sub_divisions: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch sub divisions", err);
      }
    };
    fetchSubDivisions();
  }, [projectId, baseUrl]);

  const subDivision = formData['sub_division'] || formData['sub_divisions'];
  useEffect(() => {
    if (!subDivision) {
      setDynamicOptions(prev => ({ ...prev, feeders: [] }));
      return;
    }
    const fetchFeeders = async () => {
      try {
        const res = await apiClient.get(`${baseUrl}${apiPrefix}/work-sheet-options?field=feeders&sub_division=${encodeURIComponent(subDivision)}`);
        if (res.data?.success) {
          setDynamicOptions(prev => ({ ...prev, feeders: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch feeders", err);
      }
    };
    fetchFeeders();
  }, [subDivision, baseUrl]);

  const feeder = formData['feeder'] || formData['feeders'];
  useEffect(() => {
    if (!feeder) {
      setDynamicOptions(prev => ({ ...prev, locations: [] }));
      return;
    }
    const fetchLocations = async () => {
      try {
        const res = await apiClient.get(`${baseUrl}${apiPrefix}/work-sheet-options?field=locations&feeder=${encodeURIComponent(feeder)}`);
        if (res.data?.success) {
          setDynamicOptions(prev => ({ ...prev, locations: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, [feeder, baseUrl]);

  // Handle input change and recalculate formula fields in real-time
  const handleInputChange = useCallback(
    (fieldKey, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [fieldKey]: value };
        
        // Reset dependent cascading fields
        const lowerKey = fieldKey.toLowerCase();
        fields.forEach(f => {
            const k = f.field_key.toLowerCase();
            const isSubDiv = k === 'sub_division' || k === 'sub_divisions';
            const isFeeder = k === 'feeder' || k === 'feeders';
            const isLoc = k === 'location' || k === 'location_from' || k === 'location_to';
            
            if (lowerKey === 'project_id' || lowerKey === 'project') {
                if (isSubDiv || isFeeder || isLoc) updated[f.field_key] = '';
            } else if (lowerKey === 'sub_division' || lowerKey === 'sub_divisions') {
                if (isFeeder || isLoc) updated[f.field_key] = '';
            } else if (lowerKey === 'feeder' || lowerKey === 'feeders') {
                if (isLoc) updated[f.field_key] = '';
            }
        });

        fields.forEach((f) => {
          if (f.field_type === "formula") {
            if (f.configuration?.formula) {
              updated[f.field_key] = evaluateFormula(f.configuration.formula, updated);
            } else if ((f.field_key || '').toLowerCase() === 'total_cable') {
              // Fallback calculation for total_cable if no formula is provided
              const rFrom = Number(updated['reading_from'] || 0);
              const rTo = Number(updated['reading_to'] || 0);
              updated[f.field_key] = Math.abs(rTo - rFrom);
            }
            
            // Enforce non-negative for total_cable
            if ((f.field_key || '').toLowerCase() === 'total_cable' && Number(updated[f.field_key]) < 0) {
              updated[f.field_key] = 0;
            }
          }
        });
        return updated;
      });
    },
    [fields]
  );

  // Calculate selected BOQ available quantity
  const selectedBoqItem = boqItems.find(b => String(b.boq_item_id) === String(selectedBoqItemId));
  const availableQty = selectedBoqItem ? Number(selectedBoqItem.in_hand_qty) : 0;
  const unit = selectedBoqItem?.unit || "";
  
  // Inject BOQ data into dynamicOptions for the DynamicField to read
  const enhancedDynamicOptions = {
    ...dynamicOptions,
    availableBoqQty: selectedBoqItemId ? availableQty : undefined,
    boqUnit: unit
  };

  // Submit worksheet entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validate Total Cable against in_hand_qty
    const hasTotalCableField = fields.some(f => (f.field_key || '').toLowerCase() === 'total_cable');
    const totalCableVal = Number(formData['total_cable'] || formData['Total Cable'] || 0);

    if (selectedBoqItemId && hasTotalCableField && totalCableVal > availableQty) {
      setSubmitError(`Total Cable (${totalCableVal}) exceeds the available stock (${availableQty} ${unit}).`);
      setSubmitting(false);
      return;
    }

    try {
      // Fetch Geolocation (Strictly require current location)
      let lat = null;
      let lng = null;
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          });
        });
        if (position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      } catch (geoErr) {
        console.warn("Geolocation fetching failed or was denied.", geoErr);
        setSubmitError("Failed to get current location. Please enable GPS/Location services to submit this worksheet.");
        setSubmitting(false);
        return; // Stop submission if location is missing
      }

      // Ensure numeric values in formData are actual numbers where appropriate
      const parsedData = { ...formData, boq_item_id: Number(selectedBoqItemId) };
      
      // Auto-fill hidden fields (GPS and Timestamp)
      fields.forEach(f => {
        const k = (f.field_key || '').toLowerCase();
        const l = (f.field_label || '').toLowerCase();
        
        const isGPS = k.includes('gps') || l.includes('gps') || ((k === 'location' || l === 'location') && f.field_type !== 'dropdown');
        if (isGPS) {
          parsedData[f.field_key] = { latitude: lat, longitude: lng };
        }

        const isTimestamp = k.includes('timestamp') || k.includes('time_stamp') || k.includes('stamp_time') || 
                            l.includes('timestamp') || l.includes('time stamp') || l.includes('stamp time');
        if (isTimestamp) {
          if (f.field_type === 'date') {
            parsedData[f.field_key] = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          } else {
            parsedData[f.field_key] = new Date().toISOString(); // Full ISO String
          }
        }
      });

      Object.keys(parsedData).forEach(key => {
        const val = parsedData[key];
        if (typeof val !== 'object' && !isNaN(val) && val !== '' && val !== null) {
          parsedData[key] = Number(val);
        }
      });

      const empId = user?.employee_id || user?.employeeId || user?.id || user?.userId || 0;
      const sId = user?.site_id || user?.siteId || user?.assigned_site_id || user?.assignedSiteId || 0;

      // Extract raw user from localStorage just in case useAuthStore format masks the original keys
      let rawUser = null;
      try {
        const authData = localStorage.getItem('auth-storage'); // Update this key if different
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          rawUser = parsedAuth?.state?.user || parsedAuth?.user || parsedAuth;
        }
      } catch(e) {}
      
      const finalEmpId = Number(empId) !== 0 ? Number(empId) : Number(rawUser?.employee_id || rawUser?.id || 0);
      const finalSiteId = Number(sId) !== 0 ? Number(sId) : Number(rawUser?.site_id || rawUser?.assigned_site_id || 0);

      const payload = {
        template_id: Number(template.template_id),
        site_id: selectedSiteId ? Number(selectedSiteId) : finalSiteId,
        employee_id: finalEmpId,
        latitude: lat,
        longitude: lng,
        recorded_at: new Date().toISOString(),
        data: parsedData,
      };
      
      console.log("Submitting Worksheet Payload:", payload);

      const res = await apiClient.post(
        `${baseUrl}${apiPrefix}/work-sheet-entries`,
        payload
      );

      if (res.data?.success) {
        const code = res.data.data?.entry_code || "WSE-OK";
        setSubmitSuccess(`Entry submitted successfully! Code: ${code}`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1800);
      } else {
        setSubmitError(res.data?.message || "Submission failed.");
      }
    } catch (err) {
      console.error("API Submission Error:", err.response?.data || err);
      let errMsg = err?.response?.data?.message || err.message || "Submission failed.";
      
      // Attempt to extract validation errors if provided by the backend
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          errMsg += " - " + validationErrors.map(e => e.msg || e.message || JSON.stringify(e)).join(", ");
        } else if (typeof validationErrors === 'object') {
          errMsg += " - " + JSON.stringify(validationErrors);
        }
      }
      
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-[var(--space-4)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white w-full sm:max-w-xl md:max-w-2xl h-[88vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden">

        {/* Mobile drag handle indicator */}
        <div className="flex justify-center pt-[var(--space-2)] pb-0 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Top accent gradient bar (desktop) */}
        <div className="hidden sm:block h-1 w-full bg-gradient-to-r from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-[var(--space-5)] pt-[var(--space-3)] sm:pt-[var(--space-5)] pb-[var(--space-4)] border-b border-[var(--color-layout-border)] shrink-0">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2.25rem,1.75rem+1.5vw,2.75rem)] h-[clamp(2.25rem,1.75rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)] shrink-0">
              <FileText className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h2 className="text-[var(--text-base)] font-bold text-slate-800 leading-tight line-clamp-1">
                {template?.title}
              </h2>
              <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
                <span className="text-[var(--text-2xs)] font-semibold uppercase tracking-wide text-slate-400">
                  {template?.template_code}
                </span>
                {template?.field_count > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                    <span className="flex items-center gap-1 text-[var(--text-2xs)] text-slate-400">
                      <Layers className="w-3 h-3" />
                      {template.field_count} Fields
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            id="worksheet-modal-close"
            onClick={onClose}
            className="p-[var(--space-2)] rounded-[var(--radius-md)] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-[var(--icon-md)] h-[var(--icon-md)]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-4)] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

          {loadingFields && (
            <div className="flex flex-col items-center justify-center py-[var(--space-12)] gap-[var(--space-4)]">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-[var(--text-sm)] text-slate-500">Loading form fields…</p>
            </div>
          )}

          {fieldsError && !loadingFields && (
            <div className="flex items-start gap-[var(--space-3)] p-[var(--space-4)] bg-red-50 rounded-[var(--radius-lg)] border border-red-200">
              <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] text-red-500 shrink-0 mt-0.5" />
              <p className="text-[var(--text-sm)] text-red-700">{fieldsError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-center gap-[var(--space-3)] p-[var(--space-4)] bg-green-50 rounded-[var(--radius-lg)] border border-green-200 mb-[var(--space-5)]">
              <CheckCircle2 className="w-[var(--icon-md)] h-[var(--icon-md)] text-green-600 shrink-0" />
              <p className="text-[var(--text-sm)] text-green-700 font-medium">{submitSuccess}</p>
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-[var(--space-3)] p-[var(--space-4)] bg-red-50 rounded-[var(--radius-lg)] border border-red-200 mb-[var(--space-5)]">
              <AlertCircle className="w-[var(--icon-md)] h-[var(--icon-md)] text-red-500 shrink-0 mt-0.5" />
              <p className="text-[var(--text-sm)] text-red-700">{submitError}</p>
            </div>
          )}

          {!loadingFields && !fieldsError && fields.length > 0 && (
            <form id="worksheet-entry-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-[var(--space-4)] sm:gap-[var(--space-5)]">
                
                {/* Site Selection Dropdown (Root level requirement) */}
                <div className="flex flex-col gap-[var(--space-1)] sm:col-span-2">
                  <label className="text-[var(--text-xs)] font-semibold text-slate-600 flex items-center gap-1">
                    Select Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                  >
                    <option value="">Select a site...</option>
                    {sites.map((s) => (
                      <option key={s.id || s.site_id} value={s.id || s.site_id}>
                        {s.site_name || s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BOQ Item Selection Dropdown (Root level requirement inside data) */}
                <div className="flex flex-col gap-[var(--space-1)] sm:col-span-2">
                  <label className="text-[var(--text-xs)] font-semibold text-slate-600 flex items-center gap-1">
                    Select BOQ Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedBoqItemId}
                    onChange={(e) => setSelectedBoqItemId(e.target.value)}
                    className="w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150"
                  >
                    <option value="">Select a BOQ item...</option>
                    {boqItems.map((b) => (
                      <option key={b.boq_item_id} value={b.boq_item_id}>
                        {b.name || b.boq_item_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields */}
                {fields.map((field) => (
                  <div
                    key={field.field_id ?? field.field_key}
                    className={field.field_type === "formula" ? "sm:col-span-2" : ""}
                  >
                    <DynamicField
                      field={field}
                      value={formData[field.field_key]}
                      onChange={handleInputChange}
                      dynamicOptions={enhancedDynamicOptions}
                    />
                  </div>
                ))}
              </div>
            </form>
          )}

          {!loadingFields && !fieldsError && fields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[var(--space-12)] text-center gap-[var(--space-3)]">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-[var(--text-sm)] text-slate-500">
                This template has no fields configured yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loadingFields && !fieldsError && fields.length > 0 && !submitSuccess && (
          <div className="flex items-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] border-t border-[var(--color-layout-border)] bg-slate-50/60 shrink-0 safe-area-bottom">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-secondary flex-1 sm:flex-none sm:px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="worksheet-entry-form"
              id="worksheet-submit-btn"
              disabled={submitting}
              className="btn-3d-primary flex-1 sm:flex-none sm:px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center justify-center gap-[var(--space-2)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-[var(--icon-sm)] h-[var(--icon-sm)] animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <Send className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                  <span>Submit Entry</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
