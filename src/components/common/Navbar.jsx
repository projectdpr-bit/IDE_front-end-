import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Home, ChevronRight } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const getUserInitials = () => {
    const name = user?.fullName || user?.employeeCode || user?.name || "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate a simple title based on path
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-16 px-6 bg-white rounded-[20px] flex items-center justify-between shrink-0 shadow-sm">
      {/* Left Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Home className="w-4 h-4 cursor-pointer hover:text-slate-800 transition-colors" />
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-800 font-bold">{getPageTitle()}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Bell Notification */}
        <button
          type="button"
          className="relative p-2.5 rounded-xl border border-slate-200/60 text-slate-400 hover:text-[#DC2604] hover:bg-rose-50/60 transition-colors cursor-pointer bg-white shadow-sm"
          title="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={2.5} />
          {/* Notification Dot */}
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#DC2604] rounded-full border border-white" />
        </button>

        {/* User initials badge */}
        <div
          className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200/60 shadow-sm cursor-pointer select-none hover:border-[#DC2604]/30 transition-colors"
          title={user?.fullName || "User Profile"}
        >
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
}


