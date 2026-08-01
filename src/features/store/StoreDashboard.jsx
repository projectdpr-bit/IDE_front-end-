import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { Store, PackageCheck, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function StoreDashboard() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#044C75] via-[#0B5C8E] to-[#023350] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-block mb-3">
            📦 Store & Stock Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || "Store Manager"}!
          </h1>
          <p className="mt-1 text-sky-100 text-xs md:text-sm">
            Manage inventory in/outward logs, debit/credit notes, and stock aging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock Items</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">1,420</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-amber-600 bg-amber-50 border-amber-100">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Inward (DI)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">14 Batches</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-emerald-600 bg-emerald-50 border-emerald-100">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Outward (Site)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">8 Dispatches</h3>
            </div>
            <div className="p-3.5 rounded-xl border text-primary-top bg-orange-50 border-orange-100">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
