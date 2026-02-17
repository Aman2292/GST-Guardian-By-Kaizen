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
            // Redirect based on role (handled in App.jsx or here)
            // For now, simple redirect
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-lg border border-gray-800">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">CA Command Center</h2>
                <h3 className="text-xl text-gray-400 mb-6 text-center">Sign In</h3>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border border-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-background font-bold py-2 px-4 rounded hover:bg-cyan-400 transition duration-200"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/register-firm" className="text-sm text-primary hover:underline">
                        Register new CA Firm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
