import { create } from "zustand";
import { authStorage } from "@/utils/authStorage";

export const useAuthStore = create((set) => ({
  user: authStorage.getUser(),
  role: authStorage.getRole(),
  accessToken: authStorage.getAccessToken(),
  isAuthenticated: authStorage.isAuthenticated(),

  /**
   * Action to execute on successful login
   * @param {Object} loginData - { accessToken, refreshToken, employee }
   */
  login: (loginData) => {
    authStorage.setSession(loginData);
    const token = authStorage.getAccessToken();
    const user = authStorage.getUser() || loginData.employee || loginData.user;
    const role = authStorage.getRole() || (typeof user?.role === 'string' ? user.role : user?.role?.name);
    set({
      user,
      role,
      accessToken: token,
      isAuthenticated: Boolean(token),
    });
  },

  /**
   * Action to logout user safely
   */
  logout: () => {
    authStorage.clearSession();
    set({
      user: null,
      role: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
