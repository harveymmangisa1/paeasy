import React, { useMemo } from 'react';
import { X } from 'lucide-react';

const EntryModal = ({
    open,
    accounts,
    entryForm,
    onChange,
    onLineChange,
    onAddLine,
    onRemoveLine,
    onClose,
    onSubmit,
}) => {
    const totals = useMemo(() => {
        return entryForm.lines.reduce(
            (acc, line) => {
                const debit = Number(line.debit) || 0;
                const credit = Number(line.credit) || 0;
                return { debit: acc.debit + debit, credit: acc.credit + credit };
            },
            { debit: 0, credit: 0 }
        );
    }, [entryForm.lines]);

    const isBalanced = totals.debit > 0 && totals.debit === totals.credit;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4 z-50">
            <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">New Journal Entry</h3>
                        <p className="text-xs text-slate-400">Debits must equal credits.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="date"
                            value={entryForm.date}
                            onChange={(event) => onChange('date', event.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                        />
                        <input
                            type="text"
                            value={entryForm.reference}
                            onChange={(event) => onChange('reference', event.target.value)}
                            placeholder="Reference"
                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                        />
                        <input
                            type="text"
                            value={entryForm.description}
                            onChange={(event) => onChange('description', event.target.value)}
                            placeholder="Description"
                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                        />
                    </div>
                    <div className="space-y-3">
                        {entryForm.lines.map((line, index) => (
                            <div key={`line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                <select
                                    value={line.accountId}
                                    onChange={(event) => onLineChange(index, 'accountId', event.target.value)}
                                    className="md:col-span-4 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                                >
                                    <option value="">Select account</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.code} - {account.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={line.memo}
                                    onChange={(event) => onLineChange(index, 'memo', event.target.value)}
                                    placeholder="Memo"
                                    className="md:col-span-4 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={line.debit}
                                    onChange={(event) => onLineChange(index, 'debit', event.target.value)}
                                    placeholder="Debit"
                                    className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={line.credit}
                                    onChange={(event) => onLineChange(index, 'credit', event.target.value)}
                                    placeholder="Credit"
                                    className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveLine(index)}
                                    className="md:col-span-12 text-xs text-rose-300 hover:text-rose-200"
                                >
                                    Remove line
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={onAddLine} className="text-xs text-amber-300">
                            + Add line
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-400">
                            Debits: {totals.debit.toFixed(2)} | Credits: {totals.credit.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isBalanced}
                                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                                    isBalanced ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                                }`}
                            >
                                Post entry
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
