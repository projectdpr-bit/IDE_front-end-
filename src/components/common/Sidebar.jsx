import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { menu } from "@/data/menu";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronLeft, ChevronRight, LayoutDashboard, FolderKanban, ListTodo, ClipboardCheck, Tag, ShoppingCart, Activity, FileText, IndianRupee, Users, Building2, LogOut, UserMinus, MapPin, Store, Award, HardHat, Layers, FileSpreadsheet } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role: rawRole, logout } = useAuthStore();
  const role = (rawRole || "admin").toLowerCase();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleMenu = menu[role] || menu.admin || [];

  // Mapping specific icons based on menu path/name (for a rich UI matching the final image)
  const getMenuIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("dashboard") || n.includes("home")) return <LayoutDashboard className="w-4.5 h-4.5" />;
    if (n.includes("designation")) return <Award className="w-4.5 h-4.5" />;
    if (n.includes("project")) return <FolderKanban className="w-4.5 h-4.5" />;
    if (n.includes("procurement")) return <ShoppingCart className="w-4.5 h-4.5" />;
    if (n.includes("store")) return <Store className="w-4.5 h-4.5" />;
    if (n.includes("engineer")) return <HardHat className="w-4.5 h-4.5" />;
    if (n.includes("drawing")) return <Layers className="w-4.5 h-4.5" />;
    if (n.includes("resignation")) return <UserMinus className="w-4.5 h-4.5" />;
    if (n.includes("site") || n.includes("side")) return <MapPin className="w-4.5 h-4.5" />;
    if (n.includes("task") || n.includes("attendance")) return <ListTodo className="w-4.5 h-4.5" />;
    if (n.includes("ticket") || n.includes("leave")) return <Tag className="w-4.5 h-4.5" />;
    if (n.includes("order")) return <ShoppingCart className="w-4.5 h-4.5" />;
    if (n.includes("stage")) return <Activity className="w-4.5 h-4.5" />;
    if (n.includes("document") || n.includes("policy")) return <FileText className="w-4.5 h-4.5" />;
    if (n.includes("expense") || n.includes("payslip")) return <IndianRupee className="w-4.5 h-4.5" />;
    if (n.includes("contact") || n.includes("user") || n.includes("employee")) return <Users className="w-4.5 h-4.5" />;
    if (n.includes("company") || n.includes("client")) return <Building2 className="w-4.5 h-4.5" />;
    if (n.includes("sheet")) return <FileSpreadsheet className="w-4.5 h-4.5" />;
    
    return <LayoutDashboard className="w-4.5 h-4.5" />;
  };

  return (
    <>
      {/* Mobile Menu Trigger & Header */}
      <div className="lg:hidden flex items-center justify-between w-full h-16 px-6 bg-white text-slate-800 fixed top-0 left-0 z-30 select-none shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/colourlogo.svg" alt="IED Infrastructure Logo" className="h-8 w-auto" />
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
        >
          <span
            className="w-6 h-6 bg-current inline-block"
            style={{
              maskImage: "url(/icons/menu.svg)",
              WebkitMaskImage: "url(/icons/menu.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileOpen && (
        <>
          {/* Backdrop for closing when clicking outside */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]"
          />
          {/* Dropdown Container */}
          <div className="lg:hidden fixed top-18 right-4 w-60 bg-white rounded-[20px] shadow-xl border border-slate-100 z-50 p-2 flex flex-col animate-in slide-in-from-top-4 fade-in duration-200">
            <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto scrollbar-none px-1">
              {roleMenu.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                      isActive
                        ? "bg-[#DC2604] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#DC2604]"
                    }`}
                  >
                    <div className={`flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}>
                      {getMenuIcon(item.name)}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-100 pt-2 mt-2 px-1">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl text-rose-500 bg-white hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" strokeWidth={2.5} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Floating Island Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col h-full gap-4 shrink-0 z-40 select-none transition-all duration-300 ${
          isCollapsed ? "w-16.25" : "w-64"
        }`}
      >
        
        {/* Card 1: Logo & Collapse Button */}
        <div className="bg-white rounded-[20px] p-4 flex items-center justify-between shadow-sm shrink-0 min-h-16">
          {!isCollapsed && <img src="/colourlogo.svg" alt="IED Logo" className="h-8 w-auto transition-opacity duration-300" />}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-9 h-9 bg-[#DC2604] rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-primary-bottom transition-colors shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" strokeWidth={3} /> : <ChevronLeft className="w-4 h-4" strokeWidth={3} />}
          </button>
        </div>

        {/* Card 2: Main Navigation Menu */}
        <div className="bg-white rounded-[20px] p-3 flex-1 overflow-y-auto shadow-sm scrollbar-none">
          <nav className="flex flex-col gap-1.5">
            {roleMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold overflow-hidden ${
                    isCollapsed ? "px-0 justify-center" : "px-4"
                  } ${
                    isActive
                      ? "bg-[#DC2604] text-white shadow-md shadow-red-500/20"
                      : "text-slate-600 hover:bg-rose-50 hover:text-[#DC2604]"
                  }`}
                >
                  <div className={`flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}>
                    {getMenuIcon(item.name)}
                  </div>
                  {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Card 3: Logout Button */}
        <div className="bg-white rounded-[20px] p-2 shadow-sm shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors overflow-hidden ${
              isCollapsed ? "justify-center px-0" : "px-4"
            }`}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" strokeWidth={2.5} />
            {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">Logout</span>}
          </button>
        </div>

      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowLogoutConfirm(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 z-10 transition-all text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#DC2604] border border-rose-100">
              <span
                className="w-6 h-6 bg-current inline-block"
                style={{
                  maskImage: "url(/icons/warning.svg)",
                  WebkitMaskImage: "url(/icons/warning.svg)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Confirm Log Out
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to log out of your account? You will need to sign in again.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 px-4 py-2.5 text-xs font-bold bg-[#DC2604] hover:bg-[#BE1E03] rounded-xl text-white shadow-sm transition-colors"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


