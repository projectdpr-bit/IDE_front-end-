import React, { useState, useEffect, useCallback } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
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

// ─── Field Matching Helpers ────────────────────────────────────────────────────
// Aggressively normalizes strings: "Project_Name" -> "projectname", "Sub Division" -> "subdivision"
const normalizeString = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const matchField = (key, label, keywords) => {
  const k = normalizeString(key);
  const l = normalizeString(label);
  return keywords.some(kw => {
    const normKw = normalizeString(kw);
    return k.includes(normKw) || l.includes(normKw);
  });
};

const isProjectField = (k, l) => matchField(k, l, ['project']);
const isSubDivisionField = (k, l) => matchField(k, l, ['subdivision']);
const isFeederField = (k, l) => matchField(k, l, ['feeder']);
const isLocationField = (k, l) => matchField(k, l, ['location']);
const isReadingFromField = (k, l) => matchField(k, l, ['readingfrom', 'startreading', 'previousreading', 'meterfrom', 'meterstart']);
const isReadingToField = (k, l) => matchField(k, l, ['readingto', 'endreading', 'currentreading', 'finalreading', 'meterto', 'meterend']);
const isGPSField = (k, l, type) => {
  if (matchField(k, l, ['gps', 'latitude', 'longitude', 'coordinates'])) return true;
  if (matchField(k, l, ['location']) && type !== 'dropdown' && type !== 'text') return true;
  return false;
};
const isTimestampField = (k, l) => matchField(k, l, ['timestamp', 'stamptime']);
const isEngineerNameField = (k, l) => matchField(k, l, ['engineer', 'engineername', 'nameengineer']);
const isSiteField = (k, l) => matchField(k, l, ['site']);

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
function DynamicField({ field, value, onChange, dynamicOptions, formData }) {
  const { field_label, field_key, field_type, is_required, configuration } = field;

  let actualFieldType = field_type;
  if (isProjectField(field_key, field_label) || 
      isSubDivisionField(field_key, field_label) || 
      isFeederField(field_key, field_label) || 
      isLocationField(field_key, field_label)) {
    actualFieldType = "dropdown";
  }

  const inputBase =
    "w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  let dropdownOptions = [];
  if (actualFieldType === "dropdown") {
    if (isProjectField(field_key, field_label)) {
      dropdownOptions = (dynamicOptions?.projects || []).map(p => ({ label: p.project_name, value: p.project_name }));
    } else if (isSubDivisionField(field_key, field_label)) {
      dropdownOptions = (dynamicOptions?.sub_divisions || []).map(s => ({ label: s, value: s }));
    } else if (isFeederField(field_key, field_label)) {
      dropdownOptions = (dynamicOptions?.feeders || []).map(f => ({ label: f, value: f }));
    } else if (isLocationField(field_key, field_label)) {
      dropdownOptions = (dynamicOptions?.locations || []).map(l => ({ label: l.location, value: l.location }));
    } else {
      dropdownOptions = (configuration?.options || []).map(opt => ({ label: opt, value: opt }));
    }
  }

  const isGPS = isGPSField(field_key, field_label, field_type);
  const isTimestamp = isTimestampField(field_key, field_label);
  const isEngineerName = isEngineerNameField(field_key, field_label);

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

      {actualFieldType === "number" && (
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

      {actualFieldType === "text" && (
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

      {actualFieldType === "date" && (
        <input
          id={`field-${field_key}`}
          type="date"
          required={is_required}
          value={value ?? ""}
          onChange={(e) => onChange(field_key, e.target.value)}
          className={inputBase}
        />
      )}

      {actualFieldType === "dropdown" && (
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
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function WorksheetEntryModal({ isOpen, onClose, template, onSuccess, apiPrefix = "engineer" }) {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
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
  }, [isOpen, template?.template_id, baseUrl, refreshKey]);

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
  }, [isOpen, baseUrl, apiPrefix, refreshKey]);

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
        } catch (e) { }
        const empId = user?.employee_id || user?.employeeId || user?.id || user?.userId || 0;
        const finalEmpId = Number(empId) !== 0 ? Number(empId) : Number(rawUser?.employee_id || rawUser?.id || 0);

        const res = await apiClient.get(`${baseUrl}${apiPrefix}/stock-matrix?employee_id=${finalEmpId}`);
        if (res.data?.success) {
          setBoqItems(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch BOQ items", err);
      }
    };
    fetchBoqItems();
  }, [isOpen, baseUrl, apiPrefix, refreshKey, user]);

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
  }, [isOpen, baseUrl, apiPrefix, refreshKey]);

  const getFieldValue = useCallback((isFieldFunc) => {
    for (let f of fields) {
      if (isFieldFunc(f.field_key, f.field_label)) {
        return formData[f.field_key];
      }
    }
    return undefined;
  }, [fields, formData, refreshKey]);

  const projectVal = getFieldValue(isProjectField);
  const selectedProjectObj = (dynamicOptions.projects || []).find(p => p.project_name === projectVal);
  const projectId = selectedProjectObj ? selectedProjectObj.project_id : null;
  
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
  }, [projectId, baseUrl, apiPrefix, refreshKey]);

  const subDivision = getFieldValue(isSubDivisionField);
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
  }, [subDivision, baseUrl, apiPrefix, refreshKey]);

  const feeder = getFieldValue(isFeederField);
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
  }, [feeder, baseUrl, apiPrefix, refreshKey]);

  // Handle input change and recalculate formula fields in real-time
  const handleInputChange = useCallback(
    (fieldKey, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [fieldKey]: value };

        // Reset dependent cascading fields
        const changedFieldObj = fields.find(xf => xf.field_key === fieldKey);
        
        if (changedFieldObj) {
          fields.forEach(f => {
            const isSubDiv = isSubDivisionField(f.field_key, f.field_label);
            const isFeeder = isFeederField(f.field_key, f.field_label);
            const isLoc = isLocationField(f.field_key, f.field_label);

            if (isProjectField(changedFieldObj.field_key, changedFieldObj.field_label)) {
              if (isSubDiv || isFeeder || isLoc) updated[f.field_key] = '';
            } else if (isSubDivisionField(changedFieldObj.field_key, changedFieldObj.field_label)) {
              if (isFeeder || isLoc) updated[f.field_key] = '';
            } else if (isFeederField(changedFieldObj.field_key, changedFieldObj.field_label)) {
              if (isLoc) updated[f.field_key] = '';
            }
          });
        }

        fields.forEach((f) => {
          if (f.field_type === "formula") {
            if (f.configuration?.formula) {
              updated[f.field_key] = evaluateFormula(f.configuration.formula, updated);
            } else {
              // Fallback calculation for ANY formula field if reading_from and reading_to exist
              const rFrom = Number(updated['reading_from'] || updated['reading from'] || 0);
              const rTo = Number(updated['reading_to'] || updated['reading to'] || 0);
              updated[f.field_key] = Math.abs(rTo - rFrom);
            }

            // Enforce non-negative for the calculated field
            if (Number(updated[f.field_key]) < 0) {
              updated[f.field_key] = Math.abs(updated[f.field_key]);
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
  const availableQty = selectedBoqItem ? Number(selectedBoqItem.in_hand_qty ?? selectedBoqItem.boq_qty ?? 0) : 0;
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

    // Validate BOQ stock against Calculated Quantity (reading diff)
    if (selectedBoqItemId) {
      const readingToField = fields.find(f => isReadingToField(f.field_key, f.field_label));
      const readingFromKey = Object.keys(formData).find(k => isReadingFromField(k, ''));
      
      if (readingToField && readingFromKey && formData[readingFromKey] !== undefined && formData[readingToField.field_key] !== undefined && formData[readingToField.field_key] !== "") {
        const rFrom = Number(formData[readingFromKey]);
        const rTo = Number(formData[readingToField.field_key]);
        const usageDiff = Math.abs(rTo - rFrom);
        
        if (usageDiff > availableQty) {
          setSubmitError(`Calculated Quantity (${usageDiff}) cannot exceed Available Stock (${availableQty} ${unit}).`);
          setSubmitting(false);
          return;
        }
      }
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
      const parsedData = { ...formData }; // DO NOT inject boq_item_id inside data here anymore

      let rawUser = null;
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          rawUser = parsedAuth?.state?.user || parsedAuth?.user || parsedAuth;
        }
      } catch (e) { }

      // Auto-fill hidden fields (GPS and Timestamp and Engineer Name)
      fields.forEach(f => {
        const k = (f.field_key || '').toLowerCase();
        const l = (f.field_label || '').toLowerCase();

        // GPS and Timestamp are now sent at the root level, so we don't inject them into parsedData
        
        if (isEngineerNameField(f.field_key, f.field_label)) {
          parsedData[f.field_key] = user?.name || user?.employee_name || rawUser?.name || rawUser?.employee_name || "";
        }
      });

      Object.keys(parsedData).forEach(key => {
        // Allow parsing all keys normally
        
        const fieldDef = fields.find(f => f.field_key === key);
        if (fieldDef && (fieldDef.field_type === 'number' || fieldDef.field_type === 'formula')) {
          const val = parsedData[key];
          if (val !== '' && val !== null && !isNaN(val)) {
            parsedData[key] = Number(val);
          }
        }
      });

      const empId = user?.employee_id || user?.employeeId || user?.id || user?.userId || 0;
      const sId = user?.site_id || user?.siteId || user?.assigned_site_id || user?.assignedSiteId || 0;

      const finalEmpId = Number(empId) !== 0 ? Number(empId) : Number(rawUser?.employee_id || rawUser?.id || 0);
      const finalSiteId = Number(sId) !== 0 ? Number(sId) : Number(rawUser?.site_id || rawUser?.assigned_site_id || 0);

      if (selectedBoqItemId) {
        parsedData.boq_item_id = Number(selectedBoqItemId);
      }

      // Map project_name to project_id for backend
      const projectKey = Object.keys(parsedData).find(k => isProjectField(k, ''));
      if (projectKey && parsedData[projectKey]) {
        const projName = parsedData[projectKey];
        const projObj = dynamicOptions?.projects?.find(p => p.project_name === projName);
        if (projObj) {
          delete parsedData[projectKey];
          parsedData.project_id = projObj.project_id || projObj.id;
        }
      }

      const payload = {
        template_id: Number(template.template_id),
        site_id: selectedSiteId ? Number(selectedSiteId) : (finalSiteId || null),
        employee_id: finalEmpId || null,
        latitude: lat,
        longitude: lng,
        recorded_at: new Date().toISOString(),
        data: parsedData,
      };

      // Remove site_id if it's null
      if (payload.site_id === null) {
        delete payload.site_id;
      }

      // Remove engineer_name from data if it is empty string
      const engineerKey = Object.keys(payload.data).find(k => isEngineerNameField(k, ''));
      if (engineerKey && payload.data[engineerKey] === "") {
        delete payload.data[engineerKey];
      }

      console.log("Submitting Worksheet Payload:", JSON.stringify(payload, null, 2));

      const res = await apiClient.post(
        `${baseUrl}${apiPrefix}/work-sheet-entries`,
        payload
      );

      if (res.data?.success) {
        setSubmitSuccess("Entry submitted successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 5000);
      } else {
        setSubmitError(res.data?.message || "Submission failed.");
      }
    } catch (err) {
      console.error("API Submission Error:", err.response?.data || err);
      let errMsg = "Submission failed.";
      
      // Aggressively extract backend validation details to show the exact 400 error in the UI
      if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
          errMsg = d;
        } else {
          errMsg = d.message || errMsg;
          if (d.errors) errMsg += " | " + JSON.stringify(d.errors);
          if (d.error) errMsg += " | " + JSON.stringify(d.error);
          if (d.details) errMsg += " | " + JSON.stringify(d.details);
        }
      } else if (err.message) {
        errMsg = err.message;
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
                {fields.some(f => isSiteField(f.field_key, f.field_label)) && (
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
                )}

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
                    {boqItems
                      .filter(b => Number(b.in_hand_qty ?? b.boq_qty ?? 0) > 0)
                      .map((b) => (
                      <option key={b.boq_item_id} value={b.boq_item_id}>
                        {b.name || b.boq_item_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields */}
                {fields.map((field) => {
                  const isGPS = isGPSField(field.field_key, field.field_label, field.field_type);
                  const isTimestamp = isTimestampField(field.field_key, field.field_label);
                  const isEngineerName = isEngineerNameField(field.field_key, field.field_label);
                  const isSite = isSiteField(field.field_key, field.field_label);
                  
                  // Hide GPS, Timestamp, Formula, auto-filled Engineer Name fields, and custom handled Site field completely
                  if (isGPS || isTimestamp || field.field_type === "formula" || isEngineerName || isSite) {
                    return null;
                  }

                  const isReadingTo = isReadingToField(field.field_key, field.field_label);
                  const readingFromKey = Object.keys(formData).find(k => isReadingFromField(k, ''));
                  let usageDiff = null;
                  
                  if (isReadingTo && readingFromKey && formData[readingFromKey] !== undefined && formData[field.field_key] !== undefined && formData[field.field_key] !== "") {
                    const rFrom = Number(formData[readingFromKey]);
                    const rTo = Number(formData[field.field_key]);
                    usageDiff = Math.abs(rTo - rFrom);
                  }

                  const inputBase = "w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

                  return (
                    <React.Fragment key={field.field_id ?? field.field_key}>
                      <div className={field.field_type === "formula" ? "sm:col-span-2" : ""}>
                        <DynamicField
                          field={field}
                          value={formData[field.field_key]}
                          onChange={handleInputChange}
                          dynamicOptions={enhancedDynamicOptions}
                          formData={formData}
                        />
                      </div>

                      {isReadingTo && usageDiff !== null && (
                        <div className="sm:col-span-2 flex flex-col gap-[var(--space-1)] p-[var(--space-4)] bg-amber-50/30 border border-amber-100 rounded-[var(--radius-xl)] shadow-sm">
                          <label className="text-[var(--text-xs)] font-semibold text-slate-700 flex items-center gap-1">
                            Calculated Quantity
                            <span className="text-red-500">*</span>
                            <span className="inline-flex items-center gap-0.5 px-[var(--space-2)] py-px rounded-full bg-amber-100 text-amber-700 text-[var(--text-2xs)] font-bold uppercase tracking-wide ml-1 shadow-sm">
                              <Calculator className="w-2.5 h-2.5" />
                              Auto
                            </span>
                          </label>
                          <input
                            type="number"
                            disabled
                            value={usageDiff ?? 0}
                            className={`${inputBase} bg-amber-50/60 border-amber-200 text-amber-800 font-semibold shadow-inner`}
                          />
                          {enhancedDynamicOptions?.availableBoqQty !== undefined && (
                            <div className="flex flex-col gap-[var(--space-1)] mt-[var(--space-1)]">
                              <div className="flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-medium text-slate-700 bg-slate-50 border border-slate-200 w-fit">
                                Available Stock: {enhancedDynamicOptions.availableBoqQty} {enhancedDynamicOptions.boqUnit}
                              </div>
                              {usageDiff > enhancedDynamicOptions.availableBoqQty && (
                                <div className="flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-md)] text-[var(--text-xs)] font-medium text-red-700 bg-red-50 border border-red-200 w-fit">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Calculated Quantity cannot exceed Available Stock!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
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
