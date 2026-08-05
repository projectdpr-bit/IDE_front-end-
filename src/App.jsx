import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/features/auth/Login";
import RoleRedirect from "@/routes/RoleRedirect";
import { useAuthStore } from "@/store/useAuthStore";

// Feature Module Dashboards & Pages
import AdminDashboard from "@/features/admin/AdminDashboard";
import DesignationsPage from "@/features/admin/DesignationsPage";
import ProjectsPage from "@/features/admin/ProjectsPage";
import StoreManagerPage from "@/features/admin/StoreManagerPage";
import SeniorEngineerPage from "@/features/admin/SeniorEngineerPage";
import DrawingsPage from "@/features/admin/DrawingsPage";
import SitesPage from "@/features/admin/SitesPage";
import StoresPage from "@/features/admin/StoresPage";
import ClientsPage from "@/features/admin/ClientsPage";
import DrawingPage from "@/features/admin/DrawingPage";
import AppSheetPage from "@/features/admin/AppSheetPage";
import LabourContractorsPage from "@/features/admin/LabourContractorsPage";
import JointersPage from "@/features/admin/JointersPage";
import WorksheetTemplatesPage from "@/features/admin/WorksheetTemplatesPage";

import HRDashboard from "@/features/hrms/HRDashboard";
import EmployeeListPage from "@/features/hrms/EmployeeListPage";
import AttendancePage from "@/features/hrms/AttendancePage";
import EmployeeDashboard from "@/features/hrms/EmployeeDashboard";

import SeniorSiteSupervisorDashboard from "@/features/supervisor/SeniorSiteSupervisorDashboard";

import ClientDashboard from "@/features/client/ClientDashboard";
import StoreDashboard from "@/features/store/StoreDashboard";
import StorePOPage from "@/features/store/StorePOPage";
import InventoryInwardPage from "@/features/store/InventoryInwardPage";
import InventoryOutwardPage from "@/features/store/InventoryOutwardPage";
import InHandStockPage from "@/features/store/InHandStockPage";
import RepairPage from "@/features/store/RepairPage";
import ProcurementDashboard from "@/features/procurement/ProcurementDashboard";
import VendorPage from "@/features/procurement/VendorPage";
import PurchaseRequestsPage from "@/features/procurement/PurchaseRequestsPage";
import POPage from "@/features/procurement/POPage";
import DIPage from "@/features/procurement/DIPage";
import BOQPage from "@/features/procurement/BOQPage";
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Smart Role-based index redirect */}
        <Route path="/" element={<RoleRedirect />} />

        {/* 1. Admin Feature Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/designations" element={<ProtectedRoute><DesignationsPage /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/admin/store-manager" element={<ProtectedRoute><StoreManagerPage /></ProtectedRoute>} />
        <Route path="/admin/senior-engineer" element={<ProtectedRoute><SeniorEngineerPage /></ProtectedRoute>} />
        <Route path="/admin/drawings" element={<ProtectedRoute><DrawingsPage /></ProtectedRoute>} />
        <Route path="/admin/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
        <Route path="/admin/stores" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
        <Route path="/admin/drawing" element={<ProtectedRoute><DrawingPage /></ProtectedRoute>} />
        <Route path="/admin/app-sheet" element={<ProtectedRoute><AppSheetPage /></ProtectedRoute>} />
        <Route path="/admin/dataset/labour-contractors" element={<ProtectedRoute><LabourContractorsPage /></ProtectedRoute>} />
        <Route path="/admin/dataset/jointers" element={<ProtectedRoute><JointersPage /></ProtectedRoute>} />
        <Route path="/admin/worksheet-templates" element={<ProtectedRoute><WorksheetTemplatesPage /></ProtectedRoute>} />

        {/* 2. HR / HRMS Feature Routes */}
        <Route path="/hr/dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
        <Route path="/hr/employee-list" element={<ProtectedRoute><EmployeeListPage /></ProtectedRoute>} />
        <Route path="/hr/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

        {/* 3. Employee / Field Feature Routes */}
        <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        
        {/* Supervisor Routes */}
        <Route path="/supervisor/dashboard" element={<ProtectedRoute><SeniorSiteSupervisorDashboard /></ProtectedRoute>} />

        {/* 4. Client Portal Routes */}
        <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />

        {/* 5. Store & Procurement Feature Routes */}
        <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
        <Route path="/store/pos" element={<ProtectedRoute><StorePOPage /></ProtectedRoute>} />
        <Route path="/store/inward" element={<ProtectedRoute><InventoryInwardPage /></ProtectedRoute>} />
        <Route path="/store/outward" element={<ProtectedRoute><InventoryOutwardPage /></ProtectedRoute>} />
        <Route path="/store/in-hand-stock" element={<ProtectedRoute><InHandStockPage /></ProtectedRoute>} />
        <Route path="/store/repair" element={<ProtectedRoute><RepairPage /></ProtectedRoute>} />
        <Route path="/procurement/dashboard" element={<ProtectedRoute><ProcurementDashboard /></ProtectedRoute>} />
        <Route path="/procurement/vendor" element={<ProtectedRoute><VendorPage /></ProtectedRoute>} />
        <Route path="/procurement/purchase-requests" element={<ProtectedRoute><PurchaseRequestsPage /></ProtectedRoute>} />
        <Route path="/procurement/po" element={<ProtectedRoute><POPage /></ProtectedRoute>} />
        <Route path="/procurement/di" element={<ProtectedRoute><DIPage /></ProtectedRoute>} />
        <Route path="/procurement/boq" element={<ProtectedRoute><BOQPage /></ProtectedRoute>} />
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
