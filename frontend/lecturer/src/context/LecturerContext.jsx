import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosClient';

const LecturerContext = createContext();

export function useLecturer() {
    return useContext(LecturerContext);
}

export function LecturerProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial auth check from URL
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');

        if (token) {
            localStorage.setItem('access_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (localStorage.getItem('access_token')) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const [isOpen, setIsOpen] = useState(true);

    const logout = () => {
        localStorage.removeItem('access_token');
        window.location.href = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
    };

    return (
        <LecturerContext.Provider value={{ isAuthenticated, loading, logout, isOpen, setIsOpen }}>
            {children}
        </LecturerContext.Provider>
    );
}
