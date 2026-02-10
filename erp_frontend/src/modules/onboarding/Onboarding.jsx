import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Store, Check, Loader2, ChevronRight, Building2, Mail, Lock, LayoutGrid, ArrowLeft } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const { registerTenant } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        company_name: '',
        industry: 'retail',
        admin_email: '',
        admin_password: '',
        confirm_password: '',
        selected_modules: ['inventory', 'pos', 'sales', 'accounting', 'hr', 'crm'], // Default all for demo
        subscription_tier: 'free',
        enable_multi_site: true
    });

    const industries = [
        { id: 'retail', name: 'Retail Store', icon: '🛍️' },
        { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
        { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
        { id: 'service', name: 'Service Business', icon: '🛠️' }
    ];

    const modules = [
        { id: 'inventory', name: 'Inventory Management', desc: 'Track stock & warehouses' },
        { id: 'pos', name: 'Point of Sale', desc: 'Checkout & Cashier' },
        { id: 'sales', name: 'Sales & Invoicing', desc: 'Quotations & Orders' },
        { id: 'accounting', name: 'Accounting', desc: 'Finance & Reports' },
        { id: 'hr', name: 'HR & Payroll', desc: 'Staff Management' },
        { id: 'crm', name: 'CRM', desc: 'Customer Relationships' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleModule = (modId) => {
        const current = formData.selected_modules;
        if (current.includes(modId)) {
            setFormData({ ...formData, selected_modules: current.filter(m => m !== modId) });
        } else {
            setFormData({ ...formData, selected_modules: [...current, modId] });
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.admin_password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setError('');
        setLoading(true);

        try {
            const payload = {
                company_name: formData.company_name,
                industry: formData.industry,
                admin_email: formData.admin_email,
                admin_password: formData.admin_password,
                selected_modules: formData.selected_modules,
                subscription_tier: formData.subscription_tier,
                enable_multi_site: formData.enable_multi_site
            };

            if (registerTenant) {
                const result = await registerTenant(payload);
                if (result.success) {
                    navigate('/dashboard');
                    return;
                }
            }

            const response = await api.post('/tenants/onboard/', payload);

            if (response.data.success) {
                const activeModules = response.data.active_modules || {};
                const selectedModules = Object.keys(activeModules).filter((key) => activeModules[key]);
                localStorage.setItem('tenant_profile', JSON.stringify({
                    tenant_id: response.data.tenant_id,
                    company_name: response.data.tenant_name,
                    selected_modules: selectedModules,
                    subscription_tier: payload.subscription_tier,
                    enable_multi_site: payload.enable_multi_site,
                }));
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Minimal Header */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <Store className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-900">Paeasy</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            <span className={step >= 1 ? 'text-blue-600' : ''}>Company Info</span>
                            <span className={step >= 2 ? 'text-blue-600' : ''}>Admin Setup</span>
                            <span className={step >= 3 ? 'text-blue-600' : ''}>Modules</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-slate-900">Tell us about your business</h2>
                                    <p className="text-slate-500 mt-2">We'll tailor the experience to your industry.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="company_name"
                                            required
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Industry Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {industries.map((ind) => (
                                            <div
                                                key={ind.id}
                                                onClick={() => setFormData({ ...formData, industry: ind.id })}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.industry === ind.id
                                                        ? 'border-blue-600 bg-blue-50/50'
                                                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-2xl">{ind.icon}</span>
                                                <span className={`font-semibold ${formData.industry === ind.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                                    {ind.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                    Next Step <ChevronRight className="h-4 w-4" />
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleNext} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-slate-900">Create Admin Account</h2>
                                    <p className="text-slate-500 mt-2">You'll use this to log in to your dashboard.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="admin_email"
                                            required
                                            value={formData.admin_email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="admin@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="password"
                                            name="admin_password"
                                            required
                                            value={formData.admin_password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="At least 8 characters"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            required
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Repeat password"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={handleBack} className="w-1/3 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                                        Back
                                    </button>
                                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        Next Step <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-slate-900">Select Modules</h2>
                                    <p className="text-slate-500 mt-2">Choose what you need. You can change this later.</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-700">Choose a plan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { id: 'free', name: 'Free', desc: 'Limited modules + basic reports', badge: 'Starter' },
                                            { id: 'standard', name: 'Standard', desc: 'Core modules with VAT/WHT', badge: 'Growth' },
                                            { id: 'pro', name: 'Pro', desc: 'All modules + automation', badge: 'Scale' },
                                        ].map((tier) => (
                                            <button
                                                key={tier.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, subscription_tier: tier.id })}
                                                className={`p-4 rounded-xl border text-left transition-all ${
                                                    formData.subscription_tier === tier.id
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-900">{tier.name}</h4>
                                                    <span className="text-xs text-slate-500">{tier.badge}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">{tier.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                                    {modules.map((mod) => (
                                        <div
                                            key={mod.id}
                                            onClick={() => toggleModule(mod.id)}
                                            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${formData.selected_modules.includes(mod.id)
                                                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            {formData.selected_modules.includes(mod.id) && (
                                                <div className="absolute top-0 right-0 p-1 bg-blue-600 rounded-bl-lg">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            <div className={`mt-0.5 p-2 rounded-lg ${formData.selected_modules.includes(mod.id) ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                <LayoutGrid className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${formData.selected_modules.includes(mod.id) ? 'text-blue-900' : 'text-slate-700'}`}>{mod.name}</h4>
                                                <p className="text-xs text-slate-500 leading-tight mt-0.5">{mod.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={handleBack} className="w-1/3 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Setup'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
