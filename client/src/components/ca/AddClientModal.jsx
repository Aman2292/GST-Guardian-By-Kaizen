import { useState } from 'react';
import useClients from '../../hooks/useClients';
import { FaTimes } from 'react-icons/fa';

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        gstin: '',
        businessType: 'Proprietorship',
        address: '',
        pan: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // We can use the hook's addClient, but better to pass the function down or use a global context/store
    // For simplicity, let's redefine the API call or reuse the hook instance if possible.
    // Actually, we instantiated the hook in the parent (CADashboard/ClientList), so let's accept the function as prop
    // But standard pattern:
    const { addClient } = useClients(); // This creates a new instance, state is local. That's fine for the action.

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await addClient(formData);

        setLoading(false);
        if (result.success) {
            onClientAdded(); // Refresh parent list
            onClose();
            // Reset form
            setFormData({
                name: '', email: '', phone: '', businessName: '', gstin: '',
                businessType: 'Proprietorship', address: '', pan: ''
            });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Onboard New Client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">PAN Number</label>
                            <input name="pan" value={formData.pan} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-primary font-medium mb-3">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Business Name</label>
                                <input name="businessName" required value={formData.businessName} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">GSTIN</label>
                                <input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Business Type</label>
                                <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded">
                                    <option>Proprietorship</option>
                                    <option>Partnership</option>
                                    <option>LLP</option>
                                    <option>Pvt Ltd</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-background border border-gray-700 text-white p-2 rounded h-20"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-primary text-background font-bold px-6 py-2 rounded hover:bg-cyan-400">
                            {loading ? 'Adding...' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
