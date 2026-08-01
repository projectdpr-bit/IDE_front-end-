import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import apiClient from "@/lib/axios";
import { GET_PURCHASE_REQUESTS_API } from "@/utils/ApiHelper";
import { HardHat, Search, Loader2, AlertCircle } from "lucide-react";

export default function SeniorEngineerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPurchaseRequests = async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await apiClient.get(GET_PURCHASE_REQUESTS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPurchaseRequests(res.data.data);
      } else {
        setPurchaseRequests([]);
      }
    } catch (err) {
      console.error("Error fetching purchase requests:", err);
      setError("Failed to load purchase requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await Promise.resolve();
      fetchPurchaseRequests(true);
    };
    initFetch();
  }, []);

  const filteredPRs = purchaseRequests.filter(
    (pr) =>
      pr.pr_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requested_by?.toString().includes(searchQuery.toLowerCase()) ||
      pr.project_id?.toString().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <HardHat className="w-7 h-7 text-[#DC2604]" />
              Engineer Purchase Requests
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and manage purchase requests initiated by Engineers.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senior Engineers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{engineers.length}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Assigned to site feeders</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-[#DC2604]">
              <HardHat className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {engineers.reduce((acc, e) => acc + e.attendancePending, 0)}
              </h3>
              <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">Labour & GPS attendance</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Locations</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {engineers.reduce((acc, e) => acc + e.locationsCount, 0)}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600 mt-0.5 font-semibold">Active ground units</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Field Staff</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">142</h3>
              <p className="text-[11px] font-medium text-sky-600 mt-0.5">Engineers & Labourers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div> */}

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PR number, project, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-[#DC2604] animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading purchase requests...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#DC2604] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button type="button" onClick={() => fetchPurchaseRequests(false)} className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom">
              Retry
            </button>
          </div>
        )}

        {/* PR Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto min-h-125">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">PR Number</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Project ID</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Site ID</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Requested By</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPRs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-500 text-xs font-medium">
                        No purchase requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredPRs.map((pr) => (
                      <tr key={pr.pr_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 text-xs">{pr.pr_number || "N/A"}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium text-slate-600">{pr.project_id || "N/A"}</td>
                        <td className="px-5 py-3.5 text-xs font-medium text-slate-600">{pr.site_id || "N/A"}</td>
                        <td className="px-5 py-3.5 text-xs font-medium text-slate-600">{pr.requested_by || "N/A"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${pr.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : pr.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {pr.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {pr.requested_at ? new Date(pr.requested_at).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
