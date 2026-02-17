import { useState, useEffect } from 'react';
import api from '../../services/api';
import clsx from 'clsx';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

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
                setDeadlines(deadlines.map(d => d._id === id ? { ...d, status: 'filed' } : d));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDeadlines();
    }, []);

    const getStatusStyles = (dueDate, status) => {
        if (status === 'filed') return {
            badge: 'bg-success-50 text-success-700 border-success-200',
            border: 'border-l-4 border-l-success-500'
        };

        const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return {
            badge: 'bg-danger-50 text-danger-700 border-danger-200',
            border: 'border-l-4 border-l-danger-500'
        };

        if (daysLeft <= 3) return {
            badge: 'bg-danger-50 text-danger-700 border-danger-200',
            border: 'border-l-4 border-l-danger-400'
        };

        if (daysLeft <= 7) return {
            badge: 'bg-warning-50 text-warning-700 border-warning-200',
            border: 'border-l-4 border-l-warning-400'
        };

        return {
            badge: 'bg-primary-50 text-primary-700 border-primary-200',
            border: 'border-l-4 border-l-primary-400'
        };
    };

    if (loading) return <div className="p-4 text-center text-neutral-400 text-sm">Checking calendars...</div>;

    return (
        <div className="space-y-4">
            {deadlines.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl border border-neutral-100 text-neutral-500">
                    <p>No upcoming deadlines</p>
                </div>
            ) : (
                deadlines.slice(0, 5).map(d => {
                    const styles = getStatusStyles(d.dueDate, d.status);
                    const daysLeft = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

                    return (
                        <div key={d._id} className={clsx("bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex justify-between items-start transition hover:shadow-md", styles.border)}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-neutral-800 text-sm">{d.type}</h4>
                                    <span className={clsx("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border", styles.badge)}>
                                        {d.status === 'filed' ? 'Filed' : (daysLeft < 0 ? 'Overdue' : `${daysLeft} Days Left`)}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500 font-medium">{d.clientId?.clientProfile?.businessName}</p>
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
                                    <FaClock className="text-neutral-300" />
                                    <span>Due: {new Date(d.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {d.status !== 'filed' && (
                                <button
                                    onClick={() => markFiled(d._id)}
                                    className="text-neutral-300 hover:text-success-600 transition p-1 hover:bg-success-50 rounded-full"
                                    title="Mark Filed"
                                >
                                    <FaCheckCircle size={20} />
                                </button>
                            )}
                        </div>
                    )
                })
            )}

            {deadlines.length > 5 && (
                <button className="w-full py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition">
                    View All Deadlines
                </button>
            )}
        </div>
    );
};

export default DeadlineList;
