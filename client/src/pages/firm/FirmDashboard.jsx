import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import CAList from '../../components/firm/CAList';
import AssignCAModal from '../../components/firm/AssignCAModal';
import api from '../../services/api';
import { FaUserPlus, FaUsers, FaChartPie, FaCalendarAlt, FaUserTie, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import DocumentList from '../../components/shared/DocumentList';
import clsx from 'clsx';

const FirmDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [stats, setStats] = useState({ caCount: 0, clientCount: 0, pendingDeadlines: 0, pendingFinalApproval: 0 });
    const [cas, setCas] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [verificationQueue, setVerificationQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Always fetch stats
            const statsRes = await api.get('/firm/stats');
            if (statsRes.data.success) setStats(statsRes.data.data);

            if (activeTab === 'overview') {
                const casRes = await api.get('/firm/cas');
                if (casRes.data.success) setCas(casRes.data.data);
            }
            else if (activeTab === 'deadlines') {
                const deadlinesRes = await api.get('/firm/deadlines');
                if (deadlinesRes.data.success) setDeadlines(deadlinesRes.data.data);
            }
            else if (activeTab === 'verification') {
                const docsRes = await api.get('/documents'); // Reuse getDocuments to show pending for firm
                // We'll filter for verified_l1 on frontend or add a query param
                if (docsRes.data.success) {
                    setVerificationQueue(docsRes.data.data.filter(d => d.status === 'verified_l1'));
                }
            }

        } catch (error) {
            console.error("Error fetching data firm:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaChartPie },
        { id: 'verification', label: 'Verification Queue', icon: FaCheckCircle },
        { id: 'deadlines', label: 'All Deadlines', icon: FaCalendarAlt },
    ];

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800">Firm Command Center</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-bold text-neutral-900">{user?.name}</div>
                            <div className="text-xs text-neutral-500">Firm Admin</div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs border border-primary-200">
                            FA
                        </div>
                    </div>
                </nav>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 border-b border-neutral-200">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-primary-600 text-primary-600"
                                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                                )}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-64 text-neutral-400">Loading...</div>
                        ) : (
                            <>
                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover text-center">
                                                <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">Total Staff</h3>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-4xl font-black font-heading text-neutral-900 leading-none">{stats.caCount}</p>
                                                    <span className="text-[9px] font-bold text-primary-500 uppercase">Active CAs</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover text-center">
                                                <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">Clients</h3>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-4xl font-black font-heading text-neutral-900 leading-none">{stats.clientCount}</p>
                                                    <span className="text-[9px] font-bold text-success-500 uppercase">Total Base</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover text-center">
                                                <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">Pending Docs</h3>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-4xl font-black font-heading text-neutral-900 leading-none">{stats.pendingFinalApproval}</p>
                                                    <span className="text-[9px] font-bold text-indigo-500 uppercase">Awaiting Sign-off</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover text-center">
                                                <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">Deadlines</h3>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-4xl font-black font-heading text-neutral-900 leading-none">{stats.pendingDeadlines}</p>
                                                    <span className="text-[9px] font-bold text-danger-500 uppercase">Firm Wide</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold font-heading">CA Management</h3>
                                                <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                                                    <FaUserPlus /> Invite CA
                                                </button>
                                            </div>
                                            <CAList cas={cas} />
                                        </div>
                                    </div>
                                )}

                                {/* VERIFICATION QUEUE TAB */}
                                {activeTab === 'verification' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg">
                                                <FaShieldAlt />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-primary-900 uppercase tracking-wider">Final Approval Queue</h4>
                                                <p className="text-xs text-primary-600 font-medium">These documents have been verified by CAs and require your final Partner sign-off for compliance.</p>
                                            </div>
                                        </div>
                                        <DocumentList statusFilter="verified_l1" />
                                    </div>
                                )}

                                {/* DEADLINES TAB */}
                                {activeTab === 'deadlines' && (
                                    <div className="bg-white rounded-xl shadow-card border border-neutral-100 overflow-hidden animate-fade-in">
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold border-b border-neutral-200">
                                                <tr>
                                                    <th className="p-4">Deadline Type</th>
                                                    <th className="p-4">Client</th>
                                                    <th className="p-4">Due Date</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4">Assigned CA</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {deadlines.map(deadline => {
                                                    const isOverdue = new Date(deadline.dueDate) < new Date() && deadline.status !== 'filed';
                                                    return (
                                                        <tr
                                                            key={deadline._id}
                                                            className="hover:bg-neutral-50 transition cursor-pointer group"
                                                            onClick={() => navigate(`/firm/clients/${deadline.clientId?._id}`)}
                                                        >
                                                            <td className="p-4 font-medium text-neutral-800 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{deadline.type}</td>
                                                            <td className="p-4">
                                                                <div className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{deadline.clientId?.clientProfile?.businessName || 'Unknown'}</div>
                                                                <div className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase">{deadline.clientId?.clientProfile?.gstin}</div>
                                                            </td>
                                                            <td className={clsx("p-4 font-mono text-sm", isOverdue ? "text-danger-600 font-bold" : "text-neutral-600")}>
                                                                {new Date(deadline.dueDate).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={clsx(
                                                                    "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                                                                    deadline.status === 'filed' ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"
                                                                )}>
                                                                    {deadline.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-xs text-neutral-500 font-bold">
                                                                {deadline.clientId?.clientProfile?.assignedCAId?.name || '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {deadlines.length === 0 && <div className="p-8 text-center text-neutral-400">No deadlines found.</div>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FirmDashboard;
