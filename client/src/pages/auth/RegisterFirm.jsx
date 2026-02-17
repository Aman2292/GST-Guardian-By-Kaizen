import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RegisterFirm = () => {
    const [formData, setFormData] = useState({
        firmName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        gstNumber: ''
    });
    const [error, setError] = useState('');
    const { registerFirm } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await registerFirm(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-page py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading text-neutral-900">
                        Register CA Firm
                    </h2>
                    <p className="mt-2 text-neutral-500">Create your firm's command center</p>
                </div>

                {error && (
                    <div className="bg-danger-50 border border-danger-500/20 text-danger-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Firm Name</label>
                            <input
                                name="firmName"
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. Sharma & Associates"
                                value={formData.firmName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="admin@firm.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone Number</label>
                                <input
                                    name="phone"
                                    type="text"
                                    className="input-field"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">GST Number <span className="text-neutral-400 font-normal">(Optional)</span></label>
                            <input
                                name="gstNumber"
                                type="text"
                                className="input-field"
                                placeholder="22AAAAA0000A1Z5"
                                value={formData.gstNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full btn-primary py-3 text-base shadow-lg shadow-primary-500/30"
                        >
                            Create Firm Account
                        </button>
                    </div>
                </form>
                <div className="text-center border-t border-neutral-100 pt-6">
                    <p className="text-sm text-neutral-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterFirm;
