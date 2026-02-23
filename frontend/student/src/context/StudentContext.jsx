import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const StudentContext = createContext();

export function useStudent() {
    return useContext(StudentContext);
}

export function StudentProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/profile');
            setProfile(res.data);
            setErrorMsg("");
        } catch (error) {
            console.error(error);
            setErrorMsg(error.toString() + (error.response?.data?.msg ? " - " + error.response.data.msg : ""));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial auth check from URL
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        
        if (token) {
            localStorage.setItem('access_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (localStorage.getItem('access_token')) {
            fetchProfile();
        } else {
            setLoading(false);
            setErrorMsg("Không tìm thấy token xác thực");
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        window.location.href = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
    };

    return (
        <StudentContext.Provider value={{ profile, loading, errorMsg, fetchProfile, logout }}>
            {children}
        </StudentContext.Provider>
    );
}
