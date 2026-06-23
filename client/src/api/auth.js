import axios from "axios";

const AUTH_API_URL = `${window.location.origin}/api/auth`;

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const is2FARequest =
      error.config?.url?.includes("/verify-2fa") ||
      error.config?.url?.includes("/login") ||
      error.config?.url?.includes("/2fa/setup");

    if (error.response?.status === 401 && !is2FARequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await authApi.post("/login", { username, password });
  return response.data;
};

export const verify2FA = async (username, password, twoFactorCode) => {
  const response = await authApi.post("/verify-2fa", {
    username,
    password,
    twoFactorCode,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
