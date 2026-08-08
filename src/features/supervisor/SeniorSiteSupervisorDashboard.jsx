import { useState, useEffect } from "react";import { useApiRefreshStore } from "@/store/useApiRefreshStore";

import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { CalendarCheck, MapPin, ClipboardList, CheckCircle2, Box } from "lucide-react";
import apiClient from "@/lib/axios";

export default function SeniorSiteSupervisorDashboard() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const { user } = useAuthStore();
  const [stockMatrix, setStockMatrix] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [errorStock, setErrorStock] = useState(null);

  useEffect(() => {
    const fetchStockMatrix = async () => {
      let rawUser = null;
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          rawUser = parsedAuth?.state?.user || parsedAuth?.user || parsedAuth;
        }
      } catch(e) {}
      
      const empId = user?.employee_id || user?.employeeId || user?.id || user?.userId || rawUser?.employee_id || rawUser?.id;

      if (!empId) {
        setErrorStock("Employee ID not found. Cannot fetch stock matrix.");
        setLoadingStock(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/";
      try {
        const res = await apiClient.get(`${baseUrl}engineer/stock-matrix?employee_id=${empId}`);
        if (res.data?.success) {
          setStockMatrix(res.data.data || []);
        } else {
          setErrorStock(res.data?.message || "Failed to fetch stock matrix.");
        }
      } catch (err) {
        setErrorStock(err.response?.data?.message || "Error fetching stock matrix.");
      } finally {
        setLoadingStock(false);
      }
    };
    fetchStockMatrix();
  }, [user, refreshKey]);

  return (
    <DashboardLayout>
      <div className="space-y-[var(--space-6)] max-w-[var(--content-max-width)] mx-auto w-full">
        <div className="bg-gradient-to-r from-[var(--color-primary-top)] to-[var(--color-primary-bottom)] rounded-[var(--radius-2xl)] p-[var(--space-6)] md:p-[var(--space-8)] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
          <span className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-white/20 text-white text-[var(--text-xs)] font-bold uppercase tracking-wider inline-block mb-[var(--space-3)] backdrop-blur-sm">
            👷‍♂️ Senior Site Supervisor Workspace
          </span>
          <h1 className="text-[var(--text-3xl)] font-extrabold tracking-tight">
            Hello, {user?.fullName || user?.employeeCode || "Engineer"}!
          </h1>
          <p className="mt-[var(--space-2)] text-white/90 text-[var(--text-sm)] max-w-2xl">
            Manage site execution, track material usage, and oversee daily progress at your assigned locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-[var(--color-primary-top)]">
               <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-[var(--color-primary-top)]/10 flex items-center justify-center">
                 <CalendarCheck className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Attendance Today</h3>
            </div>
            <p className="text-[var(--text-xs)] text-slate-500">Punched In at 08:30 AM via GPS</p>
            <span className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] bg-green-50 text-green-700 text-[var(--text-2xs)] font-bold flex items-center gap-[var(--space-1)] w-fit border border-green-200">
              <CheckCircle2 className="w-[var(--icon-sm)] h-[var(--icon-sm)]" /> Marked Present
            </span>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-blue-600">
              <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-blue-50 flex items-center justify-center">
                 <MapPin className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Assigned Location</h3>
            </div>
            <p className="text-[var(--text-xs)] font-bold text-slate-800">11KV Feeder Line, Sector 4</p>
            <p className="text-[var(--text-xs)] text-slate-500">Ongoing execution</p>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] p-[var(--card-padding)] border border-[var(--color-layout-border)] shadow-sm space-y-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-3)] text-amber-600">
              <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-amber-50 flex items-center justify-center">
                 <ClipboardList className="w-[var(--icon-md)] h-[var(--icon-md)]" />
               </div>
              <h3 className="font-bold text-slate-800 text-[var(--text-sm)]">Today's Tasks</h3>
            </div>
            <p className="text-[var(--text-xs)] text-slate-500">Pole Erection: <strong>2 pending</strong></p>
            <p className="text-[var(--text-xs)] text-slate-500">Cable Laying: <strong>500m target</strong></p>
          </div>
        </div>

        {/* Stock Matrix Table */}
        <div className="flex flex-col gap-[var(--space-4)] mt-[var(--space-8)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <div className="w-[var(--icon-lg)] h-[var(--icon-lg)] rounded-[var(--radius-lg)] bg-[var(--color-primary-top)]/10 flex items-center justify-center text-[var(--color-primary-top)]">
              <Box className="w-[var(--icon-md)] h-[var(--icon-md)]" />
            </div>
            <h2 className="text-[var(--text-lg)] font-bold text-slate-800">My Stock Matrix</h2>
          </div>
          
          <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent rounded-[var(--radius-xl)] border border-[var(--color-layout-border)] bg-white shadow-sm">
            {loadingStock ? (
              <div className="p-[var(--space-6)] text-center text-slate-500 text-[var(--text-sm)] flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-slate-300 border-t-[var(--color-primary-top)] rounded-full animate-spin"></span>
                Loading stock data...
              </div>
            ) : errorStock ? (
              <div className="p-[var(--space-6)] text-center text-red-500 text-[var(--text-sm)]">
                {errorStock}
              </div>
            ) : stockMatrix.length === 0 ? (
              <div className="p-[var(--space-6)] text-center text-slate-500 text-[var(--text-sm)]">
                No stock data found in your matrix.
              </div>
            ) : (
              <table className="w-full min-w-[600px] border-collapse text-[var(--text-sm)]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-left">
                      Item Name
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      Outward Qty
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      Executed Qty
                    </th>
                    <th className="sticky top-0 z-10 px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-xs)] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                      In-hand Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap font-medium">
                        {item.name || item.boq_item_name}
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        {item.outward_qty} <span className="text-slate-400 text-[var(--text-xs)] ml-1">{item.unit}</span>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right">
                        {item.executed_qty} <span className="text-slate-400 text-[var(--text-xs)] ml-1">{item.unit}</span>
                      </td>
                      <td className="px-[var(--table-cell-px)] py-[var(--table-cell-py)] text-[var(--text-sm)] text-slate-700 border-b border-[var(--color-layout-border)] whitespace-nowrap text-right font-bold text-[var(--color-primary-top)]">
                        {item.in_hand_qty} <span className="text-slate-400 text-[var(--text-xs)] font-normal ml-1">{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
