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
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');

        let token = tokenFromUrl || localStorage.getItem('access_token');
        console.log("Lecturer Portal Auth Check:", { tokenFromUrl: !!tokenFromUrl, existingToken: !!localStorage.getItem('access_token') });

        if (tokenFromUrl) {
            localStorage.setItem('access_token', tokenFromUrl);
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 100);
        }

        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        window.location.href = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
    };

    return (
        <LecturerContext.Provider value={{ isAuthenticated, loading, logout }}>
            {children}
        </LecturerContext.Provider>
    );
}
