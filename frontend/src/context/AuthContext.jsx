import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginRequest, logout as logoutRequest, isAuthenticated } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(null); // { id, username, email, is_agent }

  const loadProfile = () => {
    if (isAuthenticated()) {
      api.get('/me/')
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadProfile();
    const handleAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (username, password) => {
    await loginRequest(username, password);
    setAuthenticated(true);
    loadProfile();
  };

  const logout = () => {
    logoutRequest();
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}