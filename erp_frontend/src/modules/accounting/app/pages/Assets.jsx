import React from 'react';

const Assets = ({ assets, onOpenAsset }) => {
    return (
        <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Asset Registry</h3>
                    <p className="text-xs text-slate-400">Track fixed assets, ownership, and lifecycle status.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
                    Add asset
                </button>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left">Tag</th>
                            <th className="px-5 py-3 text-left">Asset</th>
                            <th className="px-5 py-3 text-left">Category</th>
                            <th className="px-5 py-3 text-left">Location</th>
                            <th className="px-5 py-3 text-left">Custodian</th>
                            <th className="px-5 py-3 text-right">Cost</th>
                            <th className="px-5 py-3 text-right">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id} className="border-b border-slate-800 last:border-none">
                                <td className="px-5 py-4 font-mono text-slate-300">{asset.tag}</td>
                                <td className="px-5 py-4">
                                    <p className="text-slate-200">{asset.name}</p>
                                    <p className="text-xs text-slate-500">Acquired {asset.acquisitionDate}</p>
                                </td>
                                <td className="px-5 py-4 text-slate-400">{asset.category}</td>
                                <td className="px-5 py-4 text-slate-400">{asset.location}</td>
                                <td className="px-5 py-4 text-slate-400">{asset.custodian}</td>
                                <td className="px-5 py-4 text-right text-slate-200">${asset.cost.toLocaleString()}</td>
                                <td className="px-5 py-4 text-right">
                                    <span className={`rounded-full px-2 py-1 text-xs ${
                                        asset.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <button
                                        onClick={() => onOpenAsset(asset.id)}
                                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Assets;
