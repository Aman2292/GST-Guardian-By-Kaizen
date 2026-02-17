import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useClients from '../../hooks/useClients';
import ClientList from '../../components/ca/ClientList';
import AddClientModal from '../../components/ca/AddClientModal';
import DeadlineList from '../../components/ca/DeadlineList';

const CADashboard = () => {
    const { user, logout } = useAuth();
    const { clients, loading, refreshClients } = useClients(); // Use updated hook
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <nav className="bg-surface border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold font-mono text-primary flex items-center gap-2">
                    <span className="text-2xl">⚡</span> CA Command Center <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-800 rounded">CA Portal</span>
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold">{user?.name}</div>
                        <div className="text-xs text-gray-400">CA Member</div>
                    </div>
                    <button onClick={logout} className="text-sm border border-red-500/50 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/10 transition">Logout</button>
                </div>
            </nav>

            <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto w-full">
                {/* Left Column: Stats & Deadlines */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface p-5 rounded-lg border border-gray-800">
                            <h3 className="text-gray-400 text-sm">Total Clients</h3>
                            <p className="text-3xl font-mono mt-1">{clients.length}</p>
                        </div>
                        <div className="bg-surface p-5 rounded-lg border border-gray-800">
                            <h3 className="text-gray-400 text-sm">Pending Actions</h3>
                            <p className="text-3xl font-mono mt-1 text-warning">0</p>
                        </div>
                    </div>

                    <div className="h-[500px]">
                        <DeadlineList />
                    </div>
                </div>

                {/* Right Column: Client Management */}
                <div className="lg:col-span-2 h-[calc(100vh-140px)] min-h-[500px]">
                    {loading ? (
                        <div className="h-full bg-surface border border-gray-800 rounded-lg flex items-center justify-center text-gray-400">Loading Clients...</div>
                    ) : (
                        <ClientList clients={clients} onAddClick={() => setIsModalOpen(true)} />
                    )}
                </div>
            </main>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientAdded={refreshClients}
            />
        </div>
    );
};

export default CADashboard;
