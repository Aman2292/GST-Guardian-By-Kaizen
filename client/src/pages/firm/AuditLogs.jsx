import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import {
    FaHistory, FaFilter, FaDownload, FaUser, FaClock,
    FaFileUpload, FaEdit, FaTrash, FaCheckCircle
} from 'react-icons/fa';
import clsx from 'clsx';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userId: '',
        action: '',
        resource: ''
    });
    const [stats, setStats] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) queryParams.append(key, filters[key]);
            });

            const { data } = await api.get(`/audit/firm?${queryParams.toString()}`);
            if (data.success) {
                setLogs(data.data.logs);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/audit/stats?days=7');
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        fetchLogs();
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Endpoint'];
        const rows = logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.performedByName || log.performedBy?.name || 'Unknown',
            log.role,
            log.action,
            log.resource,
            log.endpoint
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        a.click();
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE': return <FaFileUpload className="text-success-500" />;
            case 'UPDATE': return <FaEdit className="text-primary-500" />;
            case 'DELETE': return <FaTrash className="text-danger-500" />;
            case 'VERIFY': return <FaCheckCircle className="text-indigo-500" />;
            default: return <FaHistory className="text-neutral-400" />;
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            firms: 'bg-purple-100 text-purple-700 border-purple-200',
            ca: 'bg-blue-100 text-blue-700 border-blue-200',
            client: 'bg-green-100 text-green-700 border-green-200'
        };
        return styles[role] || 'bg-neutral-100 text-neutral-700 border-neutral-200';
    };

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg">
                            <FaHistory size={16} />
                        </div>
                        <h1 className="text-xl font-bold font-heading text-neutral-800 tracking-tight">Audit Logs</h1>
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition shadow-lg"
                    >
                        <FaDownload /> Export CSV
                    </button>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Total Actions</h3>
                                <p className="text-3xl font-bold text-neutral-900">
                                    {stats.byAction.reduce((acc, s) => acc + s.count, 0)}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">{stats.period}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Most Active User</h3>
                                <p className="text-lg font-bold text-neutral-900">{stats.byUser[0]?.name || 'N/A'}</p>
                                <p className="text-xs text-neutral-500 mt-2">{stats.byUser[0]?.count || 0} actions</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Top Action</h3>
                                <p className="text-lg font-bold text-neutral-900">{stats.byAction[0]?._id || 'N/A'}</p>
                                <p className="text-xs text-neutral-500 mt-2">{stats.byAction[0]?.count || 0} times</p>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-primary-500" />
                            <h2 className="text-lg font-bold font-heading text-neutral-800">Filters</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="End Date"
                            />
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="VERIFY">Verify</option>
                                <option value="UPLOAD">Upload</option>
                            </select>
                            <select
                                value={filters.resource}
                                onChange={(e) => handleFilterChange('resource', e.target.value)}
                                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Resources</option>
                                <option value="Document">Document</option>
                                <option value="Client">Client</option>
                                <option value="Deadline">Deadline</option>
                                <option value="CA">CA</option>
                            </select>
                            <button
                                onClick={applyFilters}
                                className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition shadow-sm"
                            >
                                Apply
                            </button>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                        <h2 className="text-lg font-bold font-heading text-neutral-800 mb-6">Activity Timeline</h2>

                        {loading ? (
                            <div className="p-20 text-center text-neutral-400">Loading audit logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-20 text-center text-neutral-500">No logs found for the selected filters.</div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log, idx) => (
                                    <div key={log._id || idx} className="flex gap-4 p-4 hover:bg-neutral-50 rounded-xl transition border border-neutral-100">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                                {getActionIcon(log.action)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-neutral-800 text-sm">{log.performedByName || log.performedBy?.name || 'Unknown'}</span>
                                                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", getRoleBadge(log.role))}>
                                                    {log.role}
                                                </span>
                                                <span className="text-xs text-neutral-500">performed</span>
                                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-bold uppercase">{log.action}</span>
                                                <span className="text-xs text-neutral-500">on</span>
                                                <span className="text-xs font-bold text-neutral-700">{log.resource}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <FaClock /> {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                                <span className="font-mono">{log.endpoint}</span>
                                                <span>{log.ipAddress}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AuditLogs;
