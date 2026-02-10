import React from 'react';

const Accounts = ({ accounts }) => {
    return (
        <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Chart of Accounts</h3>
                <span className="text-xs text-slate-400">{accounts.length} accounts</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left">Code</th>
                            <th className="px-5 py-3 text-left">Account</th>
                            <th className="px-5 py-3 text-left">Type</th>
                            <th className="px-5 py-3 text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id} className="border-b border-slate-800 last:border-none">
                                <td className="px-5 py-4 font-mono text-slate-300">{account.code}</td>
                                <td className="px-5 py-4">{account.name}</td>
                                <td className="px-5 py-4 capitalize text-slate-400">{account.type}</td>
                                <td className="px-5 py-4 text-right text-slate-200">$--</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Accounts;
