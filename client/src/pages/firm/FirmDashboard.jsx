import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import CAList from '../../components/firm/CAList';
import api from '../../services/api';
import { FaUserPlus } from 'react-icons/fa';

const FirmDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ caCount: 0, clientCount: 0, pendingDeadlines: 0 });
    const [cas, setCas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, casRes] = await Promise.all([
                    api.get('/firm/stats'),
                    api.get('/firm/cas')
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
                if (casRes.data.success) {
                    setCas(casRes.data.data);
                }
            } catch (error) {
                console.error("Error fetching firm dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800">Firm Overview</h1>
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

                <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Total CAs</h3>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-bold font-heading text-neutral-900">{loading ? '-' : stats.caCount}</p>
                                <span className="text-primary-500 text-xs font-medium bg-primary-50 px-2 py-1 rounded-full">Active Staff</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Total Clients</h3>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-bold font-heading text-neutral-900">{loading ? '-' : stats.clientCount}</p>
                                <span className="text-success-500 text-xs font-medium bg-success-50 px-2 py-1 rounded-full">Onboarded</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Pending Deadlines</h3>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-bold font-heading text-neutral-900">{loading ? '-' : stats.pendingDeadlines}</p>
                                <span className="text-warning-600 text-xs font-medium bg-warning-50 px-2 py-1 rounded-full">Across Firm</span>
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

                        {loading ? (
                            <div className="h-48 flex items-center justify-center text-neutral-400">Loading CAs...</div>
                        ) : (
                            <CAList cas={cas} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FirmDashboard;
