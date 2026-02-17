import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import DeadlineList from '../../components/ca/DeadlineList';
import DocumentList from '../../components/shared/DocumentList';
import DocumentUpload from '../../components/shared/DocumentUpload';
import api from '../../services/api';
import { FaArrowLeft, FaUser, FaBuilding, FaPhone, FaEnvelope, FaFileContract, FaCalendarCheck, FaEdit } from 'react-icons/fa';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshDocs, setRefreshDocs] = useState(0);

    useEffect(() => {
        fetchClient();
    }, [id]);

    const fetchClient = async () => {
        try {
            const { data } = await api.get(`/ca/clients/${id}`);
            if (data.success) {
                setClient(data.data);
            }
        } catch (error) {
            console.error("Error fetching client:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!client) {
        return <div className="min-h-screen flex items-center justify-center">Client not found</div>;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaUser },
        { id: 'deadlines', label: 'Deadlines', icon: FaCalendarCheck },
        { id: 'documents', label: 'Documents', icon: FaFileContract },
    ];

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-800 transition-colors">
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold font-heading text-neutral-800">{client.clientProfile?.businessName}</h1>
                            <p className="text-xs text-neutral-500">{client.name}</p>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto space-y-6">
                    {/* Tabs */}
                    <div className="border-b border-neutral-200 flex gap-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="animate-fade-in">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-neutral-800">Business Details</h3>
                                        <button className="text-primary-600 text-sm hover:underline flex items-center gap-1"><FaEdit /> Edit</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><FaBuilding size={14} /></div>
                                            <div>
                                                <p className="text-xs text-neutral-400">Business Name</p>
                                                <p className="font-medium">{client.clientProfile?.businessName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><FaFileContract size={14} /></div>
                                            <div>
                                                <p className="text-xs text-neutral-400">GSTIN</p>
                                                <p className="font-medium font-mono">{client.clientProfile?.gstin}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100">
                                    <h3 className="font-bold text-neutral-800 mb-4">Contact Info</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><FaUser size={14} /></div>
                                            <div>
                                                <p className="text-xs text-neutral-400">Contact Person</p>
                                                <p className="font-medium">{client.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><FaEnvelope size={14} /></div>
                                            <div>
                                                <p className="text-xs text-neutral-400">Email</p>
                                                <p className="font-medium">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><FaPhone size={14} /></div>
                                            <div>
                                                <p className="text-xs text-neutral-400">Phone</p>
                                                <p className="font-medium">{client.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'deadlines' && (
                            <div className="bg-white p-1 rounded-xl shadow-sm border border-neutral-100">
                                {/* DeadlineList needs refactor to accept clientId prop if we want to filter efficiently, 
                                     but currently it fetches own deadlines. Since CA fetches ALL deadlines, 
                                     we might need to filter manually here or update API.
                                     For now, showing strict deadlines component.
                                 */}
                                <div className="p-4 text-center text-neutral-500 italic">
                                    Listing deadlines...
                                </div>
                                <DeadlineList />
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="font-bold text-neutral-800 mb-4">Upload Document</h3>
                                    <DocumentUpload clientId={client._id} onUploadComplete={() => setRefreshDocs(prev => prev + 1)} />
                                </section>
                                <section>
                                    <h3 className="font-bold text-neutral-800 mb-4">Client Documents</h3>
                                    <DocumentList clientId={client._id} refreshTrigger={refreshDocs} />
                                </section>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientDetails;
