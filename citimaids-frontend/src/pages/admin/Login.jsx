import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #061429 0%, #0A2342 50%, #1E3A8A 100%)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            position: 'relative',
            padding: '24px',
            overflow: 'hidden',
        }}>
            {/* Ambient lighting glows */}
            <div style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'rgba(37,99,235,0.15)',
                filter: 'blur(100px)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '20%',
                width: 350,
                height: 350,
                borderRadius: '50%',
                background: 'rgba(56,189,248,0.1)',
                filter: 'blur(100px)',
                pointerEvents: 'none',
            }} />

            {/* Login Card */}
            <div style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '48px 40px',
                width: 440,
                maxWidth: '92vw',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.45)',
                position: 'relative',
                zIndex: 10,
                border: '1px solid rgba(255,255,255,0.2)',
            }}>
                {/* Back to website shortcut */}
                <div style={{ marginBottom: 24 }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#2563eb',
                            textDecoration: 'none',
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: '#eff6ff',
                        }}
                    >
                        ← Back to Public Website
                    </Link>
                </div>

                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 58,
                        height: 58,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                    }}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0A2342', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        CITIMAIDS
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 0', fontWeight: 500 }}>
                        Operations & Staff Portal Login
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 20,
                        border: '1px solid #fecaca',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A2342', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Staff Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@citimaids.com"
                            required
                            style={{
                                width: '100%',
                                padding: '13px 16px',
                                borderRadius: 12,
                                border: '1.5px solid #e2e8f0',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                background: '#f8fafc',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A2342', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '13px 16px',
                                borderRadius: 12,
                                border: '1.5px solid #e2e8f0',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                background: '#f8fafc',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px 0',
                            background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            boxShadow: '0 4px 14px rgba(10,35,66,0.3)',
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
