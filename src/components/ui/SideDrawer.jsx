
import { X } from "lucide-react";

/**
 * Global Reusable Right Side Drawer Component
 * 
 * @param {boolean} isOpen - Drawer visibility state
 * @param {function} onClose - Callback to close drawer
 * @param {string|React.ReactNode} title - Drawer header title
 * @param {string} subtitle - Optional sub-heading under title
 * @param {React.ElementType} icon - Optional Lucide icon for header
 * @param {React.ReactNode} children - Dynamic form fields / body content
 * @param {string} submitText - Text for primary submit button (e.g., "Save Role")
 * @param {string} cancelText - Text for cancel button (default "Cancel")
 * @param {function} onSubmit - Form submit handler
 * @param {boolean} loading - Loading indicator for submit action
 * @param {string} maxWidth - Custom panel width (default "max-w-md")
 */
export default function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  onSubmit,
  loading = false,
  maxWidth = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Right Side Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full ${maxWidth} bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] shrink-0 font-bold">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle && <p className="text-2xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="side-drawer-form"
          onSubmit={onSubmit}
          className="flex-1 p-6 space-y-4 overflow-y-auto text-xs"
        >
          {children}
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          {cancelText && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="submit"
            form="side-drawer-form"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <span className="animate-spin text-white">⏳</span>}
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
