import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Layers, FileText, CheckCircle2, Clock, Plus, Search, Filter, ArrowUpRight, Download, Eye, X, Image as ImageIcon } from "lucide-react";

export default function DrawingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [drawings, setDrawings] = useState([
    {
      id: "DWG-SLD-104",
      title: "Sub-Station 11kV Feeder Single Line Diagram (SLD)",
      category: "SLD Diagrams",
      project: "Sub-Station Feeder 11kV Expansion",
      author: "Eng. Rahul Mehta",
      date: "2026-07-20",
      version: "v3.2 Approved",
      status: "Approved",
      fileType: "PDF / DWG",
    },
    {
      id: "DWG-CAD-082",
      title: "Underground Cable Route & Trench Layout",
      category: "Feeder Layouts",
      project: "Rural Electrification Line B",
      author: "Senior Mgr. Alok Sharma",
      date: "2026-07-18",
      version: "v2.1 Pending Signoff",
      status: "Under Review",
      fileType: "DWG",
    },
    {
      id: "DWG-CIV-105",
      title: "Transformer Pad & Civil Foundation Blueprint",
      category: "Civil Works",
      project: "Industrial Feeder Line 5 Upgrade",
      author: "Eng. Vikas Verma",
      date: "2026-07-12",
      version: "v1.0 Approved",
      status: "Approved",
      fileType: "PDF",
    },
    {
      id: "DWG-SLD-109",
      title: "Digital Relay & Control Panel Wiring Schematics",
      category: "Sub-Station CAD",
      project: "Sub-Station Feeder 11kV Expansion",
      author: "Eng. Rahul Mehta",
      date: "2026-07-24",
      version: "v1.4 Approved",
      status: "Approved",
      fileType: "PDF / DWG",
    },
  ]);

  const filteredDrawings = drawings.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.project.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "All" || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-[#DC2604]" />
              Engineering Drawings & Blueprints
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized repository for Single Line Diagrams (SLD), CAD site maps, feeder layouts & revision approvals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Upload Blueprint Drawing
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Drawings</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{drawings.length}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across 3 Feeder Projects</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-[#DC2604]">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved SLDs</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {drawings.filter((d) => d.status === "Approved").length}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600/80 mt-0.5">Signed off by Chief Eng.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Revisions</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {drawings.filter((d) => d.status === "Under Review").length}
              </h3>
              <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">Under technical review</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CAD Formats</p>
              <h3 className="text-2xl font-bold text-sky-600 mt-1">DWG / PDF</h3>
              <p className="text-[11px] font-medium text-sky-600/80 mt-0.5">AutoCAD 2026 Compatible</p>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drawing title, ID or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {["All", "SLD Diagrams", "Feeder Layouts", "Sub-Station CAD", "Civil Works"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#DC2604] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrawings.map((dwg) => (
            <div key={dwg.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{dwg.title}</h3>
                    <p className="text-xs text-slate-500">{dwg.project} • {dwg.category}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    dwg.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {dwg.version}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Author Engineer:</span>
                  <span className="font-bold text-slate-800">{dwg.author}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Release Date:</span>
                  <span className="font-mono text-slate-700">{dwg.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">File Format:</span>
                  <span className="font-mono font-bold text-[#DC2604]">{dwg.fileType}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Code: {dwg.id}</span>
                <div className="flex items-center gap-3">
                  <button type="button" className="text-slate-600 font-bold hover:text-slate-900 cursor-pointer flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button type="button" className="text-[#DC2604] font-bold hover:underline cursor-pointer flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download DWG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Drawing Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload CAD Drawing / SLD Blueprint</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-3 text-xs" onSubmit={(e) => { e.preventDefault(); setShowUploadModal(false); }}>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Drawing Title</label>
                <input type="text" placeholder="e.g. Sub-Station 11kV Single Line Diagram" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]" required />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Drawing Category</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]">
                  <option>SLD Diagrams</option>
                  <option>Feeder Layouts</option>
                  <option>Sub-Station CAD</option>
                  <option>Civil Works</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select CAD File (.dwg, .pdf)</label>
                <input type="file" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604]" required />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm">Upload Blueprint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
