import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MapPin, Building2, Users, Plus, Search, ShieldCheck, ChevronRight, X, UserPlus, Loader2 } from "lucide-react";
import { assignEmployeeToSite, getSeniorSiteSupervisors, getSiteEngineers } from "@/services/site.service";

export default function SitesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModalData, setAssignModalData] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [formData, setFormData] = useState({ employee_id: "", reports_to: "" });

  useEffect(() => {
    if (assignModalData) {
      Promise.all([getSeniorSiteSupervisors(), getSiteEngineers()])
        .then(([supRes, engRes]) => {
          if (supRes?.success) setSupervisors(supRes.data);
          if (engRes?.success) setEngineers(engRes.data);
        })
        .catch(err => console.error("Error fetching dropdowns:", err));
    }
  }, [assignModalData]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.reports_to) return;
    
    setIsAssigning(true);
    try {
      // For demo, if ID is string "SITE-101", extract the number, else use raw
      const numericSiteId = typeof assignModalData.id === "string" 
        ? parseInt(assignModalData.id.replace(/\D/g, "")) || 4 
        : assignModalData.id;

      await assignEmployeeToSite({
        site_id: numericSiteId,
        employee_id: parseInt(formData.employee_id),
        assignment_role: "Supervisor",
        reports_to: parseInt(formData.reports_to)
      });
      alert("Supervisor assigned successfully!");
      setAssignModalData(null);
      setFormData({ employee_id: "", reports_to: "" });
    } catch (err) {
      console.error("Assignment error:", err);
      alert("Failed to assign supervisor. Check console for details.");
    } finally {
      setIsAssigning(false);
    }
  };

  const [sites] = useState([
    {
      id: "SITE-101",
      name: "Feeder 104 Sub-Station Line",
      subProject: "Tata Power Delhi Infrastructure",
      subDivision: "Sub-Division 04",
      manager: "Senior Mgr. Alok Sharma",
      locationsCount: 12,
      status: "Active Worksite",
      state: "Delhi NCR",
    },
    {
      id: "SITE-102",
      name: "UP Rural Feeder Line 3",
      subProject: "UPPCL Expansion Project",
      subDivision: "Sub-Division 01",
      manager: "Senior Mgr. Vikram Roy",
      locationsCount: 8,
      status: "Active Worksite",
      state: "Uttar Pradesh",
    },
    {
      id: "SITE-103",
      name: "Central Warehouse Depot Site",
      subProject: "IED Internal Logistics",
      subDivision: "Sub-Division 02",
      manager: "Store Mgr. Ramesh Kumar",
      locationsCount: 4,
      status: "Operational",
      state: "Delhi NCR",
    },
    {
      id: "SITE-104",
      name: "Industrial Sub-Station Feeder 2",
      subProject: "Delhi North Power Grid",
      subDivision: "Sub-Division 03",
      manager: "Unassigned (Manager Required)",
      locationsCount: 6,
      status: "Needs Manager",
      state: "Delhi NCR",
    },
  ]);

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <MapPin className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Site & Feeder Locations</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Hierarchy level 4 & 5 control: Manage feeders, site locations & Senior Manager assignments.</p>
            </div>
          </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Site Feeder
          </button>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Feeders</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{sites.length}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across 4 Sub-Divisions</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-[#DC2604]">
              <MapPin className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Locations</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {sites.reduce((acc, s) => acc + s.locationsCount, 0)}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Ground-level work units</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Managers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3</h3>
              <p className="text-[11px] font-medium text-sky-600 mt-0.5">Assigned Senior Managers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Needs Action</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">1</h3>
              <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">Unassigned site managers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search site, feeder line, or sub-division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSites.map((site) => (
            <div key={site.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{site.name}</h3>
                    <p className="text-xs text-slate-500">{site.subProject} • {site.subDivision}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    site.status.includes("Active") || site.status.includes("Operational")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {site.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Assigned Manager:</span>
                  <span className="font-bold text-slate-800">{site.manager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Ground Locations:</span>
                  <span className="font-mono font-bold text-slate-900">{site.locationsCount} Units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Region:</span>
                  <span className="font-semibold text-slate-700">{site.state}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">ID: {site.id}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAssignModalData(site)} className="text-primary-top font-bold hover:underline cursor-pointer flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> Assign
                  </button>
                  <button type="button" className="text-slate-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                    View Units <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Site Feeder</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-3 text-xs" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Site / Feeder Name</label>
                <input type="text" placeholder="e.g. Feeder 108 Sub-station Line" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]" required />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub Division</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]">
                  <option>Sub-Division 01</option>
                  <option>Sub-Division 02</option>
                  <option>Sub-Division 03</option>
                  <option>Sub-Division 04</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign Senior Site Manager</label>
                <input type="text" placeholder="Manager Name or Employee Code" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm">Save Site Feeder</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Supervisor Modal */}
      {assignModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAssignModalData(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Supervisor</h3>
              <button type="button" onClick={() => setAssignModalData(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs text-slate-500">Assigning supervisor to:</p>
              <p className="text-sm font-bold text-slate-800">{assignModalData.name}</p>
            </div>

            <form className="space-y-4 text-xs" onSubmit={handleAssignSubmit}>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Site Engineer</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-top"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  required
                >
                  <option value="">Select an engineer...</option>
                  {engineers.map(eng => (
                    <option key={eng.id || eng.employee_id} value={eng.id || eng.employee_id}>{eng.name || eng.fullName || `Employee #${eng.id}`}</option>
                  ))}
                  {/* Fallback if empty */}
                  {engineers.length === 0 && <option value="19">Demo Engineer (ID: 19)</option>}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reports To (Senior Site Supervisor)</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-top"
                  value={formData.reports_to}
                  onChange={(e) => setFormData({...formData, reports_to: e.target.value})}
                  required
                >
                  <option value="">Select senior supervisor...</option>
                  {supervisors.map(sup => (
                    <option key={sup.id || sup.employee_id} value={sup.id || sup.employee_id}>{sup.name || sup.fullName || `Supervisor #${sup.id}`}</option>
                  ))}
                  {/* Fallback if empty */}
                  {supervisors.length === 0 && <option value="13">Demo Senior Supervisor (ID: 13)</option>}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAssignModalData(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isAssigning} className="px-4 py-2 text-xs font-bold text-white bg-primary-top hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
