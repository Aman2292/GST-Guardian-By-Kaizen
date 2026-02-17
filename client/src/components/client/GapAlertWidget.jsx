import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaExclamationTriangle, FaSearch, FaArrowRight, FaUniversity } from 'react-icons/fa';
import clsx from 'clsx';

const GapAlertWidget = ({ clientId }) => {
    const [gapData, setGapData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchGaps = async () => {
        try {
            const { data } = await api.get(`/vault/gap-analysis/${clientId}`);
            if (data.success) {
                setGapData(data.data);
            }
        } catch (err) {
            console.error("Gap fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) fetchGaps();
    }, [clientId]);

    if (loading) return (
        <div className="animate-pulse bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
            <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-50 rounded"></div>
        </div>
    );

    if (!gapData || gapData.missingInvoicesCount === 0) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-1 rounded-2xl border border-amber-200 shadow-xl shadow-amber-500/10 group animate-fade-in">
            <div className="bg-white p-6 rounded-[14px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110 duration-500">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                            AI Gap Detection
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] uppercase font-black tracking-tighter rounded-full">Priority</span>
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            We found <span className="font-bold text-amber-700">{gapData.missingInvoicesCount} bank transactions</span> that lack supporting invoices.
                            Total potential ITC at risk: <span className="font-bold text-neutral-800">₹{Math.round(gapData.gaps.reduce((acc, g) => acc + (g.amount * 0.18), 0)).toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 transition active:scale-95 whitespace-nowrap group">
                    View Missing Bills
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Micro-list of gaps */}
            <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    <span>Recent Unmatched Debits</span>
                    <span className="flex items-center gap-1"><FaUniversity className="text-neutral-300" /> Bank Reconciliation</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-hidden relative">
                    {gapData.gaps.slice(0, 3).map((gap, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100 leading-tight">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-neutral-800 truncate pr-4">{gap.description}</p>
                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{gap.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-amber-700">₹{gap.amount.toLocaleString()}</p>
                                <p className="text-[9px] font-bold text-neutral-400 uppercase">Unfiled</p>
                            </div>
                        </div>
                    ))}
                    {/* Faded bottom if more than 3 */}
                    {gapData.gaps.length > 3 && (
                        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-orange-50 to-transparent pointer-events-none" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GapAlertWidget;
