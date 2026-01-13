import React from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, Users, Shield, ArrowRight, CheckCircle2, BarChart3, Package, PlayCircle } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <Store className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">Paeasy</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Sign In</Link>
                            <Link to="/onboarding" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        New: AI-Powered Inventory Forecasting
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto">
                        The Operating System for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Modern Business.</span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Unify your entire business flow. From POS and Inventory to Accounting and HR.
                        Scalable, secure, and beautifully designed for efficiency.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/onboarding" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2">
                            Start Free Trial
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <PlayCircle className="h-5 w-5" />
                            Watch Demo
                        </button>
                    </div>

                    <div className="mt-20 relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur-2xl opacity-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                            alt="Dashboard Preview"
                            className="relative rounded-2xl border border-slate-200 shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run your business</h2>
                        <p className="text-lg text-slate-600">Stop juggling multiple apps. Paeasy brings all your core business functions into one unified platform.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Package className="h-6 w-6 text-blue-600" />,
                                title: "Smart Inventory",
                                desc: "Real-time tracking across multiple branches. Automated low-stock alerts and reordering."
                            },
                            {
                                icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
                                title: "Sales & POS",
                                desc: "Lightning fast checkout. Works offline. Integrated with mobile money and card payments."
                            },
                            {
                                icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
                                title: "Financial Reporting",
                                desc: "Automated P&L, balance sheets, and tax reports. Know your numbers in real-time."
                            },
                            {
                                icon: <Users className="h-6 w-6 text-amber-600" />,
                                title: "HR & Payroll",
                                desc: "Manage staff attendance, performance, and automated payroll processing."
                            },
                            {
                                icon: <Shield className="h-6 w-6 text-indigo-600" />,
                                title: "Enterprise Security",
                                desc: "Role-based access control, audit logs, and bank-grade data encryption."
                            },
                            {
                                icon: <Store className="h-6 w-6 text-pink-600" />,
                                title: "Multi-Branch Ready",
                                desc: "Scale effortlessly. Manage HQ and unlimited branches from a single dashboard."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                                <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to modernize your operations?</h2>
                    <p className="text-xl text-slate-400 mb-12">Join 1,000+ businesses growing with Paeasy today.</p>
                    <Link to="/onboarding" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
                        Get Started for Free
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                            <Store className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Paeasy</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2026 Octet Systems. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
