import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('userData');

    if (urlToken && urlUser) {
      localStorage.setItem('authToken', urlToken);
      localStorage.setItem('userData', urlUser);
      let parsedUser = JSON.parse(urlUser);
      localStorage.setItem('userRole', parsedUser.role);
      setAdmin(parsedUser);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const adminData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (adminData && token) {
        setAdmin(JSON.parse(adminData));
      }
    }
    
    setLoading(false);
  }, []);

  const updateAdmin = (data) => {
    setAdmin(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
    window.location.href = loginUrl;
  };

  const value = {
    admin,
    loading,
    updateAdmin,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}