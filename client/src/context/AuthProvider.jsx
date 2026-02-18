import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry? The interceptor handles strict 401, but simple check is good
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(JSON.parse(storedUser));
                } else {
                    logout();
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await authService.login({ email, password });

            if (data.success) {
                const { accessToken, refreshToken, ...userData } = data.data;

                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Store user info (minimal)
                const userToStore = {
                    userId: userData.userId,
                    firmId: userData.firmId,
                    role: userData.role,
                    isAdmin: userData.isAdmin,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    clientProfile: userData.clientProfile,
                    caProfile: userData.caProfile
                };
                localStorage.setItem('user', JSON.stringify(userToStore));
                setUser(userToStore);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const registerFirm = async (formData) => {
        try {
            const { data } = await authService.registerFirm(formData);
            if (data.success) {
                // Auto login after register
                const { accessToken, refreshToken, ...userData } = data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                const userToStore = {
                    userId: userData.userId,
                    firmId: userData.firmId,
                    role: userData.role,
                    isAdmin: userData.isAdmin
                };
                localStorage.setItem('user', JSON.stringify(userToStore));
                setUser(userToStore);
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerFirm, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
