import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InvoiceDetail = ({ invoices, invoiceLines, onAllocateReceipt }) => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const invoice = invoices.find((item) => item.id === invoiceId);
    const lines = invoiceLines[invoiceId] || [];

    if (!invoice) {
        return (
            <section className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Invoice not found</h3>
                <p className="text-sm text-slate-400">The invoice could not be located.</p>
                <button
                    onClick={() => navigate('/accounting/receivables')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to receivables
                </button>
            </section>
        );
    }

    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const tax = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * (line.taxRate / 100)), 0);
    const total = subtotal + tax;

    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{invoice.id}</p>
                    <h3 className="text-2xl font-semibold">{invoice.customer}</h3>
                    <p className="text-sm text-slate-400">Issued {invoice.date} • Due {invoice.due}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAllocateReceipt(invoice.id)}
                        className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    >
                        Allocate receipt
                    </button>
                    <button
                        onClick={() => navigate('/accounting/receivables')}
                        className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h4 className="text-lg font-semibold">Invoice lines</h4>
                <div className="mt-4 space-y-3 text-sm">
                    {lines.map((line) => (
                        <div key={line.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="font-medium">{line.description}</p>
                            <p className="text-xs text-slate-500">Qty {line.quantity} • MWK {line.unitPrice.toLocaleString()}</p>
                            <p className="mt-2 text-xs text-slate-400">VAT {line.taxRate}%</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 border-t border-slate-800 pt-4 text-sm text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>MWK {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>VAT</span>
                        <span>MWK {Math.round(tax).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-slate-100">
                        <span>Total</span>
                        <span>MWK {Math.round(total).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InvoiceDetail;
