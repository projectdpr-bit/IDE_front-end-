// ============================================================
// index.js — Central API Helper (Re-exports all modules)
//
// Import directly from module files for cleaner code:
//   import { GET_POS_API } from "@/utils/api/procurement.api";
//
// Or keep using ApiHelper for backward compatibility:
//   import { GET_POS_API } from "@/utils/ApiHelper";
// ============================================================

export * from "./api/auth.api";
export * from "./api/admin.api";
export * from "./api/hr.api";
export * from "./api/procurement.api";
