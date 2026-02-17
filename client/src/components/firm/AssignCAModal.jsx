import { useState } from 'react';
import api from '../../services/api';
import { FaTimes } from 'react-icons/fa';

const AssignCAModal = ({ client, cas, onClose, onAssign }) => {
    const [selectedCA, setSelectedCA] = useState(client?.clientProfile?.assignedCAId?._id || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCA) return;

        setLoading(true);
        try {
            const { data } = await api.put(`/firm/clients/${client._id}/assign-ca`, { caId: selectedCA });
            if (data.success) {
                onAssign(client._id, data.data); // data.data is the updated client object
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to assign CA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-neutral-100">
                    <h3 className="font-bold text-lg">Assign CA to Client</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
                        <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-neutral-600">
                            {client.clientProfile?.businessName}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Select CA</label>
                        <select
                            value={selectedCA}
                            onChange={(e) => setSelectedCA(e.target.value)}
                            className="w-full p-3 border border-neutral-300 rounded focus:ring-primary-500 focus:border-primary-500"
                            required
                        >
                            <option value="">-- Choose a CA --</option>
                            {cas.map(ca => (
                                <option key={ca._id} value={ca._id}>
                                    {ca.name} ({ca.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !selectedCA}
                            className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Assigning...' : 'Assign CA'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignCAModal;
