/**
 * Client-side Authentication and Role-Based Access Control (RBAC) helpers
 */

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const username = localStorage.getItem("username");
  const userType = localStorage.getItem("userType") || "user";
  const userId = localStorage.getItem("userId");

  if (!username && !localStorage.getItem("token")) return null;

  return {
    username: username || "User",
    userType: userType.toLowerCase(),
    userId,
    isAdmin: userType.toLowerCase() === "admin",
  };
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("token"));
};

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  const userType = (localStorage.getItem("userType") || "").trim().toLowerCase();
  return userType === "admin";
};

export const logout = (router) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
  }
  if (router) {
    router.push("/login");
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const getAuthHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
