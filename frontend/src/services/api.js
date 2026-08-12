import axios from 'axios';
import { getValidAccessToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Token yo'q yoki yangilab bo'lmadi - eski, yaroqsiz sarlavhani
    // qoldirmaymiz, shunda ochiq (public) so'rovlar baribir ishlayveradi
    delete config.headers.Authorization;
  }
  return config;
});

// Agar token eskirgan/yaroqsiz bo'lsa, uni tozalab, AuthContext'ga xabar beramiz
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export default api;