import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';

const AccountingLite = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Accounting Lite</h2>
                        <p className="text-sm text-slate-600">Payroll-linked summaries for HR-only teams.</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">Payroll expense (MTD)</p>
                        <p className="text-xl font-semibold text-slate-900">MWK 18,420,000</p>
                        <p className="text-xs text-slate-500 mt-2">Auto-posted to payroll clearing.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">Statutory liabilities</p>
                        <p className="text-xl font-semibold text-slate-900">MWK 3,210,000</p>
                        <p className="text-xs text-slate-500 mt-2">PAYE + pension + levies.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs text-slate-500">Next filing</p>
                        <p className="text-xl font-semibold text-slate-900">Feb 28, 2026</p>
                        <p className="text-xs text-slate-500 mt-2">Auto reminders enabled.</p>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Upgrade to unlock full Accounting: General Ledger, AR/AP, VAT/WHT, bank reconciliation, and reports.
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                        Upgrade to Full Accounting
                    </button>
                    <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700">
                        View plan comparison <ArrowRight className="inline h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountingLite;
