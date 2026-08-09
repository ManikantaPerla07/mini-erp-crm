import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem("token");

  if (storedToken) {
    const token = storedToken.replace(/^Bearer\s+/i, "");
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;