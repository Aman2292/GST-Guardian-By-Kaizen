import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import DeadlineList from '../../components/ca/DeadlineList';
import DocumentList from '../../components/shared/DocumentList';
import DocumentUpload from '../../components/shared/DocumentUpload';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import {
    FaArrowLeft, FaUser, FaBuilding, FaPhone, FaEnvelope,
    FaFileContract, FaCalendarCheck, FaEdit, FaShieldAlt,
    FaHistory, FaExclamationCircle, FaCheckCircle
} from 'react-icons/fa';
import clsx from 'clsx';

const ClientDetails = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshDocs, setRefreshDocs] = useState(0);

    const fetchClient = async () => {
        try {
            const url = user?.role === 'firms'
                ? `/firm/clients/${id}`
                : `/ca/clients/${id}`;

            const { data } = await api.get(url);
            if (data.success) {
                setClient(data.data);
            }
        } catch (error) {
            console.error("Error fetching client:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchClient();
        }
    }, [id, user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-page font-body">Loading...</div>;
    if (!client) return <div className="min-h-screen flex items-center justify-center bg-surface-page font-body text-danger-600">Client not found</div>;

    const tabs = [
        { id: 'overview', label: 'Business Profile', icon: FaBuilding },
        { id: 'deadlines', label: 'Compliance & Pending', icon: FaCalendarCheck },
        { id: 'documents', label: 'Document Vault & Audit', icon: FaFileContract },
        { id: 'timeline', label: 'Audit Timeline', icon: FaHistory },
    ];

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />
            <div className="flex-1 sidebar-content">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition shadow-sm">
                            <FaArrowLeft size={12} />
                        </button>
                        <div className="border-l border-neutral-200 pl-4 h-8 flex flex-col justify-center">
                            <h1 className="text-sm font-bold uppercase tracking-wide text-neutral-800">{client.clientProfile?.businessName}</h1>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase">{client.clientProfile?.gstin}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-success-50 text-success-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-success-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" /> Compliance Active
                        </span>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-2xl shadow-card border border-neutral-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                <FaShieldAlt size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-neutral-400 font-bold">Health Score</div>
                                <div className="text-xl font-bold">98%</div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-card border border-neutral-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center text-warning-600 text-lg font-bold">
                                4
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-neutral-400 font-bold">Pending Docs</div>
                                <div className="text-lg font-bold">Action Req.</div>
                            </div>
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-r from-neutral-800 to-neutral-900 p-5 rounded-2xl shadow-card text-white flex justify-between items-center relative overflow-hidden">
                            <div className="z-10">
                                <div className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Quick Action</div>
                                <p className="text-sm text-neutral-300 font-medium">Verify pending GSTR-1 documents for Feb 2026.</p>
                            </div>
                            <FaFileContract className="absolute right-[-10px] bottom-[-10px] text-white/5 text-[100px]" />
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-neutral-100 flex p-1.5 gap-1 w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                        : "text-neutral-500 hover:bg-neutral-50"
                                )}
                            >
                                <tab.icon className={activeTab === tab.id ? "text-white" : "text-neutral-400"} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fade-in min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
                                            <FaBuilding className="text-primary-500" /> Business Information
                                        </h3>
                                        <button className="bg-neutral-50 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition border border-neutral-100 flex items-center gap-1.5 shadow-sm">
                                            <FaEdit /> Modify
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Business Name</p>
                                                <p className="font-bold text-neutral-800">{client.clientProfile?.businessName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">GSTIN</p>
                                                <p className="font-mono text-sm bg-neutral-50 px-2 py-1 rounded w-fit border border-neutral-100">{client.clientProfile?.gstin}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Business Type</p>
                                                <p className="font-bold text-neutral-800">{client.clientProfile?.businessType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">PAN Number</p>
                                                <p className="font-mono text-sm">{client.clientProfile?.pan || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-neutral-50">
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Registered Address</p>
                                        <p className="text-sm text-neutral-600 leading-relaxed mt-1">{client.clientProfile?.address || 'No address provided'}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100">
                                    <h3 className="font-bold text-lg text-neutral-800 mb-6 flex items-center gap-2">
                                        <FaUser className="text-primary-500" /> Primary Contact
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm border border-neutral-200 font-bold">
                                                {client.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-800 text-lg">{client.name}</p>
                                                <p className="text-xs text-neutral-500">Authorized Signatory</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <FaEnvelope className="text-neutral-300" />
                                                <span className="text-sm font-medium">{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FaPhone className="text-neutral-300" />
                                                <span className="text-sm font-medium">{client.phone || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'deadlines' && (
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
                                            <FaCalendarCheck className="text-primary-500" /> Pending Compliances
                                        </h3>
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Live Tracking</span>
                                    </div>
                                    <DeadlineList clientId={client._id} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100">
                                    <h3 className="font-bold text-lg text-neutral-800 mb-6 flex items-center gap-2">
                                        <FaFileContract className="text-primary-500" /> Add Audit Documents
                                    </h3>
                                    <DocumentUpload clientId={client._id} onUploadComplete={() => setRefreshDocs(prev => prev + 1)} />
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100">
                                    <h3 className="font-bold text-lg text-neutral-800 mb-6 flex items-center gap-2">
                                        <FaHistory className="text-primary-500" /> Compliance Document Vault
                                    </h3>
                                    <DocumentList clientId={client._id} refreshTrigger={refreshDocs} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="bg-white p-12 rounded-2xl shadow-card border border-neutral-100 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mb-6">
                                    <FaHistory size={40} />
                                </div>
                                <h3 className="font-bold text-xl text-neutral-800 mb-2">Audit Timeline View</h3>
                                <p className="text-neutral-500 text-sm max-w-sm mb-6">This feature is being enhanced to show a visual history of every compliance step taken for this client.</p>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className="text-primary-600 font-bold hover:underline py-2 px-4 bg-primary-50 rounded-lg text-sm border border-primary-100"
                                >
                                    Verify Documents Instead
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientDetails;
