import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('admin_user') || 'null'));
    const [loading, setLoading] = useState(true);

    // Setup global Axios Authorization header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check token validity on initial mount
    useEffect(() => {
        const verifySession = async () => {
            if (token) {
                try {
                    const res = await axios.get('/api/v1/admin/auth/me');
                    if (res.data?.success) {
                        setUser(res.data.data);
                        localStorage.setItem('admin_user', JSON.stringify(res.data.data));
                    }
                } catch (err) {
                    console.warn('Session expired or invalid token');
                    logout();
                }
            }
            setLoading(false);
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        const response = await axios.post('/api/v1/admin/auth/login', { login: email, email, password });
        if (response.data?.success) {
            const tokenVal = response.data.data.token;
            const userVal = response.data.data.admin;

            setToken(tokenVal);
            setUser(userVal);

            localStorage.setItem('admin_token', tokenVal);
            localStorage.setItem('admin_user', JSON.stringify(userVal));
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;

            return response.data;
        }
        throw new Error(response.data?.message || 'Login failed.');
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post('/api/v1/admin/auth/logout');
            }
        } catch (e) {
            // Ignore logout API error
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
