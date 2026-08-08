import { useState, useEffect } from "react";
import { useApiRefreshStore } from "@/store/useApiRefreshStore";
import { authStorage } from "@/utils/authStorage";
import DashboardLayout from "@/layouts/DashboardLayout";
import SideDrawer from "@/components/ui/SideDrawer";
import apiClient from "@/lib/axios";
import { useForm } from "@/hooks/useForm";
import { validators } from "@/utils/validation";
import { formatIndianCurrency } from "@/utils/formatters";
import {
  GET_PROJECT_API,
  GET_CLIENT_API,
  ADD_PROJECT_API,
  ADD_PROJECT_ASSIGNMENT_API,
  GET_SENIOR_SITE_SUPERVISORS_LIST_API,
  GET_SITES_API,
  ADD_SITE_API,
  GET_SITE_ASSIGNMENTS_API,
  ADD_SITE_ASSIGNMENT_API,
  GET_SITE_ENGINEERS_API,
  GET_STORES_LIST_API,
  GET_STORE_MANAGER_LIST_API,
  ASSIGN_STORE_MANAGER_API,
  GET_PROCUREMENT_OFFICERS_API,
  ASSIGN_PROCUREMENT_OFFICER_API,
} from "@/utils/ApiHelper";
import { FolderGit2, Plus, Search, Loader2, Edit3, Trash2, UserPlus, RefreshCw, AlertCircle, MapPin, Building, FileText, Eye, Calendar, DollarSign, Fingerprint } from "lucide-react";

