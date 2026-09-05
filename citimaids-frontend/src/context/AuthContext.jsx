import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('citimaids_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('citimaids_token'));
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // On mount, verify the stored token is still valid with the server
    useEffect(() => {
        const storedToken = localStorage.getItem('citimaids_token');
        if (!storedToken) {
            setInitializing(false);
            return;
        }
        api.get('/auth/me')
            .then((res) => {
                setUser(res.data);
                localStorage.setItem('citimaids_user', JSON.stringify(res.data));
            })
            .catch(() => {
                // Token invalid or expired — clear session
                localStorage.removeItem('citimaids_token');
                localStorage.removeItem('citimaids_user');
                setUser(null);
                setToken(null);
            })
            .finally(() => setInitializing(false));
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData, token: newToken } = res.data;
            setUser(userData);
            setToken(newToken);
            localStorage.setItem('citimaids_token', newToken);
            localStorage.setItem('citimaids_user', JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        setUser(null);
        setToken(null);
        localStorage.removeItem('citimaids_token');
        localStorage.removeItem('citimaids_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, initializing, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
