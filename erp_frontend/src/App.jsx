import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './modules/dashboard/Dashboard';
import Inventory from './modules/inventory/Inventory';
import InventoryManagement from './modules/inventory/InventoryManagement';
import Sales from './modules/sales/Sales';
import SalesManagement from './modules/sales/SalesManagement';
import AccountingRoot from './modules/accounting/app/AccountingRoot';
import HR from './modules/hr/HR';
import HRManagement from './modules/hr/HRManagement';
import CRM from './modules/crm/CRM';
import CRMManagement from './modules/crm/CRMManagement';
import UserManagement from './modules/users/UserManagement';
import Login from './modules/auth/Login';
import LandingPage from './modules/landing/LandingPage';
import Onboarding from './modules/onboarding/Onboarding';
import { Loader2 } from 'lucide-react';
import AccountingLite from './modules/accounting/app/pages/AccountingLite';

// Protected Route Component
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Dashboard Layout (Sidebar + Content)
const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="p-8 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

const App = () => {
    const demoIndustry = 'pharmacy';
    const allModules = ['inventory', 'pos', 'sales', 'accounting', 'hr', 'crm'];

    const getTenantModules = (user) => {
        if (user?.accessible_modules?.length) {
            return user.accessible_modules;
        }
        const profile = localStorage.getItem('tenant_profile');
        if (!profile) return allModules;
        const parsed = JSON.parse(profile);
        return parsed.selected_modules || [];
    };

    const ModuleGate = ({ moduleId, children, liteElement = null }) => {
        const { user } = useAuth();
        const enabledModules = getTenantModules(user);
        const isEnabled = enabledModules.includes(moduleId);
        const hasViewPermission = user?.role === 'tenant_admin' || user?.role === 'tenant_super_admin'
            || user?.permissions?.[moduleId]?.view;

        if (!isEnabled) {
            return liteElement || (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900">Module locked</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            This module is not enabled for your subscription. Upgrade to unlock it.
                        </p>
                        <button className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                            Upgrade plan
                        </button>
                    </div>
                </div>
            );
        }

        if (!hasViewPermission) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900">Access restricted</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Your role doesn’t have access to this module. Contact your administrator.
                        </p>
                    </div>
                </div>
            );
        }

        return children;
    };

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/onboarding" element={<Onboarding />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard industry={demoIndustry} />} />
                            <Route path="/inventory" element={<ModuleGate moduleId="inventory"><Inventory industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/inventory-management" element={<ModuleGate moduleId="inventory"><InventoryManagement industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/sales" element={<ModuleGate moduleId="sales"><Sales industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/sales-management" element={<ModuleGate moduleId="sales"><SalesManagement industry={demoIndustry} /></ModuleGate>} />
                            <Route
                                path="/accounting/*"
                                element={
                                    <ModuleGate
                                        moduleId="accounting"
                                        liteElement={
                                            getTenantModules(user).includes('hr')
                                                ? <AccountingLite />
                                                : null
                                        }
                                    >
                                        <AccountingRoot />
                                    </ModuleGate>
                                }
                            />
                            <Route path="/accounting-management" element={<Navigate to="/accounting" replace />} />
                            <Route path="/hr" element={<ModuleGate moduleId="hr"><HR industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/hr-management" element={<ModuleGate moduleId="hr"><HRManagement industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/crm" element={<ModuleGate moduleId="crm"><CRM industry={demoIndustry} /></ModuleGate>} />
                            <Route path="/crm-management" element={<ModuleGate moduleId="crm"><CRMManagement /></ModuleGate>} />
                            <Route path="/users" element={<UserManagement />} />
                            <Route path="/pos" element={<div>POS Integration Content</div>} />
                            <Route path="/reports" element={<div>Reports & Analytics Content</div>} />
                        </Route>
                    </Route>

                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
