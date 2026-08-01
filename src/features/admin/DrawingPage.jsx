import DashboardLayout from "@/layouts/DashboardLayout";
import { PenTool } from "lucide-react";

export default function DrawingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <PenTool className="w-7 h-7 text-[#DC2604]" />
              Drawing
            </h1>
            <p className="text-xs text-slate-500 mt-1 ">
              Manage Drawings and blueprints.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 text-sm">Drawing content goes here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
