import React from 'react';

const Bills = ({ bills, vendors }) => {
    return (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-xl font-semibold">Outstanding Bills</h3>
                <div className="mt-4 space-y-3">
                    {bills.map((bill) => (
                        <div key={bill.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{bill.vendor}</p>
                                <p className="text-xs text-slate-500">Due {bill.due}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">${bill.amount.toLocaleString()}</p>
                                <p className={`text-xs ${bill.status === 'paid' ? 'text-emerald-300' : 'text-amber-300'}`}>{bill.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-xl font-semibold">Vendors</h3>
                <div className="mt-4 space-y-3 text-sm">
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="font-medium">{vendor.name}</p>
                            <p className="text-xs text-slate-500">{vendor.email}</p>
                            <p className={`mt-2 text-xs ${vendor.status === 'active' ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {vendor.status}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Bills;
