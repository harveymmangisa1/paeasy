import React from 'react';

const Settings = () => {
    return (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-lg font-semibold">Fiscal settings</h3>
                <div className="mt-4 space-y-4 text-sm">
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div>
                            <p className="font-medium">Fiscal year</p>
                            <p className="text-xs text-slate-500">Jan 1, 2026 - Dec 31, 2026</p>
                        </div>
                        <button className="text-xs text-amber-300">Edit</button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div>
                            <p className="font-medium">Base currency</p>
                            <p className="text-xs text-slate-500">USD</p>
                        </div>
                        <button className="text-xs text-amber-300">Change</button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <div>
                            <p className="font-medium">Tax configuration</p>
                            <p className="text-xs text-slate-500">Default rate 7.5%</p>
                        </div>
                        <button className="text-xs text-amber-300">Configure</button>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-lg font-semibold">Module access</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <span>Enable audit trail</span>
                        <span className="text-emerald-300">Active</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <span>Allow manual journals</span>
                        <span className="text-emerald-300">Active</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <span>Close period approvals</span>
                        <span className="text-amber-300">Pending</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Settings;
