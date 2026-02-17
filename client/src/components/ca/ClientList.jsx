import { FaPlus, FaSearch } from 'react-icons/fa';

const ClientList = ({ clients, onAddClick }) => {
    return (
        <div className="bg-surface rounded-lg border border-gray-800 flex flex-col h-full">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">My Clients</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-background border border-gray-700 text-white pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-primary w-48"
                        />
                    </div>
                    <button
                        onClick={onAddClick}
                        className="bg-primary text-background font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-cyan-400"
                    >
                        <FaPlus /> Add Client
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 text-sm uppercas">
                        <tr>
                            <th className="px-6 py-3">Business Name</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">GSTIN</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {clients.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No clients found. Add one to get started.</td></tr>
                        ) : (
                            clients.map(client => (
                                <tr key={client._id} className="hover:bg-gray-800/30 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{client.clientProfile?.businessName}</div>
                                        <div className="text-xs text-gray-500">{client.clientProfile?.businessType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-300">{client.name}</div>
                                        <div className="text-xs text-gray-500">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-400">
                                        {client.clientProfile?.gstin || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary hover:underline text-sm">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientList;
