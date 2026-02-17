import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import AssignCAModal from '../../components/firm/AssignCAModal';
import api from '../../services/api';
import { FaUsers, FaUserTie, FaSearch } from 'react-icons/fa';
import clsx from 'clsx';

const FirmClients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [cas, setCas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsRes, casRes] = await Promise.all([
                api.get('/firm/clients'),
                api.get('/firm/cas')
            ]);
            if (clientsRes.data.success) setClients(clientsRes.data.data);
            if (casRes.data.success) setCas(casRes.data.data);
        } catch (error) {
            console.error("Error fetching firm clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAssignModal = (client) => {
        setSelectedClient(client);
        setShowAssignModal(true);
    };

    const handleAssignSuccess = (clientId, updatedClient) => {
        setClients(clients.map(c => c._id === clientId ? updatedClient : c));
    };

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientProfile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientProfile?.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaUsers className="text-primary-500" /> Client Management
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100 mb-6">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by business name, owner or GSTIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-card border border-neutral-100 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center text-neutral-400">Loading clients...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold border-b border-neutral-200">
                                    <tr>
                                        <th className="p-4">Business Name</th>
                                        <th className="p-4">Contact Person</th>
                                        <th className="p-4">Assigned CA</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filteredClients.map(client => (
                                        <tr
                                            key={client._id}
                                            className="hover:bg-neutral-50 transition cursor-pointer group"
                                            onClick={() => navigate(`/firm/clients/${client._id}`)}
                                        >
                                            <td className="p-4">
                                                <div className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{client.clientProfile?.businessName}</div>
                                                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{client.clientProfile?.gstin}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium">{client.name}</div>
                                                <div className="text-xs text-neutral-500">{client.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {client.clientProfile?.assignedCAId ? (
                                                    <span className="flex items-center gap-2 text-primary-700 bg-primary-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-primary-100">
                                                        <FaUserTie className="text-primary-500" /> {client.clientProfile.assignedCAId.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400 text-xs italic bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => openAssignModal(client)}
                                                    className="text-xs text-primary-600 hover:text-primary-800 font-bold border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition shadow-sm bg-white"
                                                >
                                                    {client.clientProfile?.assignedCAId ? 'Change CA' : 'Assign CA'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && filteredClients.length === 0 && (
                            <div className="p-20 text-center">
                                <FaUsers className="mx-auto text-4xl text-neutral-200 mb-4" />
                                <p className="text-neutral-500">No clients found matching your search.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showAssignModal && selectedClient && (
                <AssignCAModal
                    client={selectedClient}
                    cas={cas}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssignSuccess}
                />
            )}
        </div>
    );
};

export default FirmClients;
