// ============================================================
// hr.api.js — HR Module APIs
// (Employees, Attendance, Sites, Purchase Requests)
// ============================================================
const BASEURL = import.meta.env?.VITE_API_BASE_URL;

export const GET_HR_API              = BASEURL + "hr";
export const GET_PURCHASE_REQUESTS_API = BASEURL + "Engineer/purchase-requests";

// ── Engineer Specific APIs
export const GET_ENGINEER_PROJECTS_API = BASEURL + "engineer/projects";
export const GET_ENGINEER_SITES_API = BASEURL + "engineer/sites";
export const GET_ENGINEER_BOQ_ITEMS_API = BASEURL + "engineer/boq-items";
