import { useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import ClientList from '../../components/ca/ClientList';
import AddClientModal from '../../components/ca/AddClientModal';
import useClients from '../../hooks/useClients';
import { FaPlus, FaUsers } from 'react-icons/fa';

const CAClients = () => {
    const { clients, loading, refreshClients } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaUsers className="text-primary-500" /> Clients
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <p className="text-neutral-500">Manage all your clients from here.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <FaPlus /> Add Client
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-neutral-400">Loading clients...</div>
                    ) : (
                        <ClientList clients={clients} onAddClick={() => setIsModalOpen(true)} />
                    )}
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

export default CAClients;
