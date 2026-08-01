import apiClient from "@/lib/axios";
import {
  ADD_SITE_ASSIGNMENT_API,
  GET_SENIOR_SITE_SUPERVISORS_LIST_API,
  GET_SITE_ENGINEERS_API,
} from "@/utils/ApiHelper";

/**
 * Assigns an employee to a site
 * @param {Object} data
 * @param {number} data.site_id
 * @param {number} data.employee_id
 * @param {string} data.assignment_role - Usually "Supervisor"
 * @param {number} data.reports_to - The ID of the Senior Site Supervisor
 */
export const assignEmployeeToSite = async (data) => {
  try {
    const response = await apiClient.post(ADD_SITE_ASSIGNMENT_API, data);
    return response.data;
  } catch (error) {
    console.error("Error assigning employee to site:", error);
    throw error;
  }
};

/**
 * Fetches the list of Senior Site Supervisors (for the 'reports_to' field)
 */
export const getSeniorSiteSupervisors = async () => {
  try {
    const response = await apiClient.get(GET_SENIOR_SITE_SUPERVISORS_LIST_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching senior site supervisors:", error);
    throw error;
  }
};

/**
 * Fetches the list of Site Engineers (for the 'employee_id' field)
 */
export const getSiteEngineers = async () => {
  try {
    const response = await apiClient.get(GET_SITE_ENGINEERS_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching site engineers:", error);
    throw error;
  }
};
