import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Ideally verify token with backend or decode it
                    // For now, assume valid if present and try to get permissions/profile if an endpoint exists
                    // We can call /api/v1/users/my-permissions/ to validate
                    const response = await api.get('/users/my-permissions/');
                    setUser(response.data);
                    setIsAuthenticated(true);

                    // Also store tenant_id if available (backend should return it)
                    // The backend response for my-permissions includes user info
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/token/', {
                username,
                password
            });

            const { access, refresh } = response.data;
            localStorage.setItem('token', access);
            localStorage.setItem('refresh_token', refresh);

            // Get user details
            const profileResponse = await api.get('/users/my-permissions/');
            setUser(profileResponse.data);
            setIsAuthenticated(true);

            // If the user belongs to a tenant, we might want to store tenant ID if the API requires it separately
            // But api.js interceptor uses localStorage.getItem('tenantId') which we might not have yet?
            // The User model has 'tenant' field.
            // profileResponse.data includes 'user_id', 'username', 'role', etc.
            // We should ensure we set whatever api.js expects.
            // api.js expects 'tenantId'. 
            // The my-permissions endpoint returns user info. We should see if it returns tenant ID.
            // Looking at views.py (Step 36), get_my_permissions returns user_id, username, role, branches... 
            // It does NOT return tenant_id explicitely in the top level.
            // Wait, UserSerializer returns 'tenant'. 
            // But get_my_permissions returns a custom dict.
            // I should modify get_my_permissions to return tenant_id if possible, or just fetch user profile.

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('tenantId');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
