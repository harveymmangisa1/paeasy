import React, { useState } from 'react';
import { Calculator, BarChart3, Plus, ArrowRightLeft } from 'lucide-react';

const Accounting = () => {
    const accounts = [
        { code: '1000', name: 'Main Cash Account', type: 'Asset', balance: '$25,400.00' },
        { code: '1200', name: 'Inventory Asset', type: 'Asset', balance: '$12,000.00' },
        { code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: '$85,200.00' },
        { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: '$42,000.00' },
    ];

    const entries = [
        { id: 'JE-001', date: '2025-01-12', desc: 'Sale Transaction POS-123', amount: '$45.00' },
        { id: 'JE-002', date: '2025-01-12', desc: 'Inventory Restock', amount: '$1,200.00' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Accounting & GL</h1>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <BarChart3 size={18} />
                        <span>Financial Reports</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <Plus size={18} />
                        <span>Manual Journal Entry</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold flex items-center space-x-2">
                            <Calculator size={18} className="text-primary-500" />
                            <span>Chart of Accounts</span>
                        </h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">Code</th>
                                <th className="px-4 py-3 font-medium">Account</th>
                                <th className="px-4 py-3 font-medium text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {accounts.map(acc => (
                                <tr key={acc.code} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="px-4 py-3 font-mono text-slate-500">{acc.code}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{acc.name}</p>
                                        <p className="text-xs text-slate-400">{acc.type}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">{acc.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold flex items-center space-x-2">
                            <ArrowRightLeft size={18} className="text-orange-500" />
                            <span>Recent Journal Entries</span>
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {entries.map(entry => (
                            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                <div>
                                    <p className="text-xs text-slate-400 font-mono">{entry.id} • {entry.date}</p>
                                    <p className="font-medium text-slate-800">{entry.desc}</p>
                                </div>
                                <p className="font-bold text-slate-900">{entry.amount}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-sm font-bold text-primary-600 hover:underline">View General Ledger</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accounting;
