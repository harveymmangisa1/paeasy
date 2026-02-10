import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ReceiptAllocation = ({ invoices }) => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const invoice = invoices.find((item) => item.id === invoiceId);
    const [form, setForm] = useState({
        date: '2026-02-09',
        method: 'Bank transfer',
        amount: invoice ? invoice.amount : '',
        reference: '',
        whtRate: 5,
    });

    if (!invoice) {
        return (
            <section className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Invoice not found</h3>
                <button
                    onClick={() => navigate('/accounting/receivables')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to receivables
                </button>
            </section>
        );
    }

    const withheld = Math.round((Number(form.amount) || 0) * (form.whtRate / 100));
    const net = Math.max((Number(form.amount) || 0) - withheld, 0);

    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Allocate receipt</p>
                    <h3 className="text-2xl font-semibold">{invoice.customer}</h3>
                    <p className="text-sm text-slate-400">{invoice.id} • Due {invoice.due}</p>
                </div>
                <button
                    onClick={() => navigate(`/accounting/receivables/invoices/${invoice.id}`)}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to invoice
                </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h4 className="text-lg font-semibold">Receipt details</h4>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <input
                        type="date"
                        value={form.date}
                        onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                    />
                    <input
                        type="text"
                        value={form.reference}
                        onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
                        placeholder="Reference"
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                    />
                    <select
                        value={form.method}
                        onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                    >
                        <option>Bank transfer</option>
                        <option>Mobile money</option>
                        <option>Cash</option>
                        <option>Card</option>
                    </select>
                    <input
                        type="number"
                        value={form.amount}
                        onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                        placeholder="Amount received"
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                    />
                </div>
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                        <span>Withholding tax rate</span>
                        <select
                            value={form.whtRate}
                            onChange={(event) => setForm((prev) => ({ ...prev, whtRate: Number(event.target.value) }))}
                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-slate-200"
                        >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={10}>10%</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>WHT withheld</span>
                        <span>MWK {withheld.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Net applied</span>
                        <span className="text-emerald-300">MWK {net.toLocaleString()}</span>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate('/accounting/receivables')}
                        className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950">
                        Save receipt
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReceiptAllocation;
