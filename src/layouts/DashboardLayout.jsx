import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-layout-bg text-slate-800 font-sans p-2 sm:p-4 pt-20 sm:pt-20 lg:pt-4 gap-3 sm:gap-4 overflow-hidden">
      {/* Floating Island Sidebar */}
      <Sidebar />

      {/* Main Content Area (Navbar + Page Content) */}
      <div className="flex-1 flex flex-col min-w-0 gap-3 sm:gap-4 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-none pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}


