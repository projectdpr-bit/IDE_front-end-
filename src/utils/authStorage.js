const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "role";
const USER_KEY = "user";

export const authStorage = {
  /**
   * Save authentication session into storage securely
   * @param {Object} data - API response data containing accessToken/token, refreshToken, employee/user
   */
  setSession(data) {
    if (!data) return;

    const token = data.accessToken || data.token || data.access_token || data.jwt;
    const refreshToken = data.refreshToken || data.refresh_token;
    const userObj = data.employee || data.user || (data.role ? data : null);

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("accessToken", token);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (userObj) {
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      const role = userObj.role?.name || userObj.role?.role_name || userObj.role;
      if (role && typeof role === "string") {
        localStorage.setItem(ROLE_KEY, role);
      }
    }
  },

  /**
   * Get Access Token
   */
  getAccessToken() {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  },

  /**
   * Get Refresh Token
   */
  getRefreshToken() {
    const rToken = localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
    if (!rToken || rToken === "undefined" || rToken === "null") return null;
    return rToken;
  },

  /**
   * Get User Profile Object
   */
  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Failed to parse user session", e);
      return null;
    }
  },

  /**
   * Get Current User Role
   */
  getRole() {
    return localStorage.getItem(ROLE_KEY) || null;
  },

  /**
   * Clear complete authentication session
   */
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token) {
    if (!token || typeof token !== "string") return true;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      if (payload?.exp && typeof payload.exp === "number") {
        // Expiration timestamp in seconds vs current time
        return Date.now() >= payload.exp * 1000;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Check if user is authenticated with a valid token
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }
    return true;
  }
};
