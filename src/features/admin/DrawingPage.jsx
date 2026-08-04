import DashboardLayout from "@/layouts/DashboardLayout";
import { PenTool } from "lucide-react";

export default function DrawingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <PenTool className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Drawing</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Manage Drawings and blueprints.</p>
            </div>
          </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 text-sm">Drawing content goes here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
