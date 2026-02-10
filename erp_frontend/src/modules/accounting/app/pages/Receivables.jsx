import React from 'react';

const Receivables = ({ customers, invoices, receipts, onViewInvoice, onViewStatement, onRecordReceipt }) => {
    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold">Accounts Receivable</h3>
                    <p className="text-xs text-slate-400">Manage customers, invoices, and receipts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
                        New invoice
                    </button>
                    <button
                        onClick={onRecordReceipt}
                        className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                    >
                        Record receipt
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h4 className="text-lg font-semibold">Customers</h4>
                    <div className="mt-4 space-y-3 text-sm">
                        {customers.map((customer) => (
                            <div key={customer.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-xs text-slate-500">{customer.email}</p>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className={`rounded-full px-2 py-1 ${
                                        customer.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                        {customer.status}
                                    </span>
                                    <span className="text-slate-200">MWK {customer.balance.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => onViewStatement(customer.id)}
                                    className="mt-3 text-xs text-amber-300"
                                >
                                    View statement
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h4 className="text-lg font-semibold">Open invoices</h4>
                    <div className="mt-4 space-y-3 text-sm">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{invoice.customer}</p>
                                    <span className={`text-xs ${
                                        invoice.status === 'overdue' ? 'text-rose-300' : 'text-amber-300'
                                    }`}>
                                        {invoice.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{invoice.id} • Due {invoice.due}</p>
                                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                                    <span>MWK {invoice.amount.toLocaleString()}</span>
                                    <button onClick={() => onViewInvoice(invoice.id)} className="text-amber-300">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h4 className="text-lg font-semibold">Recent receipts</h4>
                    <div className="mt-4 space-y-3 text-sm">
                        {receipts.map((receipt) => (
                            <div key={receipt.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{receipt.customer}</p>
                                    <span className="text-xs text-emerald-300">MWK {receipt.amount.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-slate-500">{receipt.date} • {receipt.method}</p>
                                <p className="mt-2 text-xs text-slate-400">Applied to {receipt.appliedTo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Receivables;
