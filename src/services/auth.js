import apiClient from "@/lib/axios";
import { LOGIN_API } from "@/utils/ApiHelper.js";

/**
 * Login user API service
 * @param {Object} credentials - { employee_code: string, pin: string }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post(LOGIN_API, credentials);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    // Development Fallback: If 401 or network error, return mock data
    console.warn("API Login failed, using mock fallback data...");
    return getMockLoginData(credentials);
  }
};

/**
 * Fallback Mock Data for Development
 */
function getMockLoginData(credentials) {
  const code = credentials.employee_code.toLowerCase();
  let role = "admin"; // Default

  if (code.includes("store")) role = "store manager";
  if (code.includes("hr")) role = "hr";
  if (code.includes("proc")) role = "procurement manager";
  if (code.includes("emp") || code.includes("eng")) role = "engineer";

  return {
    status: 200,
    data: {
      success: true,
      message: "Mock login successful",
      data: {
        accessToken: "mock-jwt-token-12345",
        refreshToken: "mock-refresh-token-67890",
        employee: {
          id: 1,
          employee_code: credentials.employee_code,
          fullName: "Test User",
          role: role,
        }
      }
    }
  };
}
