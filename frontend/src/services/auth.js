import axios from 'axios';

const AUTH_BASE_URL = 'http://127.0.0.1:8000/api';

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