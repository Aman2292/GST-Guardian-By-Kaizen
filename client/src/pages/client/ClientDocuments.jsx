import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import DocumentUpload from '../../components/shared/DocumentUpload';
import DocumentList from '../../components/shared/DocumentList';
import GapAlertWidget from '../../components/client/GapAlertWidget';
import api from '../../services/api';
import {
    FaFileUpload, FaShieldAlt, FaChartPie, FaInbox,
    FaCheckCircle, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';
import clsx from 'clsx';

const CentralVault = () => {
    const { user } = useAuth();
    const [refreshDocs, setRefreshDocs] = useState(0);
    const [stats, setStats] = useState(null);

    const fetchStats = async () => {
        try {
            const { data } = await api.get(`/vault/stats/${user?.userId}`);
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Stats failed:", err);
        }
    };

    useEffect(() => {
        if (user) fetchStats();
    }, [user, refreshDocs]);

    const handleUploadComplete = () => {
        setRefreshDocs(prev => prev + 1);
        fetchStats();
    };

    const docCount = stats?.byCategory?.reduce((acc, c) => acc + c.count, 0) || 0;

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <FaShieldAlt size={16} />
                        </div>
                        <h1 className="text-xl font-bold font-heading text-neutral-800 tracking-tight">Central Vault</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-8 border-r border-neutral-100 pr-8">
                            <div className="text-right">
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Vault Capacity</p>
                                <p className="text-sm font-bold text-neutral-800">{docCount} / ∞ <span className="text-[10px] text-primary-500 ml-1">UNLIMITED</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Audit Status</p>
                                <p className="text-sm font-bold text-success-600 flex items-center gap-1.5 justify-end">
                                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                                    AI-PROTECTED
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-bold text-neutral-900 leading-none">{user?.name}</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-tighter">Gold Account</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-xl font-bold text-sm">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
                    {/* Top Alert Bar - Gap Detection */}
                    <GapAlertWidget clientId={user?.userId} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <FaChartPie className="text-primary-500" /> Organization Stats
                                </h3>
                                <div className="space-y-4">
                                    {stats?.byCategory?.map(cat => (
                                        <div key={cat._id} className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-xl transition cursor-default">
                                            <span className="text-sm font-medium text-neutral-600">{cat._id}</span>
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded text-[10px] font-black">{cat.count}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-neutral-50">
                                        <div className="flex justify-between items-center p-3 bg-primary-50 rounded-xl">
                                            <span className="text-sm font-bold text-primary-700">Total Assets</span>
                                            <span className="text-sm font-black text-primary-800">{docCount} Files</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-900 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <FaCheckCircle className="text-success-400" />
                                        Bank Feed Active
                                    </h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                                        AI is matching your bank debits to purchase invoices in real-time to maximize ITC claims.
                                    </p>
                                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary-500 h-full w-[85%] rounded-full shadow-lg shadow-primary-500/50" />
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest">85% Documentation Reconciled</p>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl group-hover:bg-primary-600/20 transition-all duration-700" />
                            </div>
                        </div>

                        {/* Inventory Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold font-heading text-neutral-800 flex items-center gap-2">
                                        <FaFileUpload className="text-primary-500" /> Quick Deposit
                                    </h2>
                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest bg-white border border-neutral-100 px-2 py-1 rounded shadow-sm">
                                        Encrypted End-to-End
                                    </span>
                                </div>
                                <div className="bg-white p-2 rounded-2xl border-2 border-dashed border-neutral-100 shadow-sm hover:border-primary-100 transition-colors">
                                    <DocumentUpload clientId={user?.userId} onUploadComplete={handleUploadComplete} />
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-3 flex items-center gap-1.5 px-2">
                                    <FaInfoCircle className="text-primary-300" />
                                    Accepted formats: PDF, JPG, PNG. AI processing takes ~5 seconds.
                                </p>
                            </section>

                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold font-heading text-neutral-800 flex items-center gap-2">
                                        <FaInbox className="text-primary-500" /> Vault Inventory
                                    </h2>
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                                        <div className="h-2 w-2 rounded-full bg-success-500" />
                                    </div>
                                </div>
                                <DocumentList clientId={user?.userId} refreshTrigger={refreshDocs} />
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CentralVault;
