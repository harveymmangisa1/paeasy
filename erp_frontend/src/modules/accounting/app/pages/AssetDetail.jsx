import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AssetDetail = ({ assets }) => {
    const { assetId } = useParams();
    const navigate = useNavigate();
    const asset = assets.find((item) => item.id === assetId);

    if (!asset) {
        return (
            <section className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Asset not found</h3>
                <p className="text-sm text-slate-400">The asset registry entry could not be located.</p>
                <button
                    onClick={() => navigate('/accounting/assets')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to registry
                </button>
            </section>
        );
    }

    return (
        <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{asset.tag}</p>
                    <h3 className="text-2xl font-semibold">{asset.name}</h3>
                    <p className="text-sm text-slate-400">{asset.category} • {asset.location}</p>
                </div>
                <button
                    onClick={() => navigate('/accounting/assets')}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800"
                >
                    Back to registry
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h4 className="text-lg font-semibold">Asset summary</h4>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-xs text-slate-500">Acquisition date</p>
                            <p className="text-slate-200">{asset.acquisitionDate}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-xs text-slate-500">Cost</p>
                            <p className="text-slate-200">${asset.cost.toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-xs text-slate-500">Custodian</p>
                            <p className="text-slate-200">{asset.custodian}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-xs text-slate-500">Status</p>
                            <p className="text-slate-200 capitalize">{asset.status}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h5 className="text-sm font-semibold text-slate-200">Depreciation schedule</h5>
                        <div className="mt-3 h-32 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
                            Depreciation schedule placeholder
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                    <h4 className="text-lg font-semibold">Lifecycle actions</h4>
                    <p className="text-sm text-slate-400">Use these controls to manage the asset lifecycle.</p>
                    <button className="w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-200 hover:bg-slate-800">
                        Transfer asset
                    </button>
                    <button className="w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-200 hover:bg-slate-800">
                        Schedule maintenance
                    </button>
                    <button className="w-full rounded-xl border border-rose-500/40 py-3 text-sm text-rose-200 hover:bg-rose-500/10">
                        Retire asset
                    </button>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                        <p className="text-slate-200 font-semibold">Audit log</p>
                        <ul className="mt-3 space-y-2">
                            <li>2026-01-14 • Maintenance completed</li>
                            <li>2025-09-01 • Location updated to {asset.location}</li>
                            <li>2024-06-15 • Asset registered</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AssetDetail;
