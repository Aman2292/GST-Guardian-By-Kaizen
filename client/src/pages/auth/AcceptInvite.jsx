import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firmId: '',
        caId: '', // Optional, for clients
        role: 'client', // Default, will change based on URL
        name: '',
        phone: '',
        businessName: '' // Only for clients
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const email = searchParams.get('email');
        const firmId = searchParams.get('firmId');
        const caId = searchParams.get('caId');
        const path = window.location.pathname;

        // Determine role from path
        let role = 'client';
        if (path.includes('/register/ca')) role = 'ca';

        setFormData(prev => ({
            ...prev,
            email: email || '',
            firmId: firmId || '',
            caId: caId || '',
            role
        }));
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await authService.acceptInvite(formData);
            if (data.success) {
                // Redirect to login or auto-login
                // For security, good practice to make them login manually first time
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-lg border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    Complete Registration ({formData.role === 'ca' ? 'CA' : 'Client'})
                </h2>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Email</label>
                        <input
                            type="text"
                            value={formData.email}
                            disabled
                            className="w-full bg-gray-800 border border-gray-700 text-gray-400 p-2 rounded cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {formData.role === 'client' && (
                        <div>
                            <input
                                name="businessName"
                                type="text"
                                required
                                className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="Business Name"
                                value={formData.businessName}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Set Password"
                            className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <input
                            name="phone"
                            type="text"
                            className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-background font-bold py-2 px-4 rounded hover:bg-cyan-400 transition duration-200"
                    >
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvite;
