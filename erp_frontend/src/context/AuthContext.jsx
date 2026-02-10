import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const USE_FAKE_AUTH = (import.meta?.env?.VITE_FAKE_AUTH ?? 'false') === 'true';

const buildFakeUser = ({ email, name, role, modules }) => ({
    id: 'user-demo-1',
    name: name || 'Demo Admin',
    email: email || 'demo@paeasy.test',
    role: role || 'tenant_admin',
    permissions: {
        accounting: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        sales: { view: true, create: true, edit: true, delete: true },
        hr: { view: true, create: true, edit: true, delete: true },
    },
    modules: modules || ['inventory', 'pos', 'sales', 'accounting', 'hr', 'crm'],
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (USE_FAKE_AUTH) {
                const storedProfile = localStorage.getItem('tenant_profile');
                const storedUser = localStorage.getItem('fake_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                } else if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                const fakeUser = buildFakeUser({
                    email: profile.admin_email,
                    name: profile.company_name,
                    role: 'tenant_admin',
                    modules: profile.selected_modules,
                });
                    localStorage.setItem('fake_user', JSON.stringify(fakeUser));
                    setUser(fakeUser);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Ideally verify token with backend or decode it
                    // For now, assume valid if present and try to get permissions/profile if an endpoint exists
                    // We can call /api/v1/users/my-permissions/ to validate
                    const response = await api.get('/users/my-permissions/');
                    const profile = response.data;
                    setUser(profile);
                    setIsAuthenticated(true);
                    if (profile.tenant_id) {
                        localStorage.setItem('tenantId', profile.tenant_id);
                    }
                    if (profile.accessible_modules) {
                        localStorage.setItem('tenant_profile', JSON.stringify({
                            tenant_id: profile.tenant_id,
                            selected_modules: profile.accessible_modules,
                        }));
                    }

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

    const registerTenant = async (payload) => {
        if (!USE_FAKE_AUTH) {
            return { success: false, error: 'Fake auth disabled' };
        }

        const tenantProfile = {
            tenant_id: 'tenant-demo-1',
            company_name: payload.company_name,
            industry: payload.industry,
            admin_email: payload.admin_email,
            selected_modules: payload.selected_modules || [],
            subscription_tier: payload.subscription_tier || 'free',
            enable_multi_site: payload.enable_multi_site ?? true,
        };

        const fakeUser = buildFakeUser({
            email: payload.admin_email,
            name: payload.company_name,
            role: 'tenant_admin',
            modules: payload.selected_modules,
        });

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('refresh_token', 'fake-refresh-token');
        localStorage.setItem('tenantId', tenantProfile.tenant_id);
        localStorage.setItem('tenant_profile', JSON.stringify(tenantProfile));
        localStorage.setItem('fake_user', JSON.stringify(fakeUser));
        setUser(fakeUser);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
    };

    const login = async (username, password) => {
        if (USE_FAKE_AUTH) {
            const storedProfile = localStorage.getItem('tenant_profile');
            const profile = storedProfile ? JSON.parse(storedProfile) : null;
            const isSuperAdmin = profile?.admin_email && profile.admin_email === username;
            const fakeUser = buildFakeUser({
                email: username,
                name: profile?.company_name || username || 'Demo Admin',
                role: isSuperAdmin ? 'tenant_admin' : 'staff',
                modules: profile?.selected_modules,
            });
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('refresh_token', 'fake-refresh-token');
            localStorage.setItem('tenantId', 'tenant-demo-1');
            localStorage.setItem('fake_user', JSON.stringify(fakeUser));
            setUser(fakeUser);
            setIsAuthenticated(true);
            setLoading(false);
            return { success: true };
        }

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
            const profile = profileResponse.data;
            setUser(profile);
            setIsAuthenticated(true);

            if (profile.tenant_id) {
                localStorage.setItem('tenantId', profile.tenant_id);
            }
            if (profile.accessible_modules) {
                localStorage.setItem('tenant_profile', JSON.stringify({
                    tenant_id: profile.tenant_id,
                    selected_modules: profile.accessible_modules,
                }));
            }

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
        localStorage.removeItem('fake_user');
        localStorage.removeItem('tenant_profile');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerTenant, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
