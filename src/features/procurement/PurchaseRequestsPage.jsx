import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { FileText, Search, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import apiClient from "@/lib/axios";
import { GET_PROCUREMENT_PURCHASE_REQUESTS_API } from "@/utils/ApiHelper";

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchPurchaseRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(GET_PROCUREMENT_PURCHASE_REQUESTS_API);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching purchase requests:", err);
      setError("Failed to load purchase requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const toggleRow = (prId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(prId)) {
      newExpanded.delete(prId);
    } else {
      newExpanded.add(prId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.pr_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requested_by_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#DC2604]" />
              Purchase Requests
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and track all material purchase requests from projects.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PR number, project, or requester..."
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
            <button type="button" onClick={fetchPurchaseRequests} className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Purchase Requests Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Project</th>
                    <th className="py-3.5 px-5">Requested By</th>
                    <th className="py-3.5 px-5">Requested At</th>
                    <th className="py-3.5 px-5 text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No purchase requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <React.Fragment key={request.pr_id}>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5">
                            <p className="font-semibold text-slate-900">{request.project_name}</p>
                            {request.project_code && <p className="text-[10px] text-slate-500 font-mono">{request.project_code}</p>}
                          </td>
                          <td className="py-4 px-5">
                            <p className="font-semibold text-slate-900">{request.requested_by_name}</p>
                          </td>
                          <td className="py-4 px-5 text-slate-500">
                            {request.requested_at ? new Date(request.requested_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => toggleRow(request.pr_id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold transition-colors cursor-pointer"
                            >
                              {request.items?.length || 0} Items
                              {expandedRows.has(request.pr_id) ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Items Row */}
                        {expandedRows.has(request.pr_id) && request.items && request.items.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan="4" className="py-4 px-5">
                              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="bg-slate-100/50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                                      <th className="py-2.5 px-4">Material Name</th>
                                      <th className="py-2.5 px-4">Quantity</th>
                                      <th className="py-2.5 px-4">Unit</th>
                                      <th className="py-2.5 px-4">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {request.items.map((item) => (
                                      <tr key={item.pr_item_id} className="text-xs">
                                        <td className="py-2.5 px-4 font-semibold text-slate-800">{item.material_name}</td>
                                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.quantity}</td>
                                        <td className="py-2.5 px-4 text-slate-500">{item.unit}</td>
                                        <td className="py-2.5 px-4 text-slate-500">{item.remarks || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
