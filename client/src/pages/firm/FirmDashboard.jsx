import useAuth from '../../hooks/useAuth';

const FirmDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background text-white">
            <nav className="bg-surface border-b border-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold font-mono text-primary">CA Command Center <span className="text-xs text-gray-400">Firm Admin</span></h1>
                <div className="flex items-center gap-4">
                    <span>{user?.name}</span>
                    <button onClick={logout} className="text-sm bg-red-500/10 text-red-500 px-3 py-1 rounded hover:bg-red-500/20">Logout</button>
                </div>
            </nav>

            <main className="p-8">
                <h2 className="text-3xl font-bold mb-6">Firm Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface p-6 rounded-lg border border-gray-800">
                        <h3 className="text-gray-400 mb-2">Total CAs</h3>
                        <p className="text-4xl font-mono animate-pulse">Loading...</p>
                    </div>
                    <div className="bg-surface p-6 rounded-lg border border-gray-800">
                        <h3 className="text-gray-400 mb-2">Total Clients</h3>
                        <p className="text-4xl font-mono">0</p>
                    </div>
                    <div className="bg-surface p-6 rounded-lg border border-gray-800">
                        <h3 className="text-gray-400 mb-2">Pending Deadlines</h3>
                        <p className="text-4xl font-mono text-warning">0</p>
                    </div>
                </div>

                <div className="mt-8 bg-surface p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-bold mb-4">CA Management</h3>
                    <p className="text-gray-500">Coming soon: List of CAs and Invite functionality.</p>
                </div>
            </main>
        </div>
    );
};

export default FirmDashboard;
