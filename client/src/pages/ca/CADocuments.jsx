import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import { FaFileInvoice, FaChevronDown, FaChevronUp, FaFilter, FaSearch, FaFileAlt, FaFilePdf, FaImage, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import clsx from 'clsx';

const CADocuments = () => {
    const [groupedDocs, setGroupedDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClients, setExpandedClients] = useState(new Set());

    // Filters
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGroupedDocuments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);

            const { data } = await api.get(`/ca/documents/grouped?${params.toString()}`);
            if (data.success) {
                setGroupedDocs(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupedDocuments();
    }, [selectedMonth, selectedYear]);

    const toggleClient = (clientId) => {
        const newExpanded = new Set(expandedClients);
        if (newExpanded.has(clientId)) {
            newExpanded.delete(clientId);
        } else {
            newExpanded.add(clientId);
        }
        setExpandedClients(newExpanded);
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return <FaFilePdf className="text-danger-500" />;
        if (fileType?.includes('image')) return <FaImage className="text-primary-500" />;
        return <FaFileAlt className="text-neutral-400" />;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'verified_l2': { bg: 'bg-success-100', text: 'text-success-700', label: 'Verified' },
            'verified_l1': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'CA Verified' },
            'processed': { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Pending' },
            'flagged': { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Flagged' }
        };
        const badge = badges[status] || { bg: 'bg-neutral-100', text: 'text-neutral-600', label: status };
        return (
            <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold uppercase', badge.bg, badge.text)}>
                {badge.label}
            </span>
        );
    };

    const filteredGroups = groupedDocs.filter(group => {
        if (!searchQuery) return true;
        const businessName = group.client?.businessName?.toLowerCase() || '';
        const gstin = group.client?.gstin?.toLowerCase() || '';
        return businessName.includes(searchQuery.toLowerCase()) || gstin.includes(searchQuery.toLowerCase());
    });

    const totalDocuments = filteredGroups.reduce((sum, g) => sum + g.documentCount, 0);

    const months = [
        { value: '', label: 'All Months' },
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
                        <FaFileInvoice className="text-primary-500" /> Central Vault
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Total Clients</div>
                            <div className="text-3xl font-black text-neutral-900">{filteredGroups.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Total Documents</div>
                            <div className="text-3xl font-black text-primary-600">{totalDocuments}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Avg per Client</div>
                            <div className="text-3xl font-black text-neutral-900">
                                {filteredGroups.length > 0 ? Math.round(totalDocuments / filteredGroups.length) : 0}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <FaFilter className="text-neutral-400" />
                            <div className="flex-1 grid grid-cols-3 gap-4">
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
                                    <label className="block text-xs font-bold text-neutral-600 mb-1">Search Client</label>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
                                        <input
                                            type="text"
                                            placeholder="Business name or GSTIN..."
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
                        <div className="text-center py-20 text-neutral-400">Loading documents...</div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-neutral-100">
                            <FaFileInvoice className="mx-auto text-6xl text-neutral-200 mb-4" />
                            <p className="text-neutral-500">No documents found for the selected filters.</p>
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
                                                <div className="text-right">
                                                    <div className="text-xs text-neutral-500 font-bold uppercase">Documents</div>
                                                    <div className="text-2xl font-black text-primary-600">{group.documentCount}</div>
                                                </div>
                                                {isExpanded ? <FaChevronUp className="text-neutral-400" /> : <FaChevronDown className="text-neutral-400" />}
                                            </div>
                                        </button>

                                        {/* Expanded Document List */}
                                        {isExpanded && (
                                            <div className="border-t border-neutral-100 bg-neutral-50/50">
                                                <div className="p-4 space-y-2">
                                                    {group.documents.map(doc => (
                                                        <div key={doc._id} className="bg-white p-3 rounded-lg border border-neutral-100 flex items-center justify-between hover:shadow-sm transition">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-sm text-neutral-800">{doc.smartLabel || doc.originalName}</div>
                                                                    <div className="text-xs text-neutral-400 mt-0.5">
                                                                        {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {doc.complianceFlags?.length > 0 && (
                                                                    <FaExclamationTriangle className="text-warning-600" title={`${doc.complianceFlags.length} compliance issues`} />
                                                                )}
                                                                {getStatusBadge(doc.status)}
                                                            </div>
                                                        </div>
                                                    ))}
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

export default CADocuments;
