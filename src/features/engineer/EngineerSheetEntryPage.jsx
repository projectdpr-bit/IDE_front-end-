import React, { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import DashboardLayout from "@/layouts/DashboardLayout";
import { FileSpreadsheet, Plus, FileText, Layers, RefreshCw } from "lucide-react";
import apiClient from "@/lib/axios";
import WorksheetEntryModal from "@/features/engineer/components/WorksheetEntryModal";

export default function EngineerSheetEntryPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PUBLIC_URL || "";

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`${baseUrl}engineer/work-sheet-templates?status=active`);
      if (response.data?.success) {
        setTemplates(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to load templates.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [refreshKey]);

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-6)] max-w-[var(--content-max-width)] mx-auto w-full h-full flex flex-col">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)] shrink-0">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FileSpreadsheet className="w-[var(--icon-md)] h-[var(--icon-md)] text-white" />
            </div>
            <div>
              <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight">Sheet Entry</h1>
              <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)]">Select a worksheet template to log your daily work.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button 
              onClick={fetchTemplates}
              className="btn-3d-secondary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <RefreshCw className={`w-[var(--icon-sm)] h-[var(--icon-sm)] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => templates.length > 0 && setSelectedTemplate(templates[0])}
              className="btn-3d-primary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)] cursor-pointer"
            >
              <Plus className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center p-[var(--space-12)]">
                <RefreshCw className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400 animate-spin mb-[var(--space-4)]" />
                <p className="text-[var(--text-sm)] text-slate-500">Loading templates...</p>
             </div>
          ) : error ? (
            <div className="bg-red-50 rounded-[var(--radius-xl)] border border-red-200 p-[var(--space-6)] flex flex-col items-center justify-center text-center">
              <p className="text-[var(--text-sm)] text-red-600 mb-[var(--space-4)]">{error}</p>
              <button 
                onClick={fetchTemplates}
                className="btn-3d-secondary px-[var(--space-5)] h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-[var(--space-2)]"
              >
                Try Again
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--space-12)] shadow-sm flex flex-col items-center justify-center text-center h-full">
              <div className="w-[var(--space-16)] h-[var(--space-16)] rounded-full bg-slate-50 flex items-center justify-center mb-[var(--space-4)]">
                <FileSpreadsheet className="w-[var(--icon-lg)] h-[var(--icon-lg)] text-slate-400" />
              </div>
              <h3 className="text-[var(--text-lg)] font-bold text-slate-800 mb-[var(--space-2)]">No Templates Available</h3>
              <p className="text-[var(--text-sm)] text-slate-500 max-w-md mx-auto">
                There are currently no active worksheet templates assigned to you.
              </p>
            </div>
          ) : (
             <div className="grid gap-[var(--space-4)] grid-cols-[repeat(auto-fill,minmax(clamp(280px,25vw,340px),1fr))] pb-[var(--space-4)]">
                {templates.map((template) => (
                   <div 
                     key={template.template_id}
                     onClick={() => setSelectedTemplate(template)}
                     className="relative bg-white rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] p-[var(--card-padding)] shadow-sm hover:shadow-lg hover:shadow-[var(--color-primary-shadow)] hover:-translate-y-1 hover:border-[var(--color-primary-top)] transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden"
                   >
                      {/* Subtle top gradient accent on hover */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="flex justify-between items-start mb-[var(--space-4)]">
                        <div className="w-[clamp(2.5rem,2rem+1.5vw,3rem)] h-[clamp(2.5rem,2rem+1.5vw,3rem)] rounded-[var(--radius-lg)] bg-slate-50 group-hover:bg-[var(--color-primary-top)]/10 flex items-center justify-center border border-slate-100 group-hover:border-[var(--color-primary-top)]/20 transition-all duration-300">
                           <FileText className="w-[var(--icon-md)] h-[var(--icon-md)] text-slate-500 group-hover:text-[var(--color-primary-top)] transition-colors duration-300" />
                        </div>
                        <span className="inline-flex items-center px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] text-[var(--text-2xs)] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 group-hover:bg-[var(--color-primary-top)]/10 group-hover:text-[var(--color-primary-bottom)] transition-colors duration-300">
                          {template.template_code}
                        </span>
                      </div>
                      
                      <h3 className="text-[var(--text-base)] font-bold text-slate-800 mb-[var(--space-2)] line-clamp-1 group-hover:text-[var(--color-primary-bottom)] transition-colors duration-300" title={template.title}>
                        {template.title}
                      </h3>
                      
                      <p className="text-[var(--text-sm)] text-slate-500 mb-[var(--space-5)] line-clamp-2 flex-1" title={template.description}>
                        {template.description || "No description provided."}
                      </p>

                      <div className="pt-[var(--space-4)] border-t border-[var(--color-layout-border)] flex items-center justify-between">
                         <div className="flex items-center gap-[var(--space-2)] text-slate-500">
                           <Layers className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                           <span className="text-[var(--text-xs)] font-medium">
                             {template.field_count} Fields
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-1 text-[var(--text-xs)] font-semibold text-[var(--color-primary-bottom)] opacity-80 group-hover:opacity-100">
                           <span>Use Template</span>
                           <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Worksheet Entry Modal */}
      <WorksheetEntryModal
        isOpen={!!selectedTemplate}
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSuccess={fetchTemplates}
      />
    </DashboardLayout>
  );
}


