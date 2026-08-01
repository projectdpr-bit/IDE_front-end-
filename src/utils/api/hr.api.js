// ============================================================
// hr.api.js — HR Module APIs
// (Employees, Attendance, Sites, Purchase Requests)
// ============================================================
const BASEURL = import.meta.env?.VITE_API_BASE_URL;

export const GET_HR_API              = BASEURL + "hr";
export const GET_PURCHASE_REQUESTS_API = BASEURL + "Engineer/purchase-requests";
