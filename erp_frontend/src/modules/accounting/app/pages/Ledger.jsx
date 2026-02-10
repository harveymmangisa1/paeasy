import React from 'react';

const Ledger = ({ lines, accounts }) => {
    return (
        <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">General Ledger</h3>
                <span className="text-xs text-slate-400">{lines.length} lines</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left">Date</th>
                            <th className="px-5 py-3 text-left">Account</th>
                            <th className="px-5 py-3 text-left">Description</th>
                            <th className="px-5 py-3 text-right">Debit</th>
                            <th className="px-5 py-3 text-right">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line, index) => {
                            const accountId = line.accountId || line.account_id || line.account;
                            const account = accounts.find((acc) => acc.id === accountId);
                            return (
                                <tr key={`${line.entryId}-${index}`} className="border-b border-slate-800 last:border-none">
                                    <td className="px-5 py-4 text-slate-400">{line.date}</td>
                                    <td className="px-5 py-4">
                                        <p className="text-slate-200">{line.account_name || account?.name || 'Unknown account'}</p>
                                        <p className="text-xs text-slate-500">{line.reference}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">{line.description}</td>
                                    <td className="px-5 py-4 text-right text-emerald-300">{line.debit || '-'}</td>
                                    <td className="px-5 py-4 text-right text-rose-300">{line.credit || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Ledger;
