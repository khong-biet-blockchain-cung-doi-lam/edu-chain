// frontend/organizations/src/context/OrganizationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organization, setOrganization] = useState(null);
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
      setOrganization(parsedUser);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const orgData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (orgData && token) {
        setOrganization(JSON.parse(orgData));
      }
    }
    
    setLoading(false);
  }, []);

  const updateOrganization = (data) => {
    setOrganization(data);
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
    organization,
    loading,
    updateOrganization,
    logout
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}