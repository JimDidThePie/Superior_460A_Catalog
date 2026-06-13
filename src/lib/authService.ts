const SESSION_KEY = "showroom-admin-session";

export const getAdminPassword = () => import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

export const isAdminAuthenticated = () => localStorage.getItem(SESSION_KEY) === "true";

export const loginAdmin = (password: string) => {
  const success = password === getAdminPassword();

  if (success) {
    localStorage.setItem(SESSION_KEY, "true");
  }

  return success;
};

export const logoutAdmin = () => {
  localStorage.removeItem(SESSION_KEY);
};
