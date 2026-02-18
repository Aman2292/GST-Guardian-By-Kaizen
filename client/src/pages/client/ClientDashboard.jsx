import { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import SpendingAnalysisWidget from '../../components/client/SpendingAnalysisWidget';
import ComplianceUploadModal from '../../components/client/ComplianceUploadModal';
import {
    FaCalendarAlt, FaShieldAlt, FaClock, FaFileUpload, FaCheckCircle,
    FaExclamationTriangle, FaChartPie, FaBell, FaArrowRight, FaMagic,
    FaFire, FaExclamationCircle, FaTimesCircle, FaChevronDown
} from 'react-icons/fa';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

// ─── Dynamic Island Component ───────────────────────────────────────────────
const DynamicIsland = ({ urgentDeadlines, onDeadlineClick }) => {
    const [expanded, setExpanded] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setExpanded(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (urgentDeadlines.length === 0) return null;

    const mostUrgent = urgentDeadlines[0];
    const daysLeft = Math.ceil((new Date(mostUrgent.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <div className="flex justify-center mb-4 z-50 relative" ref={ref}>
            <div
                style={{
                    width: expanded ? '440px' : '300px',
                    borderRadius: expanded ? '20px' : '999px',
                    transition: 'width 420ms cubic-bezier(0.34,1.2,0.64,1), border-radius 420ms cubic-bezier(0.34,1.2,0.64,1)',
                }}
                className="bg-neutral-900 text-white shadow-2xl shadow-neutral-900/40 cursor-pointer overflow-hidden"
                onClick={() => setExpanded(v => !v)}
            >
                {/* ── Collapsed Pill ── */}
                <div
                    style={{
                        opacity: expanded ? 0 : 1,
                        transform: expanded ? 'translateY(-6px) scale(0.97)' : 'translateY(0) scale(1)',
                        transition: 'opacity 200ms ease, transform 200ms ease',
                        pointerEvents: expanded ? 'none' : 'auto',
                        position: expanded ? 'absolute' : 'relative',
                        width: '100%',
                    }}
                    className="flex items-center gap-3 px-5 py-3"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-bold truncate flex-1">
                        ⚠️ {daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d left`} — {mostUrgent.title}
                    </span>
                    {urgentDeadlines.length > 1 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                            +{urgentDeadlines.length - 1}
                        </span>
                    )}
                    <FaChevronDown
                        style={{ transition: 'transform 300ms ease' }}
                        className="text-neutral-400 text-xs flex-shrink-0"
                    />
                </div>

                {/* ── Expanded Panel ── */}
                <div
                    style={{
                        maxHeight: expanded ? '420px' : '0px',
                        opacity: expanded ? 1 : 0,
                        transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
                        transition: 'max-height 420ms cubic-bezier(0.34,1.2,0.64,1), opacity 250ms ease 80ms, transform 300ms ease 60ms',
                        overflow: 'hidden',
                    }}
                >
                    <div className="px-5 pt-5 pb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                    Urgent Deadlines
                                </span>
                            </div>
                            <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-500/30">
                                {urgentDeadlines.length} ALERT{urgentDeadlines.length > 1 ? 'S' : ''}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5">
                            {urgentDeadlines.map((d, i) => {
                                const days = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div
                                        key={d._id}
                                        style={{ transitionDelay: expanded ? `${80 + i * 40}ms` : '0ms' }}
                                        className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition-colors cursor-pointer group"
                                        onClick={(e) => { e.stopPropagation(); onDeadlineClick(d); }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full flex-shrink-0",
                                                days <= 0 ? "bg-red-500" : days <= 2 ? "bg-orange-500" : "bg-yellow-400"
                                            )} />
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none">{d.title}</p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                                    {days <= 0 ? 'OVERDUE' : `${days} day${days !== 1 ? 's' : ''} left`}
                                                    {' · '}
                                                    {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                            Upload <FaArrowRight className="text-[8px]" />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-[10px] text-neutral-600 mt-3">
                            Click outside to dismiss · Click item to upload
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const ClientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deadlines, setDeadlines] = useState([]);
    const [stats, setStats] = useState(null);
    const [latestBankAnalysis, setLatestBankAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState(null);
    const [smartAlerts, setSmartAlerts] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deadlinesRes, statsRes, docsRes] = await Promise.all([
                api.get('/client/my-deadlines'),
                api.get(`/vault/stats/${user?.userId}`),
                api.get('/documents', { params: { clientId: user?.userId, category: 'Bank Statement', limit: 1 } })
            ]);
            if (deadlinesRes.data.success) setDeadlines(deadlinesRes.data.data);
            if (statsRes.data.success) setStats(statsRes.data.data);
            if (docsRes.data.success && docsRes.data.data.length > 0) {
                const doc = docsRes.data.data[0];
                if (doc.analysisResult) setLatestBankAnalysis(doc.analysisResult);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    useEffect(() => {
        const alerts = [];
        const idProofs = stats?.byCategory?.find(c => c._id === 'Identity Proof')?.count || 0;
        const panCards = stats?.byCategory?.find(c => c._id === 'PAN Card')?.count || 0;
        const aadharCards = stats?.byCategory?.find(c => c._id === 'Aadhar Card')?.count || 0;
        const totalKyc = idProofs + panCards + aadharCards;

        if (totalKyc < 2) {
            alerts.push({
                id: 'kyc-pending',
                title: 'KYC Documents Pending',
                message: 'AI detected missing Aadhar or PAN card in your Personal Vault.',
                action: 'Upload Now',
                link: '/client/documents',
                type: 'danger'
            });
        }
        if (!latestBankAnalysis) {
            const currentMonth = new Date().toLocaleString('default', { month: 'long' });
            alerts.push({
                id: 'bank-statement',
                title: `${currentMonth} Bank Statement Missing`,
                message: 'Upload your latest statement for AI expense analysis.',
                action: 'Upload',
                link: '/client/documents',
                type: 'warning'
            });
        }
        setSmartAlerts(alerts);
    }, [stats, latestBankAnalysis]);

    const openUploadModal = (deadline) => {
        setSelectedDeadline(deadline);
        setShowUploadModal(true);
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        fetchData();
    };

    const now = new Date();
    const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const urgentDeadlines = sortedDeadlines.filter(d => {
        if (d.status === 'filed') return false;
        const daysLeft = Math.ceil((new Date(d.dueDate) - now) / (1000 * 60 * 60 * 24));
        return daysLeft <= 5;
    });

    const getDaysLeft = (dueDate) => Math.ceil((new Date(dueDate) - now) / (1000 * 60 * 60 * 24));

    const getUrgencyStyle = (deadline) => {
        if (deadline.status === 'filed') return { bar: 'bg-success-500', badge: 'bg-success-50 text-success-700 border-success-100', card: 'border-neutral-100 bg-neutral-50/50 opacity-70' };
        const days = getDaysLeft(deadline.dueDate);
        if (days <= 0) return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-100', card: 'border-red-200 bg-red-50/30 shadow-red-100' };
        if (days <= 2) return { bar: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-100', card: 'border-orange-200 bg-orange-50/20' };
        if (days <= 5) return { bar: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-100', card: 'border-yellow-200 bg-yellow-50/10' };
        return { bar: 'bg-neutral-300', badge: 'bg-neutral-50 text-neutral-600 border-neutral-100', card: 'border-neutral-200 bg-white' };
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
                {/* ── Slim Header ─────────────────────────────────────── */}
                <header className="h-14 bg-white border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <FaShieldAlt className="text-white text-xs" />
                        </div>
                        <span className="font-bold text-neutral-800">Client Hub</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <FaBell className="text-neutral-400 text-base hover:text-indigo-600 transition cursor-pointer" />
                            {smartAlerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />}
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-sm font-bold text-neutral-900 leading-none">{user?.name}</div>
                                <div className="text-[10px] text-neutral-400 mt-0.5">{user?.clientProfile?.businessName || 'My Business'}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Slim Welcome Strip ──────────────────────────────── */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm">
                            Welcome back, {user?.name?.split(' ')[0]} 👋
                        </span>
                        <span className="text-indigo-200 text-xs">·</span>
                        <span className="text-indigo-100 text-xs">
                            Compliance score: <span className="font-bold text-green-300">Good</span> · AI has analyzed your recent uploads
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/client/documents')}
                        className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 transition flex items-center gap-1.5"
                    >
                        <FaFileUpload className="text-[10px]" /> Upload Documents
                    </button>
                </div>

                <main className="p-6 max-w-7xl mx-auto space-y-5 pb-20">

                    {/* ── Dynamic Island Notch ────────────────────────── */}
                    <DynamicIsland urgentDeadlines={urgentDeadlines} onDeadlineClick={openUploadModal} />

                    {/* ── AI Action Items (Top Priority) ──────────────── */}
                    {smartAlerts.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FaMagic className="text-indigo-400" /> AI Action Items
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {smartAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => navigate(alert.link)}
                                        className={clsx(
                                            "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all group relative overflow-hidden",
                                            alert.type === 'danger'
                                                ? 'bg-red-50 border-red-200 hover:border-red-300'
                                                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg",
                                            alert.type === 'danger' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'
                                        )}>
                                            {alert.type === 'danger' ? <FaTimesCircle /> : <FaExclamationTriangle />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={clsx("font-bold text-sm", alert.type === 'danger' ? 'text-red-800' : 'text-amber-800')}>
                                                {alert.title}
                                            </h4>
                                            <p className="text-xs text-neutral-500 mt-0.5 truncate">{alert.message}</p>
                                        </div>
                                        <div className={clsx(
                                            "text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0 transition",
                                            alert.type === 'danger'
                                                ? 'bg-red-500 text-white group-hover:bg-red-600'
                                                : 'bg-amber-500 text-white group-hover:bg-amber-600'
                                        )}>
                                            {alert.action} <FaArrowRight className="text-[9px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Monthly Expenses Insights ───────────────────── */}
                    {latestBankAnalysis ? (
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                                <FaChartPie className="text-indigo-500 text-sm" />
                                <h2 className="font-bold text-sm text-neutral-900">Monthly Expenses</h2>
                                <span className="ml-auto text-[10px] text-neutral-400">AI-powered analysis</span>
                            </div>
                            <div className="p-4">
                                <SpendingAnalysisWidget analysis={latestBankAnalysis} />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0">
                                <FaChartPie className="text-neutral-300 text-lg" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-neutral-700 text-sm">No Expense Analysis Yet</p>
                                <p className="text-xs text-neutral-400 mt-0.5">Upload a Bank Statement to unlock AI expense insights.</p>
                            </div>
                            <button onClick={() => navigate('/client/documents')} className="text-indigo-600 font-bold text-xs hover:underline flex-shrink-0">
                                Upload →
                            </button>
                        </div>
                    )}

                    {/* ── Main Content Grid ───────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── Compliance Timeline (Main Focus) ────────── */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <FaClock className="text-indigo-600 text-sm" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 text-sm">Compliance Timeline</h2>
                                        <p className="text-[10px] text-neutral-400">Sorted by urgency · Alerts from 5 days out</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {urgentDeadlines.length > 0 && (
                                        <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <FaFire className="text-red-500" /> {urgentDeadlines.length} Urgent
                                        </span>
                                    )}
                                    <span className="bg-neutral-50 text-neutral-500 border border-neutral-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                        {sortedDeadlines.filter(d => d.status !== 'filed').length} Pending
                                    </span>
                                </div>
                            </div>

                            {/* Timeline Items */}
                            <div className="divide-y divide-neutral-50">
                                {loading ? (
                                    <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
                                ) : sortedDeadlines.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <FaCheckCircle className="text-success-400 text-3xl mx-auto mb-3" />
                                        <p className="font-bold text-neutral-700">All Clear!</p>
                                        <p className="text-sm text-neutral-400 mt-1">No upcoming deadlines.</p>
                                    </div>
                                ) : (
                                    sortedDeadlines.map((deadline) => {
                                        const isFiled = deadline.status === 'filed';
                                        const daysLeft = getDaysLeft(deadline.dueDate);
                                        const style = getUrgencyStyle(deadline);
                                        const dueDate = new Date(deadline.dueDate);
                                        const isUrgent = !isFiled && daysLeft <= 5;

                                        return (
                                            <div
                                                key={deadline._id}
                                                className={clsx(
                                                    "flex items-center gap-4 px-6 py-4 transition-all relative",
                                                    style.card,
                                                    isUrgent && "hover:bg-opacity-50"
                                                )}
                                            >
                                                {/* Urgency Bar */}
                                                <div className={clsx("absolute left-0 top-0 bottom-0 w-1", style.bar)} />

                                                {/* Date Badge */}
                                                <div className={clsx(
                                                    "min-w-[56px] text-center rounded-xl py-2 px-1 flex-shrink-0",
                                                    isFiled ? "bg-neutral-100" : isUrgent ? "bg-red-50" : "bg-indigo-50"
                                                )}>
                                                    <div className={clsx(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        isFiled ? "text-neutral-400" : isUrgent ? "text-red-400" : "text-indigo-400"
                                                    )}>
                                                        {dueDate.toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                    <div className={clsx(
                                                        "text-xl font-black leading-none mt-0.5",
                                                        isFiled ? "text-neutral-400" : isUrgent ? "text-red-700" : "text-indigo-700"
                                                    )}>
                                                        {dueDate.getDate()}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className={clsx("font-bold text-sm", isFiled ? "text-neutral-500" : "text-neutral-900")}>
                                                            {deadline.title}
                                                        </h3>
                                                        <span className={clsx("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide", style.badge)}>
                                                            {isFiled ? '✓ Filed' : daysLeft <= 0 ? 'Overdue' : daysLeft <= 5 ? `${daysLeft}d left` : 'Upcoming'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                                                        {deadline.description || 'Monthly compliance filing'}
                                                    </p>
                                                </div>

                                                {/* Action */}
                                                {!isFiled && (
                                                    <button
                                                        onClick={() => openUploadModal(deadline)}
                                                        className={clsx(
                                                            "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition",
                                                            isUrgent
                                                                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200"
                                                                : "bg-neutral-900 text-white hover:bg-black shadow-sm"
                                                        )}
                                                    >
                                                        <FaFileUpload className="text-[9px]" />
                                                        Upload
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ── Right Column ────────────────────────────── */}
                        <div className="space-y-5">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Vault Overview</p>
                                {[
                                    { label: 'Total Documents', value: stats?.byCategory?.reduce((a, c) => a + c.count, 0) || 0, color: 'text-indigo-600' },
                                    { label: 'Bank Statements', value: stats?.byCategory?.find(c => c._id === 'Bank Statement')?.count || 0, color: 'text-blue-600' },
                                    { label: 'KYC Documents', value: (stats?.byCategory?.find(c => c._id === 'Identity Proof')?.count || 0) + (stats?.byCategory?.find(c => c._id === 'PAN Card')?.count || 0) + (stats?.byCategory?.find(c => c._id === 'Aadhar Card')?.count || 0), color: 'text-emerald-600' },
                                    { label: 'Invoices', value: (stats?.byCategory?.find(c => c._id === 'Sale Invoice')?.count || 0) + (stats?.byCategory?.find(c => c._id === 'Purchase Invoice')?.count || 0), color: 'text-purple-600' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                        <span className="text-xs text-neutral-500">{item.label}</span>
                                        <span className={clsx("text-sm font-black", item.color)}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showUploadModal && (
                <ComplianceUploadModal
                    deadline={selectedDeadline}
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
};

export default ClientDashboard;
