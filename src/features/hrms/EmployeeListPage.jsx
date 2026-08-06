import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import { Users, Plus, Search } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_HR_API } from "@/utils/api/hr.api";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Panel state
  const [showPanel, setShowPanel] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", pin: "", role_id: "4" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(GET_HR_API);
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiClient.post(GET_HR_API, formData);
      if (res.data.success) {
        setShowPanel(false);
        setFormData({ full_name: "", pin: "", role_id: "4" });
        fetchEmployees(); // Refresh list
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
              <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
                <Users className="w-(--icon-md) h-(--icon-md) text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[var(--text-xl)] font-bold text-slate-800 leading-tight truncate">Employee Directory & Allocations</h1>
                <p className="text-[var(--text-xs)] text-slate-500 mt-[var(--space-1)] truncate">Manage field engineers, managers, and site personnel</p>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => setShowPanel(true)}
            className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-125 scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Employee</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Role ID</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Phone / Email</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-500 text-xs font-medium">Loading employees...</td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-500 text-xs font-medium">No employees found.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.employee_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] text-white font-bold flex items-center justify-center shadow-sm text-sm uppercase">
                            {e.full_name ? e.full_name[0] : "?"}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{e.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">{e.employee_code}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-600 text-xs whitespace-nowrap">Role {e.role_id}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-600 text-xs">{e.phone || "-"}</span>
                          {e.email && <span className="text-[10px] text-slate-500">{e.email}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${e.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <SideDrawer
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        title="Add Employee"
        subtitle="Provide the details for the new employee"
        icon={Users}
        submitText="Submit"
        onSubmit={handleAddEmployee}
        loading={isSubmitting}
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all placeholder:text-slate-400 text-xs" 
              placeholder="e.g. Rahul Verma"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">PIN</label>
            <input 
              required
              type="text" 
              value={formData.pin}
              onChange={(e) => setFormData({...formData, pin: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all placeholder:text-slate-400 text-xs" 
              placeholder="6-digit PIN"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Role</label>
            <select 
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900 transition-all text-xs"
            >
              <option value="2">Admin (Role 2)</option>
              <option value="3">HR (Role 3)</option>
              <option value="4">Store Manager (Role 4)</option>
              <option value="5">Engineer (Role 5)</option>
              <option value="6">Supervisor (Role 6)</option>
              <option value="7">Senior Supervisor (Role 7)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Note: Dynamic roles list will be added in future.</p>
          </div>
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
