// ============================================================
// store.api.js — Store Module APIs
// ============================================================
const BASEURL = import.meta.env?.VITE_API_BASE_URL;

export const GET_STORE_PROJECTS_API = BASEURL + "Store/projects";
export const GET_STORE_DISPATCH_ITEMS_API = BASEURL + "store/dispatch-items";
export const EXTRACT_INVOICE_IMAGES_API = BASEURL + "store/stock/inward/extract-invoice-images";
export const STORE_STOCK_INWARD_API = BASEURL + "store/stock/inward";
export const STORE_STOCK_OUTWARD_API = BASEURL + "store/stock/outward";
export const GET_STORE_PO_BOQ_ITEMS_API = (poId) => `${BASEURL}store/purchase-orders/${poId}/boq-items`;
