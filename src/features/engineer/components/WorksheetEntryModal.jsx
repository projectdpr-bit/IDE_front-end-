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
    let expr = formulaStr;
    Object.keys(formData).forEach((key) => {
      const val = Number(formData[key]) || 0;
      expr = expr.split(key).join(String(val));
    });
    if (/^[0-9+\-*/().\s]+$/.test(expr)) {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + expr + ")")();
      return isFinite(result) ? Math.round(result * 1000) / 1000 : 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── Single Dynamic Field Renderer ───────────────────────────────────────────
function DynamicField({ field, value, onChange }) {
  const { field_label, field_key, field_type, is_required, configuration } = field;

  const inputBase =
    "w-full h-[var(--input-height)] px-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-white text-[var(--text-sm)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-top)]/20 focus:border-[var(--color-primary-top)] transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

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
          {(configuration?.options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
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
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function WorksheetEntryModal({ isOpen, onClose, template, onSuccess }) {
  const { user } = useAuthStore();

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [fieldsError, setFieldsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PUBLIC_URL || "";

  // Fetch fields when modal opens
  useEffect(() => {
    if (!isOpen || !template?.template_id) return;

    setFields([]);
    setFormData({});
    setFieldsError(null);
    setSubmitError(null);
    setSubmitSuccess(null);

    const fetchFields = async () => {
      try {
        setLoadingFields(true);
        const res = await apiClient.get(
          `${baseUrl}engineer/work-sheet-templates/${template.template_id}`
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
  }, [isOpen, template?.template_id]);

  // Handle input change and recalculate formula fields in real-time
  const handleInputChange = useCallback(
    (fieldKey, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [fieldKey]: value };
        fields.forEach((f) => {
          if (f.field_type === "formula" && f.configuration?.formula) {
            updated[f.field_key] = evaluateFormula(f.configuration.formula, updated);
          }
        });
        return updated;
      });
    },
    [fields]
  );

  // Submit worksheet entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const payload = {
        template_id: Number(template.template_id),
        site_id: Number(user?.site_id || user?.assigned_site_id || 0),
        recorded_at: new Date().toISOString(),
        data: formData,
      };

      const res = await apiClient.post(
        `${baseUrl}engineer/work-sheet-entries`,
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
      setSubmitError(
        err?.response?.data?.message || err.message || "Submission failed."
      );
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
                {fields.map((field) => (
                  <div
                    key={field.field_id ?? field.field_key}
                    className={field.field_type === "formula" ? "sm:col-span-2" : ""}
                  >
                    <DynamicField
                      field={field}
                      value={formData[field.field_key]}
                      onChange={handleInputChange}
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
