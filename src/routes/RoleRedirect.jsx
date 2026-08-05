import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function RoleRedirect() {
  const navigate = useNavigate();
  const { role: rawRole, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const role = (rawRole || "").toLowerCase();

    switch (role) {
      case "hr":
        navigate("/hr/dashboard", { replace: true });
        break;
      case "employee":
      case "engineer":
      case "site supervisor":
        navigate("/employee/dashboard", { replace: true });
        break;
      case "senior site supervisor":
        navigate("/supervisor/dashboard", { replace: true });
        break;
      case "client":
        navigate("/client/dashboard", { replace: true });
        break;
      case "store manager":
      case "store":
        navigate("/store/dashboard", { replace: true });
        break;
      case "procurement manager":
      case "procurement":
        navigate("/procurement/dashboard", { replace: true });
        break;
      case "admin":
      case "super admin":
      default:
        navigate("/admin/dashboard", { replace: true });
        break;
    }
  }, [isAuthenticated, rawRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-md">
        <div className="w-5 h-5 border-2 border-[#044C75] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-700">Redirecting to your workspace...</span>
      </div>
    </div>
  );
}
