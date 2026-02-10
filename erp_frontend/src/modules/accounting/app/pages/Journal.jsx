import React from 'react';

const Journal = ({ entries, accounts, onAddEntry }) => {
    return (
        <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Journal Entries</h3>
                <button
                    onClick={onAddEntry}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Add entry
                </button>
            </div>
            <div className="space-y-3">
                {entries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.reference}</p>
                                <h4 className="text-lg font-semibold">{entry.description}</h4>
                            </div>
                            <div className="text-right text-sm text-slate-300">
                                <p>{entry.date}</p>
                                <p>{entry.id}</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {entry.lines.map((line, index) => {
                                const accountId = line.accountId || line.account_id;
                                const account = accounts.find((acc) => acc.id === accountId);
                                return (
                                    <div key={`${entry.id}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <p className="text-slate-400 text-xs">{account?.code || '---'}</p>
                                        <p className="text-sm font-medium">{account?.name || 'Unknown account'}</p>
                                        <p className="mt-2 text-xs text-slate-500">{line.memo || line.description || 'No memo'}</p>
                                        <div className="mt-3 flex justify-between text-xs">
                                            <span className="text-emerald-300">Dr {line.debit || 0}</span>
                                            <span className="text-rose-300">Cr {line.credit || 0}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Journal;
