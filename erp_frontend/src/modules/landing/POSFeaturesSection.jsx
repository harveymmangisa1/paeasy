import React, { useState, useEffect, useRef } from 'react';
import { 
    CreditCard, Package, Smartphone, Users, BarChart3, Clock, 
    Monitor, Printer, Camera, DollarSign, Wifi, WifiOff,
    ChevronRight, Play, ArrowRight, Check, Star, Zap,
    Coffee, Utensils, Laptop, Shirt, ExternalLink
} from 'lucide-react';

const POSFeaturesSection = () => {
    const [scrollY, setScrollY] = useState(0);
    const [activeCategory, setActiveCategory] = useState('beverages');
    const [currentOrder, setCurrentOrder] = useState([]);
    const [isOffline, setIsOffline] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [email, setEmail] = useState('');
    const [showSignup, setShowSignup] = useState(false);
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            
            // Check if section is visible
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
                setIsVisible(isInView);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const categories = [
        { id: 'beverages', name: 'Beverages', icon: <Coffee className="w-5 h-5" />, color: 'bg-blue-500' },
        { id: 'food', name: 'Food', icon: <Utensils className="w-5 h-5" />, color: 'bg-green-500' },
        { id: 'electronics', name: 'Electronics', icon: <Laptop className="w-5 h-5" />, color: 'bg-purple-500' },
        { id: 'clothing', name: 'Clothing', icon: <Shirt className="w-5 h-5" />, color: 'bg-orange-500' }
    ];

    const products = {
        beverages: [
            { id: 1, name: 'Coffee', price: 4.99, icon: <Coffee className="w-8 h-8" /> },
            { id: 2, name: 'Tea', price: 3.99, icon: <Coffee className="w-8 h-8" /> },
            { id: 3, name: 'Juice', price: 5.99, icon: <Coffee className="w-8 h-8" /> },
            { id: 4, name: 'Water', price: 2.99, icon: <Coffee className="w-8 h-8" /> }
        ],
        food: [
            { id: 5, name: 'Sandwich', price: 8.99, icon: <Utensils className="w-8 h-8" /> },
            { id: 6, name: 'Burger', price: 12.99, icon: <Utensils className="w-8 h-8" /> },
            { id: 7, name: 'Salad', price: 9.99, icon: <Utensils className="w-8 h-8" /> },
            { id: 8, name: 'Pizza', price: 14.99, icon: <Utensils className="w-8 h-8" /> }
        ],
        electronics: [
            { id: 9, name: 'Headphones', price: 49.99, icon: <Laptop className="w-8 h-8" /> },
            { id: 10, name: 'Mouse', price: 29.99, icon: <Laptop className="w-8 h-8" /> },
            { id: 11, name: 'Keyboard', price: 79.99, icon: <Laptop className="w-8 h-8" /> },
            { id: 12, name: 'Webcam', price: 89.99, icon: <Laptop className="w-8 h-8" /> }
        ],
        clothing: [
            { id: 13, name: 'T-Shirt', price: 19.99, icon: <Shirt className="w-8 h-8" /> },
            { id: 14, name: 'Jeans', price: 49.99, icon: <Shirt className="w-8 h-8" /> },
            { id: 15, name: 'Jacket', price: 89.99, icon: <Shirt className="w-8 h-8" /> },
            { id: 16, name: 'Shoes', price: 79.99, icon: <Shirt className="w-8 h-8" /> }
        ]
    };

    const features = [
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Multiple Payment Methods",
            description: "Accept cash, cards, mobile payments, gift cards, and split payments with seamless integration.",
            color: "from-blue-500 to-blue-600",
            stats: "5+ Payment Options"
        },
        {
            icon: <Package className="w-6 h-6" />,
            title: "Real-time Inventory Sync",
            description: "Automatic stock updates across all locations. Never sell out-of-stock items again.",
            color: "from-green-500 to-green-600",
            stats: "Live Stock Updates"
        },
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: "Customer Display",
            description: "Show order details, pricing, and promotions to customers for complete transparency.",
            color: "from-purple-500 to-purple-600",
            stats: "HD Customer Screen"
        },
        {
            icon: <WifiOff className="w-6 h-6" />,
            title: "Offline Mode",
            description: "Continue selling even when internet is down. Syncs automatically when reconnected.",
            color: "from-orange-500 to-orange-600",
            stats: "100% Offline Capability"
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Advanced Analytics",
            description: "Detailed sales analytics, product performance, and staff productivity reports.",
            color: "from-red-500 to-red-600",
            stats: "50+ Report Types"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Lightning Fast",
            description: "Optimized for speed with instant product search and quick order processing.",
            color: "from-yellow-500 to-yellow-600",
            stats: "< 1s Response Time"
        }
    ];

    const hardware = [
        { name: "Receipt Printers", icon: <Printer className="w-8 h-8" />, compatible: true },
        { name: "Barcode Scanners", icon: <Camera className="w-8 h-8" />, compatible: true },
        { name: "Cash Drawers", icon: <DollarSign className="w-8 h-8" />, compatible: true },
        { name: "Customer Displays", icon: <Monitor className="w-8 h-8" />, compatible: true },
        { name: "Scales", icon: <Package className="w-8 h-8" />, compatible: true },
        { name: "Card Readers", icon: <CreditCard className="w-8 h-8" />, compatible: true },
        { name: "Kitchen Printers", icon: <Printer className="w-8 h-8" />, compatible: true },
        { name: "Tablet Stands", icon: <Smartphone className="w-8 h-8" />, compatible: true }
    ];

    const addToOrder = (product) => {
        const existingItem = currentOrder.find(item => item.id === product.id);
        if (existingItem) {
            setCurrentOrder(currentOrder.map(item => 
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCurrentOrder([...currentOrder, { ...product, quantity: 1 }]);
        }
    };

    const calculateTotal = () => {
        return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateTotal() * 0.1;
    };

    const calculateGrandTotal = () => {
        return calculateTotal() + calculateTax();
    };

    const handleGetStarted = () => {
        // Scroll to top or navigate to signup
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowSignup(true);
        
        // Or navigate to signup page
        // window.location.href = '/signup';
    };

    const handleWatchDemo = () => {
        setShowDemo(true);
        // In a real app, this would open a modal or navigate to demo page
        console.log('Opening POS demo...');
    };

    const handleEmailSignup = () => {
        if (email) {
            console.log('Starting trial for:', email);
            // In a real app, this would submit to backend
            alert(`Thank you! We'll send trial instructions to ${email}`);
            setEmail('');
            setShowSignup(false);
        }
    };

    return (
        <section 
            ref={sectionRef}
            className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden"
        >
            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium mb-8">
                        <div className="w-2 h-2 bg-slate-400 rounded-full mr-2" />
                        Point of Sale Excellence
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                        Modern POS for
                        <span className="block text-slate-600">
                            Modern Retail
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Complete point of sale solution that works online and offline, designed for speed, reliability, and exceptional customer experience.
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                        <button 
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center group"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={handleWatchDemo}
                            className="px-8 py-4 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            <Play className="mr-2 w-5 h-5 fill-slate-900" />
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Main POS Demo */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                    {/* POS Interface */}
                    <div className={`transition-all duration-1000 delay-200 ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                    }`}>
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                            {/* POS Header */}
                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold text-lg">PAEasy POS</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-slate-400 text-xs">● Online</span>
                                            <span className="text-slate-500 text-xs">v4.0</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-white text-sm font-medium">Order #1234</div>
                                        <div className="text-slate-400 text-xs">Table 12</div>
                                    </div>
                                    <button 
                                        onClick={() => setIsOffline(!isOffline)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isOffline ? 'bg-slate-600 text-white' : 'bg-slate-700 text-slate-300'
                                        }`}
                                    >
                                        {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* POS Screen */}
                            <div className="grid grid-cols-3 h-[500px] lg:h-[600px]">
                                {/* Product Categories */}
                                <div className="bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
                                    <h4 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map((cat) => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                    activeCategory === cat.id 
                                                        ? `${cat.color} text-white shadow-lg` 
                                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-slate-600">{cat.icon}</div>
                                                    <span>{cat.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Products Grid */}
                                <div className="p-4 overflow-y-auto">
                                    <h4 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Products</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {products[activeCategory].map((product) => (
                                            <button 
                                                key={product.id}
                                                onClick={() => addToOrder(product)}
                                                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group"
                                            >
                                                <div className="w-8 h-8 text-slate-400 mb-2 mx-auto flex items-center justify-center">{product.icon}</div>
                                                <div className="text-sm font-medium text-slate-700 mb-1">{product.name}</div>
                                                <div className="text-sm font-bold text-slate-900">${product.price}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Order Summary */}
                                <div className="bg-slate-50 border-l border-slate-200 p-4 flex flex-col">
                                    <h4 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Current Order</h4>
                                    
                                    <div className="flex-1 overflow-y-auto mb-4">
                                        {currentOrder.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Package className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 text-sm">No items added yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {currentOrder.map((item, index) => (
                                                    <div 
                                                        key={index}
                                                        className="bg-white rounded-xl p-3 border border-slate-200"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-slate-700">{item.name}</div>
                                                                <div className="text-xs text-slate-500">${item.price} x {item.quantity}</div>
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-900">
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="border-t border-slate-200 pt-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Tax (10%)</span>
                                            <span className="font-medium">${calculateTax().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                                            <span className="text-slate-900">Total</span>
                                            <span className="text-slate-900">${calculateGrandTotal().toFixed(2)}</span>
                                        </div>
                                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className={`space-y-6 transition-all duration-1000 delay-400 ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                    }`}>
                        <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">Powerful POS Features</h3>
                        
                        <div className="space-y-4">
                            {features.map((feature, i) => (
                                <div 
                                    key={i}
                                    className="group flex items-start space-x-6 p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                                    style={{ 
                                        transitionDelay: `${i * 100}ms`,
                                        transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                                        opacity: isVisible ? 1 : 0
                                    }}
                                >
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xl font-bold text-slate-900">{feature.title}</h4>
                                            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                {feature.stats}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hardware Compatibility */}
                <div className={`bg-white rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-xl transition-all duration-1000 delay-600 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="text-center mb-12">
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Universal Hardware Compatibility</h3>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Works seamlessly with all major POS hardware manufacturers. Plug and play setup with automatic device detection.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {hardware.map((item, i) => (
                            <div 
                                key={i}
                                className="group text-center p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                                style={{ 
                                    transitionDelay: `${i * 50}ms`,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                    opacity: isVisible ? 1 : 0
                                }}
                            >
                                <div className="w-8 h-8 text-slate-400 mb-3 mx-auto flex items-center justify-center">{item.icon}</div>
                                <div className="text-sm font-semibold text-slate-700 mb-2">{item.name}</div>
                                <div className="flex items-center justify-center">
                                    {item.compatible && (
                                        <div className="flex items-center text-slate-600 text-xs">
                                            <Check className="w-3 h-3 mr-1" />
                                            Compatible
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Stats */}
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-800 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    {[
                        { value: "99.9%", label: "Uptime", icon: <Monitor className="w-5 h-5" /> },
                        { value: "< 1s", label: "Response Time", icon: <Zap className="w-5 h-5" /> },
                        { value: "500+", label: "Integrations", icon: <Package className="w-5 h-5" /> },
                        { value: "24/7", label: "Support", icon: <Users className="w-5 h-5" /> }
                    ].map((stat, i) => (
                        <div 
                            key={i}
                            className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-all duration-300"
                            style={{ 
                                transitionDelay: `${i * 100}ms`,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                opacity: isVisible ? 1 : 0
                            }}
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4 mx-auto">
                                {stat.icon}
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-600">{stat.label}</div>
                        </div>
                    ))}
                </div>

            {/* Signup Modal */}
            {showSignup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Start Your Free Trial</h3>
                        <p className="text-slate-600 mb-6">
                            Get instant access to PAEasy POS. No credit card required.
                        </p>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && handleEmailSignup()}
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={handleEmailSignup}
                                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Start Trial
                            </button>
                            <button 
                                onClick={() => setShowSignup(false)}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
</div>

                {/* Final CTA Section */}
                <div className={`text-center mt-20 transition-all duration-1000 delay-800 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 max-w-4xl mx-auto shadow-lg">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">
                            Ready to Transform Your Business?
                        </h3>
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                            Join thousands of retailers who trust PAEasy POS for their daily operations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button 
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center group"
                            >
                                Start Free 30-Day Trial
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={handleWatchDemo}
                                className="px-8 py-4 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                            >
                                <Play className="mr-2 w-5 h-5 fill-slate-900" />
                                Schedule Demo
                            </button>
                        </div>
                        <p className="mt-6 text-slate-500 text-sm">
                            No credit card required • Full support included • Cancel anytime
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default POSFeaturesSection;