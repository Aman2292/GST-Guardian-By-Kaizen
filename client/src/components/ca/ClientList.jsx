import { FaSearch, FaEllipsisH } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

const ClientList = ({ clients, onAddClick }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-card border border-neutral-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h2 className="text-lg font-bold font-heading text-neutral-800">All Clients</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by name, GSTIN..."
                            className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-neutral-100">
                        <tr>
                            <th className="px-6 py-4">Business Details</th>
                            <th className="px-6 py-4">Contact Person</th>
                            <th className="px-6 py-4">GSTIN</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {clients.length === 0 ? (
                            <tr><td colSpan="5" className="p-12 text-center text-neutral-400">No clients found. Add one to get started.</td></tr>
                        ) : (
                            clients.map(client => (
                                <tr
                                    key={client._id}
                                    onClick={() => navigate(`/ca/clients/${client._id}`)}
                                    className="hover:bg-neutral-50/80 transition group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-neutral-900">{client.clientProfile?.businessName}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5 px-2 py-0.5 bg-neutral-100 rounded inline-block">
                                            {client.clientProfile?.businessType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-neutral-900">{client.name}</div>
                                        <div className="text-xs text-neutral-500">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                            {client.clientProfile?.gstin || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-success-50 text-success-700 border border-success-500/10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-neutral-400 hover:text-primary-600 transition p-2 hover:bg-neutral-100 rounded-lg">
                                            <FaEllipsisH />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-500 bg-neutral-50/30">
                <span>Showing {clients.length} clients</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-neutral-200 rounded hover:bg-white disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 border border-neutral-200 rounded hover:bg-white disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default ClientList;
