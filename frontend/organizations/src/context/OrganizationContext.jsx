// frontend/organizations/src/context/OrganizationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load organization data from localStorage
    const orgData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    
    if (orgData && token) {
      setOrganization(JSON.parse(orgData));
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
    window.location.href = 'http://localhost:5000'; // Redirect to login
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