/**
 * Client-side Authentication and Role-Based Access Control (RBAC) helpers
 */

// Max session lifetime: 2 hours (in ms)
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export const logout = (router) => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("userType");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("loginTime");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userType");
      localStorage.removeItem("userId");
      localStorage.removeItem("loginTime");
    } catch {
      // storage unavailable
    }
  }
  if (router) {
    router.push("/login");
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const setAuthSession = ({ token, username, userType, userId }) => {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  const role = (userType || "user").toLowerCase();

  try {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("userType", role);
    if (userId) sessionStorage.setItem("userId", userId);
    sessionStorage.setItem("loginTime", now);

    // Sync to localStorage with timestamp for multi-tab support
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userType", role);
    if (userId) localStorage.setItem("userId", userId);
    localStorage.setItem("loginTime", now);
  } catch {
    // storage unavailable
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const loginTime = sessionStorage.getItem("loginTime") || localStorage.getItem("loginTime");

  if (!token) return null;

  // Check session timeout so one is not logged in indefinitely
  if (loginTime) {
    const elapsed = Date.now() - Number(loginTime);
    if (elapsed > SESSION_MAX_AGE_MS) {
      logout();
      return null;
    }
  }

  return token;
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;

  const username = sessionStorage.getItem("username") || localStorage.getItem("username");
  const userType = sessionStorage.getItem("userType") || localStorage.getItem("userType") || "user";
  const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (!username) return null;

  return {
    username: username || "User",
    userType: userType.toLowerCase(),
    userId,
    isAdmin: userType.toLowerCase() === "admin",
  };
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return Boolean(getUser());
};

export const isAdmin = () => {
  if (typeof window === "undefined") return false;
  const user = getUser();
  return user?.isAdmin === true;
};

export const getAuthHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
