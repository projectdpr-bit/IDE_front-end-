import DashboardLayout from "@/layouts/DashboardLayout";
import { Store, Plus, Search, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function StoresPage() {
  const [search, setSearch] = useState("");
  const stores = [
    { id: 1, name: "Central Electrical Depot Store", manager: "Ramesh Sharma (Store Manager)", location: "Feeder 104 Site", status: "Active", items: 1420 },
    { id: 2, name: "Sub-Division 2 Material Yard", manager: "Unassigned", location: "Sub-Division 02", status: "Needs Manager", items: 680 },
    { id: 3, name: "North Zone Sub-Station Store", manager: "Vikram Malhotra", location: "Feeder 108 Site", status: "Active", items: 950 },
  ];

  const filtered = stores.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Store className="w-7 h-7 text-[#DC2604]" />
              Stores & Material Inventory Setup
            </h1>
            <p className="text-xs text-slate-500 mt-1">Manage Central Warehouse, Site Stores & Store Manager Assignments</p>
          </div>
          <button type="button" className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Add New Store
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stores or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.location}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                  {s.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Manager:</span>
                  <span className="font-bold text-slate-800">{s.manager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stocked Items:</span>
                  <span className="font-mono font-bold text-slate-900">{s.items} Material Types</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Store ID: STR-0{s.id}</span>
                <button type="button" className="text-[#DC2604] font-bold hover:underline cursor-pointer flex items-center gap-1">
                  Manage Inventory <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

