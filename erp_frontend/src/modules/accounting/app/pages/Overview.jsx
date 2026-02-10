import React from 'react';
import { LineChart, Landmark, Receipt, ShieldCheck } from 'lucide-react';

const cards = [
    { id: 'rep-1', label: 'Trial Balance', value: '$312,540', icon: ShieldCheck },
    { id: 'rep-2', label: 'Profit & Loss', value: '$48,220', icon: LineChart },
    { id: 'rep-3', label: 'Balance Sheet', value: '$264,320', icon: Landmark },
    { id: 'rep-4', label: 'Tax Summary', value: '$7,410', icon: Receipt },
];

const Overview = ({ stats, loading }) => {
    const displayStats = stats || {
        total_assets: 312540,
        total_liabilities: 84220,
        monthly_revenue: 48220,
        monthly_expenses: 27190,
    };
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
                            <p className="mt-4 text-2xl font-semibold">{card.value}</p>
                            <p className="mt-2 text-xs text-slate-500">{loading ? 'Refreshing...' : 'Updated just now'}</p>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Assets', value: displayStats.total_assets },
                    { label: 'Total Liabilities', value: displayStats.total_liabilities },
                    { label: 'Revenue (MTD)', value: displayStats.monthly_revenue },
                    { label: 'Expenses (MTD)', value: displayStats.monthly_expenses },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <p className="text-sm text-slate-400">{item.label}</p>
                        <p className="mt-4 text-2xl font-semibold">MWK {item.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Cashflow snapshot</h3>
                        <button className="text-xs text-amber-300">Download report</button>
                    </div>
                    <div className="mt-6 h-44 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-sm text-slate-500">
                        Cashflow chart placeholder
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400">Inflow</p>
                            <p className="text-lg font-semibold text-emerald-300">$92,430</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Outflow</p>
                            <p className="text-lg font-semibold text-rose-300">$57,190</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Net</p>
                            <p className="text-lg font-semibold text-slate-200">$35,240</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h3 className="text-lg font-semibold">Close checklist</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-300">
                        <li className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Bank reconciliations complete
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Pending vendor approvals
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                            Tax filings due in 3 days
                        </li>
                    </ul>
                    <button className="mt-6 w-full rounded-xl border border-slate-700 py-2 text-sm text-slate-200 hover:bg-slate-800">
                        Review closing tasks
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Overview;
