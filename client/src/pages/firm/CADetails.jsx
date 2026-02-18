import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import {
    FaArrowLeft, FaUserTie, FaEnvelope, FaPhone,
    FaUsers, FaCalendarCheck, FaChartLine, FaCheckCircle
} from 'react-icons/fa';
import clsx from 'clsx';

const CADetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ca, setCa] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCA = async () => {
        try {
            const { data } = await api.get(`/firm/cas/${id}`);
            if (data.success) {
                setCa(data.data);
            }
        } catch (error) {
            console.error("Error fetching CA details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCA();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-page font-body">Loading CA details...</div>;
    if (!ca) return <div className="min-h-screen flex items-center justify-center bg-surface-page font-body text-danger-600">CA not found</div>;

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
                            <h1 className="text-sm font-bold uppercase tracking-wide text-neutral-800">{ca.name}</h1>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{ca.caProfile?.isAdmin ? 'Senior Partner' : 'Associate CA'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className={clsx(
                            "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border flex items-center gap-1.5",
                            ca.isActive ? "bg-success-50 text-success-700 border-success-100" : "bg-neutral-50 text-neutral-500 border-neutral-100"
                        )}>
                            <span className={clsx("w-1.5 h-1.5 rounded-full", ca.isActive ? "bg-success-500" : "bg-neutral-400")} />
                            {ca.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-8 rounded-2xl shadow-card border border-neutral-100 text-center">
                                <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
                                    {ca.name?.charAt(0)}
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800">{ca.name}</h2>
                                <p className="text-sm text-neutral-500 mb-6">{ca.email}</p>

                                <div className="space-y-3 text-left border-t border-neutral-50 pt-6">
                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                        <FaEnvelope className="text-neutral-300" />
                                        <span>{ca.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                        <FaPhone className="text-neutral-300" />
                                        <span>{ca.phone || 'No phone added'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white">
                                <h3 className="text-xs font-bold opacity-75 uppercase tracking-widest mb-4">Performance Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                        <div>
                                            <p className="text-[10px] font-bold opacity-60 uppercase">Assigned Clients</p>
                                            <p className="text-2xl font-black">{ca.assignedClients?.length || 0}</p>
                                        </div>
                                        <FaUsers size={24} className="opacity-20 mb-1" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold opacity-60 uppercase">Last Activity</p>
                                            <p className="text-xs font-bold uppercase">{ca.lastLogin ? new Date(ca.lastLogin).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                        <FaChartLine size={24} className="opacity-20 mb-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden flex flex-col h-full">
                                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                                    <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaUsers className="text-primary-500" /> Assigned Portfolio
                                    </h3>
                                    <span className="text-[10px] font-bold text-neutral-400 bg-white px-2 py-1 rounded border border-neutral-200 shadow-sm">
                                        {ca.assignedClients?.length || 0} CLIENTS
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {ca.assignedClients?.length > 0 ? (
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-100">
                                                <tr>
                                                    <th className="px-6 py-3">Business Name</th>
                                                    <th className="px-6 py-3">Legal Name</th>
                                                    <th className="px-6 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {ca.assignedClients.map((client) => (
                                                    <tr key={client._id} className="hover:bg-neutral-50 transition-colors group cursor-pointer" onClick={() => navigate(`/firm/clients/${client._id}`)}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-neutral-800 text-sm group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                                                {client.clientProfile?.businessName}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{client.clientProfile?.gstin}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-neutral-600">{client.name}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-xs text-primary-500 font-black uppercase tracking-widest hover:text-primary-700 transition opacity-0 group-hover:opacity-100">
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-20 text-center">
                                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mx-auto mb-4">
                                                <FaUsers size={32} />
                                            </div>
                                            <h4 className="font-bold text-neutral-800">No Clients Assigned</h4>
                                            <p className="text-neutral-500 text-sm max-w-xs mx-auto mt-1">This CA currently has no clients in their portfolio. Use the Client Management tab to assign some.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CADetails;
