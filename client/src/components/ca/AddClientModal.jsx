import { useState } from 'react';
import useClients from '../../hooks/useClients';
import { FaTimes, FaBuilding, FaUser } from 'react-icons/fa';

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
    const { addClient } = useClients();

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
            onClientAdded();
            onClose();
            setFormData({
                name: '', email: '', phone: '', businessName: '', gstin: '',
                businessType: 'Proprietorship', address: '', pan: ''
            });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                    <div>
                        <h2 className="text-xl font-bold font-heading text-neutral-900">Onboard New Client</h2>
                        <p className="text-sm text-neutral-500">Enter client details to generate compliance calendar</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition p-2 hover:bg-neutral-50 rounded-full">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">{error}</div>}

                    {/* Section: Personal Info */}
                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FaUser className="text-neutral-400" /> Primary Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                                <input name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="john@company.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">PAN Number</label>
                                <input name="pan" value={formData.pan} onChange={handleChange} className="input-field" placeholder="ABCDE1234F" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Section: Business Info */}
                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FaBuilding className="text-neutral-400" /> Business Entity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Name</label>
                                <input name="businessName" required value={formData.businessName} onChange={handleChange} className="input-field" placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">GSTIN</label>
                                <input name="gstin" value={formData.gstin} onChange={handleChange} className="input-field" placeholder="22AAAAA0000A1Z5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Business Type</label>
                                <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field cursor-pointer">
                                    <option>Proprietorship</option>
                                    <option>Partnership</option>
                                    <option>LLP</option>
                                    <option>Pvt Ltd</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Registered Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} className="input-field h-24 resize-none" placeholder="Enter full address"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Processing...' : 'Add Client & Generate Deadlines'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
