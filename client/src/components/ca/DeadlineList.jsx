import { useState, useEffect } from 'react';
import api from '../../services/api';
import clsx from 'clsx';
import { FaCheck } from 'react-icons/fa';

const DeadlineList = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeadlines = async () => {
        try {
            const { data } = await api.get('/ca/deadlines');
            if (data.success) {
                setDeadlines(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markFiled = async (id) => {
        try {
            const { data } = await api.patch(`/ca/deadlines/${id}/file`);
            if (data.success) {
                // Update local state
                setDeadlines(deadlines.map(d => d._id === id ? { ...d, status: 'filed' } : d));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to mark as filed');
        }
    };

    useEffect(() => {
        fetchDeadlines();
    }, []);

    const getStatusColor = (dueDate, status) => {
        if (status === 'filed') return 'text-green-500 border-green-500/30 bg-green-500/10';

        const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 'text-red-500 border-red-500/30 bg-red-500/10'; // Overdue
        if (daysLeft <= 3) return 'text-red-400 border-red-400/30 bg-red-400/10'; // Critical
        if (daysLeft <= 7) return 'text-warning border-warning/30 bg-warning/10'; // Warning
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10'; // Safe
    };

    if (loading) return <div className="p-4 text-gray-400 text-sm">Loading deadlines...</div>;

    return (
        <div className="bg-surface rounded-lg border border-gray-800 flex flex-col h-full">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Upcoming Compliance</h2>
            </div>
            <div className="overflow-y-auto max-h-[400px] p-4 space-y-3">
                {deadlines.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No upcoming deadlines</div>
                ) : (
                    deadlines.map(d => (
                        <div key={d._id} className="flex justify-between items-center p-3 rounded bg-background border border-gray-700">
                            <div>
                                <div className="font-bold text-white text-sm">{d.type} <span className="text-xs font-normal text-gray-400">({new Date(d.dueDate).toLocaleDateString()})</span></div>
                                <div className="text-xs text-gray-500">{d.clientId?.clientProfile?.businessName || 'Unknown Client'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={clsx("px-2 py-1 text-xs rounded border", getStatusColor(d.dueDate, d.status))}>
                                    {d.status === 'filed' ? 'Filed' : (
                                        Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) < 0 ? 'Overdue' :
                                            `${Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                                    )}
                                </span>
                                {d.status !== 'filed' && (
                                    <button
                                        onClick={() => markFiled(d._id)}
                                        className="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                        title="Mark as Filed"
                                    >
                                        <FaCheck size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeadlineList;
