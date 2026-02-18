import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaFilter, FaSearch, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import clsx from 'clsx';

const CADeadlines = () => {
    const [groupedDeadlines, setGroupedDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClients, setExpandedClients] = useState(new Set());

    // Filters
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('pendingCount');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGroupedDeadlines = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);
            if (statusFilter) params.append('status', statusFilter);
            if (sortBy) params.append('sortBy', sortBy);

            const { data } = await api.get(`/ca/deadlines/grouped?${params.toString()}`);
            if (data.success) {
                setGroupedDeadlines(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupedDeadlines();
    }, [selectedMonth, selectedYear, statusFilter, sortBy]);

    const toggleClient = (clientId) => {
        const newExpanded = new Set(expandedClients);
        if (newExpanded.has(clientId)) {
            newExpanded.delete(clientId);
        } else {
            newExpanded.add(clientId);
        }
        setExpandedClients(newExpanded);
    };

    const getUrgencyStyles = (dueDate, status) => {
        if (status === 'filed') return {
            textColor: 'text-success-600',
            bgColor: 'bg-success-50',
            borderColor: 'border-l-success-500',
            badge: 'Filed'
        };

        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return {
            textColor: 'text-danger-600 font-bold',
            bgColor: 'bg-danger-50',
            borderColor: 'border-l-danger-500',
            badge: 'Overdue',
            animate: true
        };

        if (diffDays <= 5) return {
            textColor: 'text-warning-600 font-bold',
            bgColor: 'bg-warning-50',
            borderColor: 'border-l-warning-400',
            badge: `${diffDays} Day${diffDays !== 1 ? 's' : ''} Left`
        };

        return {
            textColor: 'text-success-600',
            bgColor: 'bg-success-50',
            borderColor: 'border-l-success-500',
            badge: `${diffDays} Days Left`
        };
    };

    const getPriorityBadge = (overdueCount, urgentCount) => {
        if (overdueCount > 0) {
            return <span className="px-2 py-1 bg-danger-100 text-danger-700 text-xs font-bold rounded-full">🔴 {overdueCount} Overdue</span>;
        }
        if (urgentCount > 0) {
            return <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs font-bold rounded-full">🟡 {urgentCount} Urgent</span>;
        }
        return <span className="px-2 py-1 bg-success-100 text-success-700 text-xs font-bold rounded-full">🟢 All Safe</span>;
    };

    const filteredGroups = groupedDeadlines.filter(group => {
        if (!searchQuery) return true;
        const businessName = group.client?.businessName?.toLowerCase() || '';
        const gstin = group.client?.gstin?.toLowerCase() || '';
        return businessName.includes(searchQuery.toLowerCase()) || gstin.includes(searchQuery.toLowerCase());
    });

    const totalPending = filteredGroups.reduce((sum, g) => sum + g.pendingCount, 0);
    const totalOverdue = filteredGroups.reduce((sum, g) => sum + g.overdueCount, 0);

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const years = [2024, 2025, 2026];

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaCalendarAlt className="text-primary-500" /> Deadlines by Client
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Total Clients</div>
                            <div className="text-3xl font-black text-neutral-900">{filteredGroups.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Pending</div>
                            <div className="text-3xl font-black text-warning-600">{totalPending}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Overdue</div>
                            <div className="text-3xl font-black text-danger-600">{totalOverdue}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Completion Rate</div>
                            <div className="text-3xl font-black text-success-600">
                                {filteredGroups.reduce((sum, g) => sum + g.totalDeadlines, 0) > 0
                                    ? Math.round(((filteredGroups.reduce((sum, g) => sum + g.totalDeadlines, 0) - totalPending) / filteredGroups.reduce((sum, g) => sum + g.totalDeadlines, 0)) * 100)
                                    : 0}%
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <FaFilter className="text-neutral-400" />
                            <div className="flex-1 grid grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Month</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="filed">Filed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="pendingCount">Most Pending</option>
                                        <option value="overdueCount">Most Overdue</option>
                                        <option value="totalDeadlines">Total Deadlines</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Search Client</label>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Groups */}
                    {loading ? (
                        <div className="text-center py-20 text-neutral-400">Loading deadlines...</div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-neutral-100">
                            <FaCalendarAlt className="mx-auto text-6xl text-neutral-200 mb-4" />
                            <p className="text-neutral-500">No deadlines found for the selected filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredGroups.map(group => {
                                const isExpanded = expandedClients.has(group.client?._id);
                                return (
                                    <div key={group._id} className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                                        {/* Client Header */}
                                        <button
                                            onClick={() => toggleClient(group.client?._id)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-primary-700 font-bold text-sm">
                                                        {group.client?.businessName?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-neutral-900">{group.client?.businessName || 'Unknown Client'}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">{group.client?.gstin || 'No GSTIN'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {getPriorityBadge(group.overdueCount, group.urgentCount)}
                                                <div className="text-right">
                                                    <div className="text-xs text-neutral-500 font-bold uppercase">Pending</div>
                                                    <div className="text-2xl font-black text-warning-600">{group.pendingCount}</div>
                                                </div>
                                                {isExpanded ? <FaChevronUp className="text-neutral-400" /> : <FaChevronDown className="text-neutral-400" />}
                                            </div>
                                        </button>

                                        {/* Expanded Deadline List */}
                                        {isExpanded && (
                                            <div className="border-t border-neutral-100 bg-neutral-50/50">
                                                <div className="p-4 space-y-2">
                                                    {group.deadlines.map(deadline => {
                                                        const urgency = getUrgencyStyles(deadline.dueDate, deadline.status);
                                                        return (
                                                            <div key={deadline._id} className={clsx(
                                                                "bg-white p-3 rounded-lg border-l-4 flex items-center justify-between hover:shadow-sm transition",
                                                                urgency.borderColor
                                                            )}>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-sm text-neutral-800">{deadline.type}</div>
                                                                    <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                                                                        <FaClock className={urgency.animate ? "animate-pulse" : ""} />
                                                                        Due: {new Date(deadline.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                                <div className={clsx(
                                                                    "px-2 py-1 rounded-full text-xs font-bold",
                                                                    urgency.bgColor,
                                                                    urgency.textColor
                                                                )}>
                                                                    {urgency.badge}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CADeadlines;
