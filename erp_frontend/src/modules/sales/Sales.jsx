import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Utensils, Scissors, Package, Trash2, Plus, Minus, Search, X } from 'lucide-react';
import { usePOS } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

const Sales = ({ industry = 'retail' }) => {
    const { user } = useAuth();
    const { products, loading, error, fetchPOSProducts, createSale } = usePOS();
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        // Fetch products for mock branch ID 1 (or derived from user)
        fetchPOSProducts(1);
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            return prev.map(p => {
                if (p.id === productId) {
                    const newQty = Math.max(1, p.quantity + delta);
                    return { ...p, quantity: newQty };
                }
                return p;
            });
        });
    };

    const clearCart = () => setCart([]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const tax = subtotal * 0.1; // Mock 10% tax
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!cart.length) return;
        setProcessing(true);
        try {
            const saleData = {
                branch_id: 1, // Mock
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.selling_price,
                    line_total: item.selling_price * item.quantity
                })),
                subtotal: subtotal,
                tax_amount: tax,
                total_amount: total,
                paid_amount: total, // Input logic could go here
                payment_method: paymentMethod,
                staff_id: user?.id,
                receipt_number: `REC-${Date.now()}`
            };

            await createSale(saleData);
            alert('Sale completed successfully!');
            clearCart();
            setShowCheckout(false);
            // Refresh stock? fetchPOSProducts(1);
        } catch (err) {
            console.error(err);
            alert('Transaction failed: ' + err.message);
        }
        setProcessing(false);
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading products...</div>;

    return (
        <div className="flex h-full space-x-6 relative">
            {/* Product Grid */}
            <div className="flex-1 space-y-6 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center shrink-0">
                    <h1 className="text-2xl font-bold">Point of Sale</h1>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="glass-card p-4 hover:border-primary-500 cursor-pointer transition-all flex flex-col h-full group"
                            >
                                <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 transition-colors">
                                    <Package size={32} className="group-hover:text-primary-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                                <p className="text-sm text-slate-500 mb-2 truncate">{product.category}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <span className="font-bold text-primary-600">${product.selling_price.toFixed(2)}</span>
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">Qty: {product.stock_quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 glass-card flex flex-col h-[calc(100vh-8rem)] shrink-0">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center space-x-2">
                        <ShoppingCart size={20} />
                        <span>Current Order</span>
                    </h2>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Clear</button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">
                            Cart is empty
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-sm text-slate-500">${item.selling_price}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-200 rounded"><Minus size={14} /></button>
                                    <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-200 rounded"><Plus size={14} /></button>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => setShowCheckout(true)}
                        disabled={cart.length === 0}
                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                    >
                        <CreditCard size={20} />
                        <span>Charge ${total.toFixed(2)}</span>
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Complete Payment</h3>
                            <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center py-4 bg-slate-50 rounded-xl">
                                <p className="text-slate-500 text-sm">Amount Due</p>
                                <p className="text-4xl font-bold text-slate-900">${total.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'cash' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <DollarSign size={24} />
                                    <span className="font-bold">Cash</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="font-bold">Card</span>
                                </button>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                {processing ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>Confirm Payment</span>
                                        <CheckCircle size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helpers for missing icons
const DollarSign = ({ size }) => <span style={{ fontSize: size }}>$</span>;
const CheckCircle = ({ size }) => <span style={{ fontSize: size }}>✓</span>;

export default Sales;
