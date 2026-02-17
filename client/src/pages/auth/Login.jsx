import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-page p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-heading text-neutral-900 mb-2">Welcome Back</h2>
                    <p className="text-neutral-500">Sign in as <b>CA</b> or <b>Client</b></p>
                </div>

                {error && (
                    <div className="bg-danger-50 border border-danger-500/20 text-danger-700 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="name@firm.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary py-3 text-base shadow-lg shadow-primary-500/30"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-neutral-100 pt-6">
                    <p className="text-sm text-neutral-500">
                        Don't have an account?{' '}
                        <Link to="/register-firm" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                            Register Firm
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
