import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export async function login(username, password) {
  const response = await axios.post(`${AUTH_BASE_URL}/token/`, {
    username,
    password,
  });

  const { access, refresh } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);

  return response.data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export async function register(username, email, password) {
  const response = await axios.post(`${AUTH_BASE_URL}/register/`, {
    username,
    email,
    password,
  });
  return response.data;
}

// JWT tokenning ichidagi "exp" (muddat tugash vaqti) qismini o'qib,
// hali amal qiladimi yoki yo'qligini tekshiradi. Kutubxonasiz, oddiy
// base64 dekodlash orqali - JWT'ning ikkinchi qismi shifrlanmagan.
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAtMs = payload.exp * 1000;
    // 10 soniyalik "xavfsizlik zaxirasi" bilan - so'rov yo'lda ketayotganda
    // tokenning aynan shu soniyada eskirib qolishining oldini oladi
    return Date.now() > expiresAtMs - 10000;
  } catch {
    return true; // token o'qib bo'lmasa, ehtiyot shart bilan "eskirgan" deb hisoblaymiz
  }
}

// Kerak bo'lganda access tokenni avtomatik yangilaydi (refresh token orqali).
// Agar refresh token ham eskirgan/yaroqsiz bo'lsa - hisobni tozalab, null qaytaradi.
let refreshPromise = null; // bir vaqtda bir nechta so'rov kelsa, faqat bitta refresh qilinishi uchun

export async function getValidAccessToken() {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (!accessToken) return null;
  if (!isTokenExpired(accessToken)) return accessToken;
  if (!refreshToken) {
    logout();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${AUTH_BASE_URL}/token/refresh/`, { refresh: refreshToken })
      .then((res) => {
        localStorage.setItem('access_token', res.data.access);
        return res.data.access;
      })
      .catch(() => {
        logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}