export default function ProjectsPage() {
  const refreshKey = useApiRefreshStore((state) => state.refreshKey);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteEngineers, setSiteEngineers] = useState([]);
  const [siteAssignments, setSiteAssignments] = useState([]);

  const [storesList, setStoresList] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);
  const [procurementOfficers, setProcurementOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Drawer / Modal States
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showAddSiteDrawer, setShowAddSiteDrawer] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // Edit
  const [projectToDelete, setProjectToDelete] = useState(null); // Delete
  const [projectToAssign, setProjectToAssign] = useState(null); // Assign
  const [projectToView, setProjectToView] = useState(null); // View Details

  // Form State for Project Creation / Edit
  const {
    values: formData,
    errors: formErrors,
    handleChange: handleFormChange,
    validateAll: validateForm,
    setValues: setFormData,
    setErrors: setFormErrors,
  } = useForm({
    project_name: "",
    client_id: "",
    start_date: "",
    end_date: "",
    boq: "",
    location: "",
    description: "",
  }, {
    project_name: [validators.required],
    client_id: [validators.required],
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Assignment Drawer Form State

  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState("");

  const {
    values: assignData,
    errors: assignErrors,
    handleChange: handleAssignChange,
    validateAll: validateAssign,
    setValues: setAssignData,
    setErrors: setAssignErrors,
  } = useForm({
    selectedEmployeeId: "",
    site_id: "",
    employee_id: "",
    store_id: "",
    store_manager_employee_id: "",
    procurement_officer_id: "",
  }, {
    selectedEmployeeId: [validators.required],
    site_id: [validators.required],
    employee_id: [validators.required],
    store_id: [validators.required],
    store_manager_employee_id: [validators.required],
    procurement_officer_id: [validators.required],
  });

  // Form State for Site Creation
  const [submittingSite, setSubmittingSite] = useState(false);
  const [siteError, setSiteError] = useState("");
  
  const [subDivisions, setSubDivisions] = useState([
    { sub_division_name: "", feeders: [{ feeder_name: "", locations: [""] }] }
  ]);

  const {
    values: siteData,
    errors: siteErrors,
    handleChange: handleSiteChange,
    validateAll: validateSite,
    setValues: setSiteData,
    setErrors: setSiteErrors,
  } = useForm({
    site_name: "",
    project_id: "",
    store_id: "",
    site_status: "active",
  }, {
    site_name: [validators.required],
    project_id: [validators.required],
    store_id: [validators.required],
    site_status: [validators.required],
  });

  // Fetch Projects and Clients via GET APIs
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, clientsRes, supervisorsRes, sitesRes, engineersRes, siteAssignmentsRes, storesRes, storeManagersRes, procurementOfficersRes] = await Promise.all([
        apiClient.get(GET_PROJECT_API),
        apiClient.get(GET_CLIENT_API).catch((err) => {
          console.warn("GET /admin/clients failed or unavailable:", err);
          return { data: { success: false } };
        }),
        apiClient.get(GET_SENIOR_SITE_SUPERVISORS_LIST_API).catch((err) => {
          console.warn("GET /admin/employees/senior-site-supervisors failed:", err);
          return { data: { success: false } };
        }),
        apiClient.get(GET_SITES_API).catch(() => ({ data: { success: false } })),
        apiClient.get(GET_SITE_ENGINEERS_API).catch(() => ({ data: { success: false } })),
        apiClient.get(GET_SITE_ASSIGNMENTS_API).catch(() => ({ data: { success: false } })),
        apiClient.get(GET_STORES_LIST_API).catch(() => ({ data: { success: false } })),
        apiClient.get(GET_STORE_MANAGER_LIST_API).catch(() => ({ data: { success: false } })),
        apiClient.get(GET_PROCUREMENT_OFFICERS_API).catch(() => ({ data: { success: false } })),
      ]);

      if (clientsRes.data && clientsRes.data.success && Array.isArray(clientsRes.data.data)) {
        setClients(clientsRes.data.data);
      }

      if (supervisorsRes.data && supervisorsRes.data.success && Array.isArray(supervisorsRes.data.data)) {
        setSupervisors(supervisorsRes.data.data);
      }

      if (sitesRes.data && sitesRes.data.success && Array.isArray(sitesRes.data.data)) {
        setSites(sitesRes.data.data);
      }

      if (engineersRes.data && engineersRes.data.success && Array.isArray(engineersRes.data.data)) {
        setSiteEngineers(engineersRes.data.data);
      }


      if (siteAssignmentsRes.data && siteAssignmentsRes.data.success && Array.isArray(siteAssignmentsRes.data.data)) {
        setSiteAssignments(siteAssignmentsRes.data.data);
      }

      if (storesRes.data && storesRes.data.success && Array.isArray(storesRes.data.data)) {
        setStoresList(storesRes.data.data);
      }

      if (storeManagersRes.data && storeManagersRes.data.success && Array.isArray(storeManagersRes.data.data)) {
        setStoreManagers(storeManagersRes.data.data);
      }

      if (procurementOfficersRes.data && procurementOfficersRes.data.success && Array.isArray(procurementOfficersRes.data.data)) {
        setProcurementOfficers(procurementOfficersRes.data.data);
      }

      if (projectsRes.data && projectsRes.data.success && Array.isArray(projectsRes.data.data)) {
        setProjects(projectsRes.data.data);
      } else {
        setProjects([]);
        setError(projectsRes.data?.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error("Error fetching projects or clients:", err);
      setProjects([]);
      setError(err.response?.data?.message || "Network error. Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(fetchData, 0);
  }, [refreshKey]);

  // Helper to resolve client_name from client_id
  const getClientName = (clientId) => {
    if (!clientId) return "N/A";
    const found = clients.find((c) => String(c.client_id) === String(clientId));
    return found ? found.client_name : `Client #${clientId}`;
  };

  const handleOpenAddDrawer = () => {
    setSelectedProject(null);
    setFormError("");
    setFormData({
      project_name: "",
      client_id: clients[0]?.client_id || "",
      start_date: "",
      end_date: "",
      boq: "",
      location: "",
      description: "",
    });
    setFormErrors({});
    setShowAddDrawer(true);
  };

  const handleOpenEditDrawer = (project) => {
    setSelectedProject(project);
    setFormError("");
    setFormData({
      project_name: project.project_name || "",
      client_id: project.client_id || "",
      start_date: project.start_date ? project.start_date.split("T")[0] : "",
      end_date: project.end_date ? project.end_date.split("T")[0] : "",
      boq: project.boq || "",
      location: project.location || "",
      description: project.description || "",
    });
    setFormErrors({});
    setShowAddDrawer(true);
  };

  // Submit Handler for Create / Edit Project
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (selectedProject) {
        // Edit mode logic
        setShowAddDrawer(false);
        setSelectedProject(null);
      } else {
        // POST /admin/projects payload
        const currentUser = authStorage.getUser();
        const employeeId = currentUser?.employeeId ?? currentUser?.employee_id ?? currentUser?.id ?? null;
        const payload = {
          project_name: formData.project_name,
          client_id: Number(formData.client_id) || formData.client_id,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          boq: formData.boq ? Number(formData.boq) : undefined,
          location: formData.location || undefined,
          description: formData.description || undefined,
          created_by: employeeId ? parseInt(employeeId) : undefined,
        };

        const response = await apiClient.post(ADD_PROJECT_API, payload);

        if (response.data && response.data.success) {
          // Close drawer, reset form, and auto-reload live GET data
          setShowAddDrawer(false);
          setFormData({
            project_name: "",
            client_id: "",
            start_date: "",
            end_date: "",
            boq: "",
            location: "",
            description: "",
          });
          fetchData(); // Reload live GET data
        } else {
          setFormError(response.data?.message || "Failed to create project.");
        }
      }
    } catch (err) {
      console.error("Error creating project via POST /admin/projects:", err);
      setFormError(
        err.response?.data?.message || "Failed to save project. Please check network connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddSiteDrawer = () => {
    setSiteError("");
    setSiteData({
      site_name: "",
      project_id: "",
      store_id: "",
      site_status: "active",
    });
    setSubDivisions([
      { sub_division_name: "", feeders: [{ feeder_name: "", locations: [""] }] }
    ]);
    setSiteErrors({});
    setShowAddSiteDrawer(true);
  };

  const handleSubmitSite = async (e) => {
    e.preventDefault();
    if (!validateSite()) return;
    setSubmittingSite(true);
    setSiteError("");
    try {
      const payload = {
        site_name: siteData.site_name,
        project_id: parseInt(siteData.project_id, 10),
        store_id: parseInt(siteData.store_id, 10),
        site_status: siteData.site_status,
        sub_divisions: subDivisions.map(sd => ({
          sub_division_name: sd.sub_division_name,
          feeders: sd.feeders.map(f => ({
            feeder_name: f.feeder_name,
            locations: f.locations.filter(l => l.trim() !== "")
          }))
        }))
      };
      const response = await apiClient.post(ADD_SITE_API, payload);
      if (response.data?.success) {
        setShowAddSiteDrawer(false);
        fetchData(); // Reload live GET data to reflect new sites
      } else {
        setSiteError(response.data?.message || "Failed to create site.");
      }
    } catch (err) {
      console.error("Error creating site:", err);
      setSiteError(err.response?.data?.message || "Failed to create site.");
    } finally {
      setSubmittingSite(false);
    }
  };

  const handleAddSubDivision = () => {
    setSubDivisions([...subDivisions, { sub_division_name: "", feeders: [{ feeder_name: "", locations: [""] }] }]);
  };

  const handleRemoveSubDivision = (index) => {
    setSubDivisions(subDivisions.filter((_, i) => i !== index));
  };

  const handleSubDivisionChange = (index, value) => {
    const newSd = [...subDivisions];
    newSd[index].sub_division_name = value;
    setSubDivisions(newSd);
  };

  const handleAddFeeder = (sdIndex) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders.push({ feeder_name: "", locations: [""] });
    setSubDivisions(newSd);
  };

  const handleRemoveFeeder = (sdIndex, fIndex) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders = newSd[sdIndex].feeders.filter((_, i) => i !== fIndex);
    setSubDivisions(newSd);
  };

  const handleFeederChange = (sdIndex, fIndex, value) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders[fIndex].feeder_name = value;
    setSubDivisions(newSd);
  };

  const handleAddLocation = (sdIndex, fIndex) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders[fIndex].locations.push("");
    setSubDivisions(newSd);
  };

  const handleRemoveLocation = (sdIndex, fIndex, lIndex) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders[fIndex].locations = newSd[sdIndex].feeders[fIndex].locations.filter((_, i) => i !== lIndex);
    setSubDivisions(newSd);
  };

  const handleLocationChange = (sdIndex, fIndex, lIndex, value) => {
    const newSd = [...subDivisions];
    newSd[sdIndex].feeders[fIndex].locations[lIndex] = value;
    setSubDivisions(newSd);
  };

  const handleOpenAssignDrawer = (project) => {
    setProjectToAssign(project);
    setAssignError("");
    setAssignData({
      selectedEmployeeId: supervisors[0]?.employee_id || "",
      site_id: siteAssignments[0]?.site_id || "",
      employee_id: "",
      store_id: storesList[0]?.store_id || storesList[0]?.id || "",
      store_manager_employee_id: "",
      procurement_officer_id: "",
    });
    setAssignErrors({});
  };

  // Submit Handler for both Project and Site Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignSubmitting(true);
    setAssignError("");

    if (!validateAssign()) {
      setAssignSubmitting(false);
      return;
    }

    try {
      // 1. Prepare Project Assignment Payload
      const projectPayload = {
        project_id: parseInt(projectToAssign?.project_id || projectToAssign?.id, 10),
        employee_id: parseInt(assignData.selectedEmployeeId, 10),
      };

      // 2. Prepare Site Assignment Payload (Strictly as requested)
      const sitePayload = {
        site_id: parseInt(assignData.site_id, 10),
        employee_id: parseInt(assignData.employee_id, 10),
        assignment_role: "Supervisor", 
        reports_to: parseInt(assignData.selectedEmployeeId, 10)
      };

      // 3. Prepare Store Manager Assignment Payload
      const storePayload = {
        store_id: parseInt(assignData.store_id, 10),
        store_manager_id: parseInt(assignData.store_manager_employee_id, 10)
      };

      // 4. Prepare Procurement Officer Assignment Payload
      const procPayload = {
        project_id: parseInt(projectToAssign?.project_id || projectToAssign?.id, 10),
        employee_id: parseInt(assignData.procurement_officer_id, 10)
      };

      console.log("Submitting Project Assignment Payload:", projectPayload);
      console.log("Submitting Site Assignment Payload:", sitePayload);
      console.log("Submitting Store Assignment Payload:", storePayload);
      console.log("Submitting Procurement Assignment Payload:", procPayload);

      const axiosConfig = {
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve promise for 2xx, 3xx, 4xx
        }
      };

      // Execute Project Assignment
      let pErr = null;
      try {
        const pRes = await apiClient.post(ADD_PROJECT_ASSIGNMENT_API, projectPayload, axiosConfig);
        console.log("Project API Response:", pRes.status, pRes.data);
        if (!pRes.data?.success) {
          pErr = pRes.data?.message || JSON.stringify(pRes.data) || "Failed to assign project.";
        }
      } catch (err) {
        console.error("Project Assignment Error:", err);
        pErr = "Network error or server unavailable.";
      }

      // Execute Site Assignment
      let sErr = null;
      try {
        const sRes = await apiClient.post(ADD_SITE_ASSIGNMENT_API, sitePayload, axiosConfig);
        console.log("Site API Response:", sRes.status, sRes.data);
        if (!sRes.data?.success) {
          sErr = sRes.data?.message || JSON.stringify(sRes.data) || "Failed to assign site.";
        }
      } catch (err) {
        console.error("Site Assignment Error:", err);
        sErr = "Network error or server unavailable.";
      }

      // Execute Store Assignment
      let stErr = null;
      try {
        const stRes = await apiClient.post(ASSIGN_STORE_MANAGER_API, storePayload, axiosConfig);
        console.log("Store API Response:", stRes.status, stRes.data);
        if (!stRes.data?.success) {
          stErr = stRes.data?.message || JSON.stringify(stRes.data) || "Failed to assign store.";
        }
      } catch (err) {
        console.error("Store Assignment Error:", err);
        stErr = "Network error or server unavailable.";
      }

      // Execute Procurement Assignment
      let procErr = null;
      try {
        const procRes = await apiClient.post(ASSIGN_PROCUREMENT_OFFICER_API, procPayload, axiosConfig);
        console.log("Procurement API Response:", procRes.status, procRes.data);
        if (!procRes.data?.success) {
          procErr = procRes.data?.message || JSON.stringify(procRes.data) || "Failed to assign procurement officer.";
        }
      } catch (err) {
        console.error("Procurement Assignment Error:", err);
        procErr = "Network error or server unavailable.";
      }

      if (pErr || sErr || stErr || procErr) {
        setAssignError(
          (pErr ? `Project API: ${pErr} | ` : "") + 
          (sErr ? `Site API: ${sErr} | ` : "") +
          (stErr ? `Store API: ${stErr} | ` : "") +
          (procErr ? `Procurement API: ${procErr}` : "")
        );
      } else {
        setProjectToAssign(null);
        setAssignData({ selectedEmployeeId: "", site_id: "", employee_id: "", store_id: "", store_manager_employee_id: "", procurement_officer_id: "" });
        fetchData(); // Reload live GET data
      }
    } catch (err) {
      console.error("Error assigning:", err);
      setAssignError(
        err.response?.data?.message || "Failed to save assignment. Please check connection."
      );
    } finally {
      setAssignSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    const resolvedClientName = getClientName(p.client_id);
    return (
      (p.project_name && p.project_name.toLowerCase().includes(q)) ||
      (resolvedClientName && resolvedClientName.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
          <div>
            <div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <FolderGit2 className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">Projects Management</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">Enterprise projects list, client details, locations & site assignments.</p>
            </div>
          </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
              title="Refresh Projects API"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#DC2604]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenAddSiteDrawer}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors border border-slate-200"
            >
              <Plus className="w-4 h-4" /> Create Site
            </button>

            <button
              type="button"
              onClick={handleOpenAddDrawer}
              className="bg-[#DC2604] hover:bg-primary-bottom text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, client, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 transition-all placeholder:text-slate-400"
            />
          </div>
          <span className="text-2xs font-bold text-slate-400 hidden sm:inline-block">
            Total Projects: {filteredProjects.length}
          </span>
        </div>

        {/* Error Banner */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#DC2604] shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="px-3 py-1.5 bg-[#DC2604] text-white rounded-xl font-bold hover:bg-primary-bottom transition-colors cursor-pointer"
            >
              Retry GET
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-[#DC2604] animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading Projects via GET /admin/projects...</p>
          </div>
        )}

        {/* Projects Cards Grid - Strictly showing Project Name, Client Name, Location, Description & Action Buttons */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                No projects found matching "{search}".
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.project_id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Project Header: Icon & Project Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#DC2604] font-bold shrink-0">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                          {project.project_name || "Unnamed Project"}
                        </h3>
                      </div>
                    </div>

                    {/* Meta Details Box: Client Name & Location */}
                    <div className="bg-slate-50/80 rounded-xl p-3 space-y-2 border border-slate-100/80 text-xs">
                      {/* Client Name */}
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400 font-normal">Client:</span>
                        <span className="text-slate-900 font-bold truncate">
                          {getClientName(project.client_id)}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400 font-normal">Location:</span>
                        <span className="text-slate-800 font-medium truncate">
                          {project.location || project.address || "Location Not Specified"}
                        </span>
                      </div>
                    </div>

                    {/* Description Box */}
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Description:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-normal text-xs line-clamp-3">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Footer: Edit, Delete, Assign Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => setProjectToView(project)}
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      View
                    </button>

                    {/* Assign Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAssignDrawer(project)}
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-sky-100"
                      title="Assign Project"
                    >
                      <UserPlus className="w-3.5 h-3.5 shrink-0" />
                      Assign
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditDrawer(project)}
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 text-[#DC2604] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Global Right Side Drawer for Create/Edit Project */}
      <SideDrawer
        isOpen={showAddDrawer || Boolean(selectedProject)}
        onClose={() => {
          setShowAddDrawer(false);
          setSelectedProject(null);
          setFormError("");
        }}
        title={selectedProject ? `Edit Project (${selectedProject.project_name})` : "Create New Project"}
        subtitle={selectedProject ? "Modify existing project details" : "Add a new enterprise contracting project"}
        icon={FolderGit2}
        submitText={selectedProject ? "Update Project" : "Save Project"}
        loading={submitting}
        onSubmit={handleSubmitProject}
      >
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {formError}
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Project Name</label>
          <input
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleFormChange}
            placeholder="e.g. FTTH Fiber Rollout"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC2604]/15 font-medium transition-all text-slate-900 ${formErrors.project_name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          />
          {formErrors.project_name && <p className="text-red-500 text-xs mt-1">{formErrors.project_name}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Select Client</label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleFormChange}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${formErrors.client_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
          >
            {clients.map((client) => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name} (ID: #{client.client_id})
              </option>
            ))}
          </select>
          {formErrors.client_id && <p className="text-red-500 text-xs mt-1">{formErrors.client_id}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleFormChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleFormChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] font-medium text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">BOQ Amount (₹)</label>
          <input
            type="number"
            name="boq"
            value={formData.boq}
            onChange={handleFormChange}
            placeholder="e.g. 5000000"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 font-medium transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            placeholder="e.g. Chandkheda, Ahmedabad"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 font-medium transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="e.g. Fiber to the home installations"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#DC2604] focus:ring-2 focus:ring-[#DC2604]/15 font-medium h-24 resize-none transition-all text-slate-900"
          />
        </div>
      </SideDrawer>

      {/* Assign Side Drawer */}
      <SideDrawer
        isOpen={Boolean(projectToAssign)}
        onClose={() => {
          setProjectToAssign(null);
          setAssignError("");
        }}
        title={`Assign Project (${projectToAssign?.project_name})`}
        subtitle={`Set assignments for Project #${projectToAssign?.project_id}`}
        icon={UserPlus}
        submitText="Save Assignments"
        loading={assignSubmitting}
        onSubmit={handleAssignSubmit}
      >
        {assignError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {assignError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Senior Site Supervisor</label>
            <select
              name="selectedEmployeeId"
              value={assignData.selectedEmployeeId}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.selectedEmployeeId ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {supervisors.length === 0 ? (
                <option value="">No supervisors available</option>
              ) : (
                supervisors.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name} (Employee ID: #{emp.employee_id})
                  </option>
                ))
              )}
            </select>
            {assignErrors.selectedEmployeeId && <p className="text-red-500 text-xs mt-1">{assignErrors.selectedEmployeeId}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Site</label>
            <select
              name="site_id"
              value={assignData.site_id}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.site_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {sites.length === 0 ? (
                <option value="">No sites available</option>
              ) : (
                <>
                  <option value="">-- Select Site --</option>
                  {sites.map((site) => {
                    const sid = site.site_id || site.id;
                    const sname = site.site_name || site.name || `Site #${sid}`;
                    return (
                      <option key={sid} value={sid}>
                        {sname} (ID: #{sid})
                      </option>
                    );
                  })}
                </>
              )}
            </select>
            {assignErrors.site_id && <p className="text-red-500 text-xs mt-1">{assignErrors.site_id}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Site Engineer</label>
            <select
              name="employee_id"
              value={assignData.employee_id}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.employee_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {siteEngineers.length === 0 ? (
                <option value="">No site engineers available</option>
              ) : (
                <option value="">-- Select Site Engineer --</option>
              )}
              {siteEngineers.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} (Employee ID: #{emp.employee_id})
                </option>
              ))}
            </select>
            {assignErrors.employee_id && <p className="text-red-500 text-xs mt-1">{assignErrors.employee_id}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Store</label>
            <select
              name="store_id"
              value={assignData.store_id}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.store_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {storesList.length === 0 ? (
                <option value="">No stores available</option>
              ) : (
                <>
                  <option value="">-- Select Store --</option>
                  {storesList.map((store) => {
                    const sid = store.store_id || store.id;
                    const sname = store.store_name || store.name || `Store #${sid}`;
                    return (
                      <option key={sid} value={sid}>
                        {sname} (ID: #{sid})
                      </option>
                    );
                  })}
                </>
              )}
            </select>
            {assignErrors.store_id && <p className="text-red-500 text-xs mt-1">{assignErrors.store_id}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Store Manager</label>
            <select
              name="store_manager_employee_id"
              value={assignData.store_manager_employee_id}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.store_manager_employee_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {storeManagers.length === 0 ? (
                <option value="">No store managers available</option>
              ) : (
                <option value="">-- Select Store Manager --</option>
              )}
              {storeManagers.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} (Employee ID: #{emp.employee_id})
                </option>
              ))}
            </select>
            {assignErrors.store_manager_employee_id && <p className="text-red-500 text-xs mt-1">{assignErrors.store_manager_employee_id}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select Procurement Officer</label>
            <select
              name="procurement_officer_id"
              value={assignData.procurement_officer_id}
              onChange={handleAssignChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 ${assignErrors.procurement_officer_id ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#DC2604]'}`}
            >
              {procurementOfficers.length === 0 ? (
                <option value="">No procurement officers available</option>
              ) : (
                <option value="">-- Select Procurement Officer --</option>
              )}
              {procurementOfficers.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} (Employee ID: #{emp.employee_id})
                </option>
              ))}
            </select>
            {assignErrors.procurement_officer_id && <p className="text-red-500 text-xs mt-1">{assignErrors.procurement_officer_id}</p>}
          </div>
        </div>
      </SideDrawer>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setProjectToDelete(null)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 z-10 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-[#DC2604] rounded-2xl border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete "{projectToDelete.project_name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#DC2604] hover:bg-primary-bottom rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Details Drawer */}
      <SideDrawer
        isOpen={Boolean(projectToView)}
        onClose={() => setProjectToView(null)}
        title="Project Details"
        subtitle={`Full details for Project #${projectToView?.project_id || projectToView?.id}`}
        icon={FileText}
        submitText="Close Details"
        cancelText={null}
        onSubmit={(e) => { e.preventDefault(); setProjectToView(null); }}
      >
        {projectToView && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Project ID</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{projectToView.project_id || projectToView.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Project Name</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{projectToView.project_name || "Unnamed Project"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Client Name</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{getClientName(projectToView.client_id)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Location</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{projectToView.location || projectToView.address || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Duration</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {projectToView.start_date ? new Date(projectToView.start_date).toLocaleDateString() : "Not Set"} 
                    {" - "} 
                    {projectToView.end_date ? new Date(projectToView.end_date).toLocaleDateString() : "Not Set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">BOQ Amount</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {projectToView.boq ? formatIndianCurrency(projectToView.boq) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {projectToView.description || "No description provided."}
              </p>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Create Site Drawer */}
      <SideDrawer
        isOpen={showAddSiteDrawer}
        onClose={() => setShowAddSiteDrawer(false)}
        title="Create New Site"
        subtitle="Add a new site to an existing project"
        icon={MapPin}
        submitText="Create Site"
        onSubmit={handleSubmitSite}
        loading={submittingSite}
      >
        {siteError && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{siteError}</p>
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Site Name</label>
          <input
            type="text"
            name="site_name"
            value={siteData.site_name}
            onChange={handleSiteChange}
            placeholder="e.g. Gandhinagar Substation Site"
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${
              siteErrors.site_name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DC2604]"
            }`}
          />
          {siteErrors.site_name && <p className="text-red-500 text-xs mt-1">{siteErrors.site_name}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Project</label>
          <select
            name="project_id"
            value={siteData.project_id}
            onChange={handleSiteChange}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${
              siteErrors.project_id ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DC2604]"
            }`}
          >
            <option value="">-- Select Project --</option>
            {projects.map((proj) => (
              <option key={proj.project_id || proj.id} value={proj.project_id || proj.id}>
                {proj.project_name || `Project #${proj.project_id || proj.id}`}
              </option>
            ))}
          </select>
          {siteErrors.project_id && <p className="text-red-500 text-xs mt-1">{siteErrors.project_id}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Store</label>
          <select
            name="store_id"
            value={siteData.store_id}
            onChange={handleSiteChange}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${
              siteErrors.store_id ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DC2604]"
            }`}
          >
            <option value="">-- Select Store --</option>
            {storesList.map((store) => (
              <option key={store.store_id || store.id} value={store.store_id || store.id}>
                {store.store_name || `Store #${store.store_id || store.id}`}
              </option>
            ))}
          </select>
          {siteErrors.store_id && <p className="text-red-500 text-xs mt-1">{siteErrors.store_id}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 block">Sub Divisions</label>
            <button
              type="button"
              onClick={handleAddSubDivision}
              className="text-xs text-[#DC2604] hover:text-primary-bottom font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Sub Division
            </button>
          </div>
          {subDivisions.map((sd, sdIndex) => (
            <div key={sdIndex} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={sd.sub_division_name}
                  onChange={(e) => handleSubDivisionChange(sdIndex, e.target.value)}
                  placeholder={`Sub Division Name ${sdIndex + 1}`}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900 focus:border-[#DC2604]"
                />
                {subDivisions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubDivision(sdIndex)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-600 text-xs">Feeders</label>
                  <button
                    type="button"
                    onClick={() => handleAddFeeder(sdIndex)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Feeder
                  </button>
                </div>
                {sd.feeders.map((f, fIndex) => (
                  <div key={fIndex} className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={f.feeder_name}
                        onChange={(e) => handleFeederChange(sdIndex, fIndex, e.target.value)}
                        placeholder={`Feeder Name ${fIndex + 1}`}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-sm font-medium text-slate-900 focus:border-sky-500"
                      />
                      {sd.feeders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeeder(sdIndex, fIndex)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 pl-2 border-l border-slate-100 ml-1">
                      <div className="flex items-center justify-between">
                        <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">Locations</label>
                        <button
                          type="button"
                          onClick={() => handleAddLocation(sdIndex, fIndex)}
                          className="text-2xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Location
                        </button>
                      </div>
                      {f.locations.map((loc, lIndex) => (
                        <div key={lIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={loc}
                            onChange={(e) => handleLocationChange(sdIndex, fIndex, lIndex, e.target.value)}
                            placeholder="e.g. 0 - 66 KV BAVLA SS"
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none text-xs font-medium text-slate-900 focus:border-emerald-500"
                          />
                          {f.locations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLocation(sdIndex, fIndex, lIndex)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Status</label>
          <select
            name="site_status"
            value={siteData.site_status}
            onChange={handleSiteChange}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none font-medium text-slate-900 transition-all ${
              siteErrors.site_status ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DC2604]"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {siteErrors.site_status && <p className="text-red-500 text-xs mt-1">{siteErrors.site_status}</p>}
        </div>
      </SideDrawer>
    </DashboardLayout>
  );
}
