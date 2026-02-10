import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerStatement = ({ customers, statements }) => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const customer = customers.find((item) => item.id === customerId);
    const statement = statements[customerId] || [];

    if (!customer) {
        return (
            <section className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Customer not found</h3>
                <button
                    onClick={() => navigate('/accounting/receivables')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to receivables
                </button>
            </section>
        );
    }

    const balance = statement.reduce((sum, row) => sum + row.amount, 0);

    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Customer statement</p>
                    <h3 className="text-2xl font-semibold">{customer.name}</h3>
                    <p className="text-sm text-slate-400">{customer.email}</p>
                </div>
                <button
                    onClick={() => navigate('/accounting/receivables')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back
                </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h4 className="text-lg font-semibold">Statement activity</h4>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Reference</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statement.map((row) => (
                                <tr key={row.id} className="border-b border-slate-800 last:border-none">
                                    <td className="px-4 py-3 text-slate-400">{row.date}</td>
                                    <td className="px-4 py-3 text-slate-200">{row.type}</td>
                                    <td className="px-4 py-3 text-slate-400">{row.reference}</td>
                                    <td className={`px-4 py-3 text-right ${row.amount < 0 ? 'text-emerald-300' : 'text-slate-100'}`}>
                                        MWK {Math.abs(row.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                    <span>Closing balance</span>
                    <span className="text-lg font-semibold text-slate-100">MWK {balance.toLocaleString()}</span>
                </div>
            </div>
        </section>
    );
};

export default CustomerStatement;
