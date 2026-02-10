import React from 'react';
import { LineChart, Landmark, Receipt, ShieldCheck } from 'lucide-react';

const cards = [
    { id: 'rep-1', label: 'Trial Balance', value: '$312,540', icon: ShieldCheck },
    { id: 'rep-2', label: 'Profit & Loss', value: '$48,220', icon: LineChart },
    { id: 'rep-3', label: 'Balance Sheet', value: '$264,320', icon: Landmark },
    { id: 'rep-4', label: 'Tax Summary', value: '$7,410', icon: Receipt },
];

const Reports = () => {
    return (
        <section className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">{card.label}</p>
                                <Icon className="h-5 w-5 text-amber-300" />
                            </div>
                            <p className="mt-4 text-xl font-semibold">{card.value}</p>
                            <button className="mt-3 text-xs text-amber-300">Open report</button>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Trial Balance</h3>
                    <div className="mt-4 h-48 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        Trial balance table placeholder
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Profit & Loss</h3>
                    <div className="mt-4 h-48 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        P&L chart placeholder
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Asset Register Summary</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Total assets</span>
                            <span className="text-slate-100">128</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Net book value</span>
                            <span className="text-emerald-300">$410,720</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Assets under maintenance</span>
                            <span className="text-amber-300">6</span>
                        </div>
                    </div>
                    <button className="mt-5 text-xs text-amber-300">View asset register</button>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Depreciation Schedule</h3>
                    <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        Depreciation curve placeholder
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Straight-line depreciation overview by asset class.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Asset Utilization</h3>
                    <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        Utilization heatmap placeholder
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Identify idle or overused assets across locations.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">A/R Aging (MWK)</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                        {[
                            { label: 'Current', amount: 9800 },
                            { label: '1-30 days', amount: 4200 },
                            { label: '31-60 days', amount: 1800 },
                            { label: '61-90 days', amount: 900 },
                            { label: '90+ days', amount: 560 },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between">
                                <span>{row.label}</span>
                                <span className="text-slate-100">MWK {row.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 text-xs text-amber-300">View customer aging report</button>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Collections Forecast</h3>
                    <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        Collections forecast placeholder
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Expected receipts for the next 30 days.</p>
                </div>
            </div>
        </section>
    );
};

export default Reports;
