// ============================================================
// admin.api.js — Admin Module APIs
// (Clients, Projects, Sites, Stores, Employees, Roles)
// ============================================================
const BASEURL = import.meta.env?.VITE_API_BASE_URL;

// ── Clients
export const GET_CLIENT_API = BASEURL + "admin/clients";
export const ADD_CLIENT_API = BASEURL + "admin/clients";
export const GET_CLIENT_NAME_API = BASEURL + "admin/clients/assign";

// ── Projects
export const GET_PROJECT_API = BASEURL + "admin/projects";
export const ADD_PROJECT_API = BASEURL + "admin/projects";
export const GET_PROJECT_ASSIGNMENT_API = BASEURL + "admin/projects/assignments";
export const ADD_PROJECT_ASSIGNMENT_API = BASEURL + "admin/projects/assignments";
export const ASSIGN_PROCUREMENT_OFFICER_API = BASEURL + "admin/projects/assign-procurement";

// ── Sites
export const ADD_SITE_API = BASEURL + "admin/sites";
export const GET_SITES_API = BASEURL + "admin/sites";
export const GET_SITE_ASSIGNMENTS_API = BASEURL + "admin/sites/assignments";
export const ADD_SITE_ASSIGNMENT_API = BASEURL + "admin/sites/assignments";

// ── Stores
export const GET_STORES_LIST_API = BASEURL + "admin/stores";
export const ADD_STORE_API = BASEURL + "admin/stores";
export const ASSIGN_STORE_MANAGER_API = BASEURL + "admin/stores/assign-manager";
export const ADD_STORE_MANAGER_API = BASEURL + "admin/stores/assign-manager";
export const EDIT_STORE_MANAGER_API = BASEURL + "admin/stores/assign-manager";

// ── Employees
export const GET_SENIOR_SITE_SUPERVISORS_LIST_API = BASEURL + "admin/employees/senior-site-supervisors";
export const GET_STORE_MANAGER_LIST_API = BASEURL + "admin/employees/store-managers";
export const GET_PROCUREMENT_OFFICERS_API = BASEURL + "admin/employees/procurement-officers";
export const GET_SITE_ENGINEERS_API = BASEURL + "admin/employees/site-engineers";

// ── Roles & Designations
export const GET_ROLES_API = BASEURL + "admin/roles";
export const ADD_ROLE_API = BASEURL + "admin/roles";
export const EDIT_ROLE_API = (id) => BASEURL + `admin/roles/${id}`;

// ── Materials
export const GET_MATERIAL_CATEGORIES_API = BASEURL + "admin/materials/categories";
export const GET_MATERIALS_API = BASEURL + "admin/materials";

// ── App Sheet (Source Datasets)
export const GET_SOURCE_DATASETS_API = BASEURL + "admin/source-datasets";
export const CREATE_SOURCE_DATASET_API = BASEURL + "admin/source-datasets";
export const CREATE_DATASET_API = BASEURL + "admin/datasets";
export const CREATE_SOURCE_DATASET_COLUMNS_BULK_API = (id) => BASEURL + `admin/source-datasets/${id}/columns/bulk`;
export const GET_DATASET_COLUMNS_API = (id) => BASEURL + `admin/datasets/${id}/columns`;

// ── Labour Contractors
export const LABOUR_CONTRACTORS_API = BASEURL + "admin/labour-contractors";

// ── Jointers
export const JOINTERS_API = BASEURL + "admin/jointers";

// ── Worksheet Templates
export const WORKSHEET_TEMPLATES_API = BASEURL + "admin/work-sheet-templates";
export const GET_WORKSHEET_TEMPLATE_FIELDS_API = (id) => BASEURL + `admin/work-sheet-templates/${id}/fields`;
export const ADD_WORKSHEET_TEMPLATE_FIELD_API = (id) => BASEURL + `admin/work-sheet-templates/${id}/fields`;
export const ADD_WORKSHEET_TEMPLATE_FIELDS_BULK_API = (id) => BASEURL + `admin/work-sheet-templates/${id}/fields/bulk`;
export const DELETE_WORKSHEET_TEMPLATE_FIELD_API = (fieldId) => BASEURL + `admin/work-sheet-templates/fields/${fieldId}`;
