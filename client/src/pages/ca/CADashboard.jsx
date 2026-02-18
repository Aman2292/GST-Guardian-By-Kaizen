import { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import useClients from '../../hooks/useClients';
import ClientList from '../../components/ca/ClientList';
import AddClientModal from '../../components/ca/AddClientModal';
import DeadlineList from '../../components/ca/DeadlineList';
import Sidebar from '../../components/shared/Sidebar';
import DocumentList from '../../components/shared/DocumentList'; // Import DocumentList

const CADashboard = () => {
    // Removed unused user
    const { logout } = useAuth();
    const { clients, loading, refreshClients } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({
        clientCount: 0,
        pendingDeadlines: 0,
        pendingVerification: 0,
        aiAudited: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/ca/stats');
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 sidebar-content">

                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h1 className="text-xl font-bold font-heading text-neutral-800">Overview</h1>

                    <div className="flex items-center gap-4">
                        {/* Search Bar Placeholder */}
                        <div className="hidden md:flex items-center px-3 py-1.5 bg-neutral-100 rounded-lg border border-transparent focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                            <span className="text-neutral-400 text-sm">⌘K</span>
                            <input type="text" placeholder="Search..." className="bg-transparent border-none text-sm ml-2 focus:ring-0 w-48 placeholder-neutral-400" />
                        </div>

                        {/* User Profile Hook */}
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs border border-primary-200">
                            CA
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Total Clients</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold font-heading text-neutral-900">{stats.clientCount || clients.length}</span>
                                <span className="text-success-500 text-sm font-medium bg-success-50 px-2 py-0.5 rounded-full">+2 this week</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Pending Deadlines</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold font-heading text-neutral-900">{stats.pendingDeadlines}</span>
                                <span className="text-warning-500 text-sm font-medium bg-warning-50 px-2 py-0.5 rounded-full">Due soon</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 card-hover">
                            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Pending Verification</h3>
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold font-heading text-neutral-900">{stats.pendingVerification}</span>
                                <span className="text-primary-500 text-sm font-medium bg-primary-50 px-2 py-0.5 rounded-full">Latest</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Column: Clients & Documents */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Clients Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold font-heading">Recent Clients</h2>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                        + Add New Client
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="h-48 rounded-xl bg-neutral-100 animate-pulse flex items-center justify-center text-neutral-400">Loading details...</div>
                                ) : (
                                    <ClientList clients={clients} onAddClick={() => setIsModalOpen(true)} />
                                )}
                            </div>

                            {/* Recent Documents Section */}
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-4">Latest Documents</h2>
                                <DocumentList />
                            </div>
                        </div>

                        {/* Side Column: Deadlines */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-bold font-heading mb-6">Upcoming Support</h2>
                            <DeadlineList />
                        </div>
                    </div>
                </main>
            </div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientAdded={refreshClients}
            />
        </div>
    );
};

export default CADashboard;
