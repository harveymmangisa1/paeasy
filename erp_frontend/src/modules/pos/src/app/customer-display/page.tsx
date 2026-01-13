'use client';

import { useCustomerDisplay } from '@/hooks/use-customer-display';
import { ShoppingCart, CheckCircle, Store } from 'lucide-react';
import { ModernLayout } from '@/components/layout/ModernLayout';

export default function CustomerDisplayPage() {
    const { cartState, lastSale } = useCustomerDisplay();

    if (lastSale) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg w-full">
                    <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-500 mb-8">Your transaction was successful.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt</p>
                        <p className="text-xl font-mono text-gray-900">{lastSale.receiptNumber}</p>
                    </div>

                    <div className="bg-green-600 text-white rounded-2xl p-6">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Change Due</p>
                        <p className="text-4xl font-black font-mono">K {lastSale.change.toLocaleString()}</p>
                    </div>

                    <p className="mt-8 text-sm text-gray-400">Please come again!</p>
                </div>
            </div>
        );
    }

    if (!cartState || cartState.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-2xl w-full flex flex-col items-center">
                    <div className="bg-blue-100 w-32 h-32 rounded-full flex items-center justify-center mb-8 animate-bounce">
                        <Store className="h-16 w-16 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Welcome to PaeasyShop</h1>
                    <p className="text-xl text-gray-500">Next customer please...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-100 flex flex-col p-6 gap-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-xl">
                        <Store className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">PaeasyShop</h1>
                        <p className="text-gray-500">Customer Display</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Items</p>
                    <p className="text-2xl font-black text-gray-900">{cartState.items.length}</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Items List */}
                <div className="col-span-8 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-400 text-sm tracking-widest flex">
                        <span className="flex-1">ITEM DESCRIPTION</span>
                        <span className="w-24 text-center">QTY</span>
                        <span className="w-32 text-right">PRICE</span>
                        <span className="w-40 text-right">TOTAL</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cartState.items.map((item, idx) => (
                            <div key={idx} className="flex items-center text-lg p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1 font-bold text-gray-800">
                                    <span className="text-gray-400 mr-4 font-mono text-sm">#{idx + 1}</span>
                                    {item.product.name}
                                </div>
                                <div className="w-24 text-center font-mono font-bold text-gray-600">x{item.quantity}</div>
                                <div className="w-32 text-right text-gray-500">K{item.product.sellingPrice.toLocaleString()}</div>
                                <div className="w-40 text-right font-black text-gray-900">K{(item.product.sellingPrice * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Side */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl flex-1 flex flex-col justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <p className="text-xl font-bold opacity-80 uppercase tracking-widest mb-2 relative z-10">Total Amount Due</p>
                        <h2 className="text-6xl font-black font-mono relative z-10">
                            <span className="text-4xl align-top mr-2 opacity-50">K</span>
                            {cartState.total.toLocaleString()}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center text-gray-500">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-mono text-xl">K {cartState.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500 pb-4 border-b">
                            <span className="font-medium">Tax (16.5%)</span>
                            <span className="font-mono text-xl">K {cartState.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-black text-gray-900 text-xl">TOTAL</span>
                            <span className="font-black text-blue-600 text-3xl font-mono">K {cartState.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
