import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import {
    ArrowRight, Check, BarChart3, ShieldCheck, Zap, Users,
    Building2, Lock, Globe2, TrendingUp, Package,
    ChevronRight, Play, Star, Award, Target, Store,
    Factory, Briefcase, Rocket, Sparkles, Menu, X, MousePointer2,
    Calculator, FileText, CreditCard, Smartphone, Cloud, DollarSign,
    Clock, CheckCircle, HelpCircle, TrendingDown, Eye, Edit2, Trash2
} from 'lucide-react';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState('sme');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Comprehensive system features organized by modules
    const coreFeatures = [
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Real-time Analytics",
            description: "AI-driven forecasting with live dashboards and custom reports for data-driven decisions.",
            color: "from-blue-500 to-indigo-500 shadow-blue-200",
            module: "Analytics"
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Bank-level encryption, SOC2 certified compliance with advanced biometric integration.",
            color: "from-emerald-500 to-teal-500 shadow-emerald-200",
            module: "Security"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Automated Workflows",
            description: "Self-optimizing automation that learns from your team's efficiency patterns.",
            color: "from-orange-500 to-amber-500 shadow-orange-200",
            module: "Automation"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Collaboration",
            description: "Real-time collaboration across timezones with zero latency communication.",
            color: "from-purple-500 to-pink-500 shadow-purple-200",
            module: "HR"
        }
    ];

    const moduleFeatures = [
        // Accounting Features
        {
            icon: <Calculator className="w-6 h-6" />,
            title: "Advanced Accounting",
            description: "Complete financial management with double-entry bookkeeping, automated reconciliation, and comprehensive reporting.",
            features: ["General Ledger", "Accounts Payable/Receivable", "Bank Reconciliation", "Financial Statements", "Tax Management", "Budget Planning"],
            color: "from-green-500 to-emerald-500 shadow-green-200"
        },
        // Inventory Features
        {
            icon: <Package className="w-6 h-6" />,
            title: "Smart Inventory Management",
            description: "Multi-location inventory tracking with real-time stock alerts, demand forecasting, and automated reordering.",
            features: ["Multi-location Tracking", "Real-time Stock Alerts", "Demand Forecasting", "Barcode/QR Code Support", "Supplier Management", "Stock Movement History"],
            color: "from-blue-500 to-cyan-500 shadow-blue-200"
        },
        // HR Features
        {
            icon: <Users className="w-6 h-6" />,
            title: "Complete HR Suite",
            description: "End-to-end human resource management from recruitment to payroll with employee self-service portals.",
            features: ["Employee Management", "Payroll Processing", "Leave Management", "Attendance Tracking", "Performance Reviews", "Recruitment Pipeline"],
            color: "from-purple-500 to-indigo-500 shadow-purple-200"
        },
        // Sales Features
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Sales & CRM",
            description: "Comprehensive customer relationship management with sales pipeline tracking and automated follow-ups.",
            features: ["Lead Management", "Sales Pipeline", "Customer Database", "Quotation System", "Sales Analytics", "Commission Tracking"],
            color: "from-orange-500 to-red-500 shadow-orange-200"
        },
        // POS Features
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Point of Sale System",
            description: "Modern POS with multiple payment methods, receipt customization, and real-time inventory sync.",
            features: ["Multiple Payment Methods", "Receipt Customization", "Real-time Sync", "Customer Display", "Tip Management", "Cash Drawer Control"],
            color: "from-pink-500 to-rose-500 shadow-pink-200"
        },
        // Dashboard Features
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Executive Dashboard",
            description: "Comprehensive business intelligence with customizable widgets and real-time KPI tracking.",
            features: ["Custom Widgets", "KPI Tracking", "Data Visualization", "Export Reports", "Scheduled Reports", "Mobile Access"],
            color: "from-indigo-500 to-purple-500 shadow-indigo-200"
        }
    ];

    const packages = {
        startup: {
            name: "Startup Essentials",
            icon: <Rocket className="w-8 h-8" />,
            price: "$49",
            period: "/month",
            description: "Perfect for early-stage companies with up to 10 employees",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
            features: [
                "Up to 5 users included",
                "Basic accounting & invoicing",
                "Essential inventory management",
                "Single location support",
                "Email support (24-hour response)",
                "Mobile app access",
                "Basic reporting",
                "500 monthly transactions"
            ],
            advantages: [
                "Get started in minutes",
                "Scalable as you grow",
                "No long-term contracts",
                "Perfect for bootstrapped startups"
            ]
        },
        retail: {
            name: "Retail Pro",
            icon: <Store className="w-8 h-8" />,
            price: "$99",
            period: "/month",
            description: "Complete retail management with multi-store support",
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
            features: [
                "Up to 20 users included",
                "Multi-store inventory management",
                "POS system integration",
                "Customer loyalty programs",
                "Real-time stock alerts",
                "Supplier management",
                "Advanced reporting",
                "Unlimited transactions"
            ],
            advantages: [
                "Reduce stockouts by 40%",
                "Increase customer retention",
                "Omnichannel sales support",
                "Seasonal demand forecasting"
            ]
        },
        sme: {
            name: "SME Business Suite",
            icon: <Briefcase className="w-8 h-8" />,
            price: "$199",
            period: "/month",
            description: "Comprehensive solution for growing small to medium enterprises",
            color: "from-purple-500 to-indigo-500",
            bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
            features: [
                "Up to 50 users included",
                "Full accounting suite",
                "Advanced inventory & CRM",
                "Multi-department HR tools",
                "Custom workflow automation",
                "Advanced analytics dashboard",
                "Priority phone & email support",
                "API access & custom integrations"
            ],
            advantages: [
                "Unified business operations",
                "Scale without complexity",
                "Dedicated account manager",
                "Industry-specific templates"
            ],
            popular: true
        },
        manufacturing: {
            name: "Manufacturing Elite",
            icon: <Factory className="w-8 h-8" />,
            price: "$499",
            period: "/month",
            description: "End-to-end production and supply chain management",
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
            features: [
                "Unlimited users",
                "Production planning & scheduling",
                "Quality control modules",
                "Supply chain optimization",
                "BOM (Bill of Materials) management",
                "Equipment maintenance tracking",
                "Real-time factory monitoring",
                "24/7 premium support"
            ],
            advantages: [
                "Reduce production waste by 25%",
                "Optimize supply chain costs",
                "Ensure quality compliance",
                "Predictive maintenance insights"
            ]
        },
        enterprise: {
            name: "Enterprise Scale",
            icon: <Building2 className="w-8 h-8" />,
            price: "Custom",
            period: "/quote",
            description: "Tailored solution for large corporations with complex needs",
            color: "from-gray-700 to-gray-900",
            bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
            features: [
                "Unlimited everything",
                "Custom development & integration",
                "Dedicated deployment options",
                "Advanced security & compliance",
                "Global multi-currency support",
                "AI-powered predictive analytics",
                "Executive dashboard & BI",
                "Dedicated 24/7 support team"
            ],
            advantages: [
                "Customized to your workflow",
                "Global multi-site management",
                "Enterprise-grade SLAs",
                "Strategic business intelligence"
            ]
        }
    };

    const integrations = [
        { name: "QuickBooks", logo: "QB", color: "bg-blue-100 text-blue-700" },
        { name: "Xero", logo: "X", color: "bg-emerald-100 text-emerald-700" },
        { name: "Salesforce", logo: "SF", color: "bg-sky-100 text-sky-700" },
        { name: "Shopify", logo: "S", color: "bg-green-100 text-green-700" },
        { name: "Stripe", logo: "$", color: "bg-purple-100 text-purple-700" },
        { name: "Microsoft 365", logo: "M", color: "bg-orange-100 text-orange-700" },
    ];

    const testimonials = [
        {
            quote: "PAEasy transformed our entire operation. We reduced accounting time by 40% while improving accuracy across all departments.",
            author: "Sarah Chen",
            role: "CFO, TechForward Inc.",
            rating: 5,
            package: "sme"
        },
        {
            quote: "The inventory management system is incredible. Our multi-store operations have never been this efficient. The system pays for itself.",
            author: "Michael Rodriguez",
            role: "Operations Director, RetailChain",
            rating: 5,
            package: "retail"
        },
        {
            quote: "The HR integration saved us countless hours on payroll processing. The employee self-service portal is a game-changer for our team.",
            author: "Emma Wilson",
            role: "HR Manager, GrowthCorp",
            rating: 5,
            package: "enterprise"
        }
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Nav - Modern Floating Glassmorphism */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'py-3' : 'py-6'
                }`}>
                <div className="container mx-auto px-6">
                    <div className={`flex items-center justify-between transition-all duration-300 rounded-2xl px-6 py-3 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border border-slate-200' : 'bg-transparent'
                        }`}>
                        <div className="flex items-center space-x-2 group cursor-pointer">
                            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                PAEasy
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-10">
                            {['Solutions', 'Features', 'Pricing', 'Enterprise'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                                    {item}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="hidden sm:block text-sm font-bold text-slate-700 hover:text-indigo-600">Sign In</button>
                            <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-200">
                                Start Free
                            </button>
                            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero - Mesh Gradient & Dynamic Shapes */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/50 blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trusted by 10,000+ businesses worldwide</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-8 max-w-5xl mx-auto leading-[1.1]">
                        The Complete Operating System for <br />
                        <span className="text-indigo-600 relative">
                            Modern Business
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9C118.957 4.47226 238.043 -2.02774 355 7.5" stroke="#6366F1" strokeWidth="5" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        PAEasy unifies your accounting, inventory, HR, sales, and operations in one powerful platform.
                        Built for the speed and complexity of modern business.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center group">
                            Start Free Trial
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                            <Play className="mr-2 w-5 h-5 fill-slate-900" />
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto mb-20">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">99.9%</div>
                            <div className="text-slate-600">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">40%</div>
                            <div className="text-slate-600">Time Saved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">24/7</div>
                            <div className="text-slate-600">Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">5,000+</div>
                            <div className="text-slate-600">Integrations</div>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative max-w-6xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent z-10 h-full" />
                        <div className="rounded-3xl border border-slate-200 shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm p-4">
                            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-inner h-[400px] md:h-[600px] flex items-center justify-center">
                                <span className="text-slate-300 font-medium">Interactive Platform Visualization</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <p className="text-center text-slate-500 text-sm font-medium mb-12 tracking-wide">TRUSTED BY LEADING COMPANIES</p>
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-8 items-center">
                        {integrations.map((integration, index) => (
                            <div key={index} className="flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.color} font-bold text-lg`}>
                                    {integration.logo}
                                </div>
                                <span className="mt-3 text-sm text-slate-600">{integration.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features - Bento Grid Style */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">Core Capabilities</h2>
                            <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">Everything needed to dominate your market.</h3>
                        </div>
                        <button className="text-indigo-600 font-bold flex items-center hover:translate-x-2 transition-transform">
                            View all 50+ features <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreFeatures.map((feature, i) => (
                            <div key={i} className="group relative p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:-rotate-6 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                                <div className="mt-8 pt-6 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-indigo-600 text-xs font-black uppercase tracking-widest">{feature.module}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Module Features - Detailed Breakdown */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Complete Business Management</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Every module you need to run your entire business operation seamlessly
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {moduleFeatures.map((module, i) => (
                            <div key={i} className="group relative p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-2xl transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg transform group-hover:-rotate-6 transition-transform flex-shrink-0`}>
                                        {module.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-bold text-slate-900 mb-3">{module.title}</h4>
                                        <p className="text-slate-600 leading-relaxed mb-6">
                                            {module.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {module.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center text-sm text-slate-700">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / Packages - Interactive Stack */}
            <section id="pricing" className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">Designed for every stage of growth</h2>
                        <p className="text-slate-400 max-w-xl mx-auto italic">"The last business platform you'll ever need to migrate to."</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6 items-center max-w-6xl mx-auto">
                        {/* Free Package */}
                        <div className="p-7 rounded-[2rem] bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-all group">
                            <Sparkles className="w-10 h-10 text-indigo-300 mb-6" />
                            <h4 className="text-2xl font-bold mb-2">Free</h4>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black">$0</span>
                                <span className="text-slate-400 ml-2">/mo</span>
                            </div>
                            <ul className="space-y-3 mb-10">
                                {['Accounting Lite', 'HR Payroll Summary', '2 User Seats', 'Community Support'].map(item => (
                                    <li key={item} className="flex items-center text-slate-300 text-sm">
                                        <Check className="w-4 h-4 text-indigo-300 mr-3" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-indigo-400 hover:text-white transition-all">
                                Start Free
                            </button>
                        </div>

                        {/* Standard Package */}
                        <div className="p-7 rounded-[2rem] bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-all group">
                            <Rocket className="w-10 h-10 text-indigo-400 mb-6" />
                            <h4 className="text-2xl font-bold mb-2">Standard</h4>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black">$79</span>
                                <span className="text-slate-400 ml-2">/mo</span>
                            </div>
                            <ul className="space-y-3 mb-10">
                                {['Core Accounting', 'Inventory + Sales', 'VAT/WHT', 'Email Support'].map(item => (
                                    <li key={item} className="flex items-center text-slate-300 text-sm">
                                        <Check className="w-4 h-4 text-indigo-400 mr-3" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-indigo-400 hover:text-white transition-all">
                                Choose Standard
                            </button>
                        </div>

                        {/* SME Package - Highlighted */}
                        <div className="p-9 rounded-[2rem] bg-indigo-600 border border-indigo-400 shadow-2xl shadow-indigo-500/20 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                                Recommended
                            </div>
                            <Briefcase className="w-10 h-10 text-white mb-6" />
                            <h4 className="text-2xl font-bold mb-2">Pro Suite</h4>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black">$199</span>
                                <span className="text-indigo-200 ml-2">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 text-indigo-50">
                                {['Full Accounting', 'Inventory + CRM', 'HR + Payroll', 'POS Integration', 'Priority Support', 'API Access'].map(item => (
                                    <li key={item} className="flex items-center text-sm">
                                        <Check className="w-4 h-4 text-indigo-200 mr-3" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-800 transition-all shadow-xl">
                                Claim My Trial
                            </button>
                        </div>

                        {/* Enterprise Package */}
                        <div className="p-7 rounded-[2rem] bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-all">
                            <Building2 className="w-10 h-10 text-indigo-400 mb-6" />
                            <h4 className="text-2xl font-bold mb-2">Enterprise</h4>
                            <div className="text-4xl font-black mb-6">Custom</div>
                            <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                                Bespoke infrastructure, on-premise deployment options, and white-glove support.
                            </p>
                            <button className="w-full py-4 border-2 border-slate-600 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* POS Features Section - Odoo Inspired */}
            <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-8">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Point of Sale Excellence
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Modern POS for Modern Retail
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Complete point of sale solution that works online and offline, designed for speed and reliability
                        </p>
                    </div>

                    {/* POS Interface Mockup - Odoo Style */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                                {/* POS Header */}
                                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-semibold">PAEasy POS</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-white text-sm">
                                        <span>Order #1234</span>
                                        <span>Table 12</span>
                                    </div>
                                </div>

                                {/* POS Screen */}
                                <div className="grid grid-cols-3 h-[500px]">
                                    {/* Product Categories */}
                                    <div className="bg-slate-50 border-r border-slate-200 p-4">
                                        <h4 className="font-semibold text-slate-700 mb-4 text-sm">Categories</h4>
                                        <div className="space-y-2">
                                            {['Beverages', 'Food', 'Electronics', 'Clothing'].map((cat, i) => (
                                                <button key={i} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-green-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                                                    }`}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="p-4">
                                        <h4 className="font-semibold text-slate-700 mb-4 text-sm">Products</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Coffee', 'Tea', 'Sandwich', 'Cake', 'Juice', 'Water'].map((product, i) => (
                                                <button key={i} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-green-500 hover:bg-green-50 transition-all">
                                                    <div className="w-8 h-8 bg-slate-200 rounded mx-auto mb-2"></div>
                                                    <span className="text-xs text-slate-700">{product}</span>
                                                    <div className="text-xs font-bold text-green-600">$4.99</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-slate-50 border-l border-slate-200 p-4">
                                        <h4 className="font-semibold text-slate-700 mb-4 text-sm">Current Order</h4>
                                        <div className="space-y-2 mb-4">
                                            <div className="bg-white rounded-lg p-2 border border-slate-200">
                                                <div className="flex justify-between text-xs">
                                                    <span>Coffee x2</span>
                                                    <span>$9.98</span>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-lg p-2 border border-slate-200">
                                                <div className="flex justify-between text-xs">
                                                    <span>Sandwich x1</span>
                                                    <span>$8.99</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>$18.97</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Tax (10%)</span>
                                                <span>$1.90</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span className="text-green-600">$20.87</span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* POS Features List */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Powerful POS Features</h3>

                            {[
                                {
                                    icon: <CreditCard className="w-6 h-6" />,
                                    title: "Multiple Payment Methods",
                                    description: "Accept cash, cards, mobile payments, gift cards, and split payments with ease.",
                                    color: "text-blue-600 bg-blue-50"
                                },
                                {
                                    icon: <Package className="w-6 h-6" />,
                                    title: "Real-time Inventory Sync",
                                    description: "Automatic stock updates across all locations. Never sell out-of-stock items again.",
                                    color: "text-green-600 bg-green-50"
                                },
                                {
                                    icon: <Smartphone className="w-6 h-6" />,
                                    title: "Customer Display",
                                    description: "Show order details, pricing, and promotions to customers for transparency.",
                                    color: "text-purple-600 bg-purple-50"
                                },
                                {
                                    icon: <Users className="w-6 h-6" />,
                                    title: "Offline Mode",
                                    description: "Continue selling even when internet is down. Syncs automatically when reconnected.",
                                    color: "text-orange-600 bg-orange-50"
                                },
                                {
                                    icon: <BarChart3 className="w-6 h-6" />,
                                    title: "Advanced Reporting",
                                    description: "Detailed sales analytics, product performance, and staff productivity reports.",
                                    color: "text-red-600 bg-red-50"
                                },
                                {
                                    icon: <Clock className="w-6 h-6" />,
                                    title: "Quick Order Management",
                                    description: "Fast order processing with customizable shortcuts and product favorites.",
                                    color: "text-indigo-600 bg-indigo-50"
                                }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start space-x-4 group">
                                    <div className={`p-3 rounded-xl ${feature.color} transform group-hover:scale-110 transition-transform`}>
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* POS Hardware Compatibility - Odoo Style */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Hardware Compatibility</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { name: "Receipt Printers", icon: "🖨️" },
                                { name: "Barcode Scanners", icon: "📷" },
                                { name: "Cash Drawers", icon: "💰" },
                                { name: "Customer Displays", icon: "📺" },
                                { name: "Scales", icon: "⚖️" },
                                { name: "Card Readers", icon: "💳" },
                                { name: "Kitchen Printers", icon: "🍳" },
                                { name: "Tablet Stands", icon: "📱" }
                            ].map((hardware, i) => (
                                <div key={i} className="text-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="text-3xl mb-2">{hardware.icon}</div>
                                    <div className="text-sm font-medium text-slate-700">{hardware.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-8">
                            <Star className="w-4 h-4 mr-2" />
                            Customer Stories
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Loved by Growing Businesses
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">
                                        {testimonial.package.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-slate-700 text-lg mb-8 italic leading-relaxed">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                                    <p className="text-slate-600">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of companies that have streamlined their operations with PAEasy
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                                Start Free 30-Day Trial
                            </button>
                            <button className="px-8 py-4 border-2 border-slate-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
                                Schedule a Demo
                            </button>
                        </div>
                        <p className="mt-8 text-slate-400 text-sm">
                            No credit card required • Full support included • Cancel anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#fafafa] pt-20 pb-10 border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-semibold">PAEasy</span>
                            </div>
                            <p className="text-slate-500 max-w-md leading-relaxed">
                                The complete business management platform for modern companies.
                                Streamline operations, boost productivity, and drive growth.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-6">Solutions</h4>
                            <ul className="space-y-3 text-slate-500">
                                <li><a href="#" className="hover:text-slate-900 transition-colors">For Startups</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">For Retail</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">For SMEs</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">For Manufacturing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-6">Company</h4>
                            <ul className="space-y-3 text-slate-500">
                                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-6">Legal</h4>
                            <ul className="space-y-3 text-slate-500">
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-slate-900 transition-colors">Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-8 text-center text-slate-400 text-sm">
                        <p>© 2026 PAEasy Inc. All rights reserved.</p>
                        <div className="flex items-center justify-center mt-4 space-x-6">
                            <Globe2 className="w-4 h-4" />
                            <Lock className="w-4 h-4" />
                            <Cloud className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
