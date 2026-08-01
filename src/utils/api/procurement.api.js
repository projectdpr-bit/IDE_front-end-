// ============================================================
// procurement.api.js — Procurement Module APIs
// (Vendors, Purchase Orders, Dispatch Instructions)
// ============================================================
const BASEURL = import.meta.env?.VITE_API_BASE_URL;

// ── Vendors
export const GET_VENDORS_API = BASEURL + "procurement/vendors";
export const ADD_VENDOR_API = BASEURL + "procurement/vendors";

// ── Purchase Requests (PR)
export const GET_PROCUREMENT_PURCHASE_REQUESTS_API = BASEURL + "procurement/purchase-requests";

// ── Purchase Orders (PO)
export const GET_POS_API = BASEURL + "procurement/purchase-orders";
export const ADD_PO_API = BASEURL + "procurement/purchase-orders";

// ── Dispatch Instructions (DI)
export const GET_DIS_API = BASEURL + "procurement/dispatch-instructions";
export const ADD_DI_API = BASEURL + "procurement/dispatch-instructions";

// ── BOQ Items
export const GET_BOQ_ITEMS_API = BASEURL + "procurement/boq-items";
export const ADD_BOQ_ITEM_API = BASEURL + "procurement/boq-items";
export const IMPORT_BOQ_ITEMS_API = BASEURL + "procurement/boq-items/import";

// ── Projects
export const GET_PROCUREMENT_PROJECTS_API = BASEURL + "procurement/projects";
