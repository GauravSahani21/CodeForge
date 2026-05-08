import axios from 'axios';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Use environment variable or fallback to local
  config.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cf_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
