import React from 'react';
import { Plus, Search } from 'lucide-react';

const Topbar = ({ search, onSearch, onNewEntry }) => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Independent module</p>
                <h2 className="text-3xl font-semibold text-white">Accounting</h2>
                <p className="text-sm text-slate-400 mt-1">Run this module standalone or bundle it with the full suite.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder="Search accounts, entries, vendors"
                        className="w-64 rounded-full bg-slate-900/70 border border-slate-800 py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                </div>
                <button
                    onClick={onNewEntry}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300"
                >
                    <Plus className="h-4 w-4" />
                    New journal entry
                </button>
            </div>
        </header>
    );
};

export default Topbar;
