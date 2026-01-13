import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './modules/dashboard/Dashboard';
import Inventory from './modules/inventory/Inventory';
import Sales from './modules/sales/Sales';
import Accounting from './modules/accounting/Accounting';
import HR from './modules/hr/HR';
import CRM from './modules/crm/CRM';
import UserManagement from './modules/users/UserManagement';
import Login from './modules/auth/Login';
import LandingPage from './modules/landing/LandingPage';
import Onboarding from './modules/onboarding/Onboarding';
import { Loader2 } from 'lucide-react';

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
    // Demo: Switch industry here to see adaptation
    const demoIndustry = 'pharmacy'; // Try: 'retail', 'pharmacy', 'service', 'restaurant'

    return (
        <div className="flex min-h-screen">
            <Sidebar industry={demoIndustry} />
            <main className="flex-1 ml-64 p-8 bg-slate-50 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

const App = () => {
    const demoIndustry = 'pharmacy';

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
                            <Route path="/inventory" element={<Inventory industry={demoIndustry} />} />
                            <Route path="/sales" element={<Sales industry={demoIndustry} />} />
                            <Route path="/accounting" element={<Accounting industry={demoIndustry} />} />
                            <Route path="/hr" element={<HR industry={demoIndustry} />} />
                            <Route path="/crm" element={<CRM industry={demoIndustry} />} />
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
