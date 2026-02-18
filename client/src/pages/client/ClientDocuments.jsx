import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import DocumentUpload from '../../components/shared/DocumentUpload';
import DocumentList from '../../components/shared/DocumentList';
import GapAlertWidget from '../../components/client/GapAlertWidget';
import SpendingAnalysisWidget from '../../components/client/SpendingAnalysisWidget';
import api from '../../services/api';
import {
    FaFileUpload, FaShieldAlt, FaChartPie, FaInbox,
    FaCheckCircle, FaExclamationCircle, FaInfoCircle,
    FaUniversity, FaUser, FaBriefcase, FaList
} from 'react-icons/fa';
import clsx from 'clsx';

const CentralVault = () => {
    const { user } = useAuth();
    const [refreshDocs, setRefreshDocs] = useState(0);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('bank'); // 'bank', 'personal', 'business', 'all'
    const [latestBankAnalysis, setLatestBankAnalysis] = useState(null);

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

    const fetchLatestAnalysis = async () => {
        try {
            // Fetch the most recent Bank Statement to show analysis
            const { data } = await api.get('/documents', {
                params: {
                    clientId: user?.userId,
                    category: 'Bank Statement',
                    limit: 1
                }
            });
            if (data.success && data.data && data.data.length > 0) {
                const doc = data.data[0];
                if (doc.analysisResult) {
                    setLatestBankAnalysis(doc.analysisResult);
                }
            }
        } catch (err) {
            console.error("Analysis fetch failed:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchLatestAnalysis();
        }
    }, [user, refreshDocs]);

    const handleUploadComplete = () => {
        setRefreshDocs(prev => prev + 1);
        fetchStats();
        // Also re-fetch analysis if we're in the bank tab
        if (activeTab === 'bank') fetchLatestAnalysis();
    };

    const docCount = stats?.byCategory?.reduce((acc, c) => acc + c.count, 0) || 0;

    const tabs = [
        { id: 'bank', label: 'Bank Connect', icon: FaUniversity, color: 'text-indigo-600', category: 'Bank Statement' },
        { id: 'personal', label: 'Personal Vault', icon: FaUser, color: 'text-emerald-600', category: 'Identity Proof' },
        { id: 'business', label: 'Business Vault', icon: FaBriefcase, color: 'text-blue-600', category: 'Business Proof,Sale Invoice,Purchase Invoice,GST Notice,Form 16' },
        { id: 'all', label: 'All Documents', icon: FaList, color: 'text-neutral-600', category: '' }
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
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

                    {/* GLOBAL UPLOAD ZONE */}
                    <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <FaFileUpload />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900">Global Upload Zone</h2>
                                <p className="text-sm text-neutral-500">
                                    Drop any document here. AI will automatically sort it.
                                </p>
                            </div>
                        </div>
                        <DocumentUpload
                            clientId={user?.userId}
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 border-b border-neutral-200 overflow-x-auto pb-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all relative",
                                    activeTab === tab.id
                                        ? "bg-white text-neutral-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-x border-neutral-200 z-10"
                                        : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                                )}
                            >
                                <tab.icon className={activeTab === tab.id ? tab.color : 'text-neutral-400'} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-neutral-200 shadow-sm p-6 -mt-9 z-0 relative">

                        {/* 1. BANK ANALYSIS WIDGET (Only on Bank Tab) */}
                        {activeTab === 'bank' && (
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold font-heading text-neutral-800">Financial Insights</h2>
                                        <p className="text-sm text-neutral-500">AI analysis of your latest bank statement</p>
                                    </div>
                                    {!latestBankAnalysis && <span className="text-xs text-neutral-400 italic">Upload a statement to see insights</span>}
                                </div>
                                <SpendingAnalysisWidget analysis={latestBankAnalysis} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* LEFT: Stats Only */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Stats for this category */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">
                                        {currentTab.label} Stats
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-600">Total Files</span>
                                        <span className="text-lg font-bold text-neutral-900">
                                            {activeTab === 'all'
                                                ? docCount
                                                : stats?.byCategory?.find(c => c._id === currentTab.category)?.count || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Document List */}
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold font-heading text-neutral-800 flex items-center gap-2">
                                        <FaInbox className="text-primary-500" /> {currentTab.label} Inventory
                                    </h2>
                                </div>
                                <DocumentList
                                    clientId={user?.userId}
                                    category={currentTab.category}
                                    refreshTrigger={refreshDocs}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CentralVault;
