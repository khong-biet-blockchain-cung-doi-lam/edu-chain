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
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');

        console.log("Student Portal - Checking for token...");

        let token = tokenFromUrl || localStorage.getItem('access_token');

        if (tokenFromUrl) {
            console.log("Token found in URL, updating localStorage");
            localStorage.setItem('access_token', tokenFromUrl);
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }

        if (token) {
            console.log("Token found. Fetching student profile...");
            fetchProfile();
        } else {
            console.error("NO TOKEN FOUND in URL or localStorage");
            setLoading(false);
            setErrorMsg("Không tìm thấy token xác thực. Vui lòng đăng nhập lại từ trang http://localhost:3000.");
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
