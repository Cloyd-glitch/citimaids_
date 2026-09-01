import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data.stats);
            setRecent(res.data.recent_bookings);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: '#64748b', fontSize: 16 }}>Loading dashboard...</div>
            </div>
        );
    }

    const statCards = [
        { label: 'TOTAL BOOKINGS', value: stats?.total || 0, change: '+12%', changeColor: '#10b981', icon: '📅', bg: '#fff' },
        { label: 'TOTAL CLIENTS', value: stats?.total || 0, change: '+10%', changeColor: '#10b981', icon: '👥', bg: '#fff' },
        { label: 'ACTIVE SERVICES', value: '7', change: 'stable', changeColor: '#94a3b8', icon: '⚙️', bg: '#fff' },
        { label: 'TOTAL REVENUE', value: `₱${(stats?.completed || 0) * 350}`, change: '+15%', changeColor: '#10b981', icon: '💰', bg: '#fff' },
    ];

    const secondaryCards = [
        { value: stats?.pending || 0, label: "Today's Bookings", icon: '📋', color: '#3b82f6' },
        { value: stats?.pending || 0, label: 'Pending Approvals', icon: '📝', color: '#f59e0b' },
        { value: stats?.confirmed || 0, label: 'Confirmed Today', icon: '✨', color: '#8b5cf6' },
    ];

    const statusColors = {
        pending: { color: '#f59e0b', bg: '#fef3c7' },
        confirmed: { color: '#3b82f6', bg: '#dbeafe' },
        completed: { color: '#10b981', bg: '#d1fae5' },
        cancelled: { color: '#ef4444', bg: '#fee2e2' },
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Welcome back — here's what's happening today</p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    color: '#1a1f37',
                    fontSize: 14,
                    fontWeight: 500,
                }}>
                    📅 {today}
                </div>
            </div>

            {/* Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: '20px 22px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 0.8 }}>{card.label}</span>
                            <span style={{ fontSize: 18 }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1f37', marginBottom: 8 }}>{card.value}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#fff',
                                background: card.changeColor,
                            }}>{card.change}</span>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {secondaryCards.map((card, i) => (
                    <div key={i} style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: '20px 22px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: `${card.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                        }}>{card.icon}</div>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1f37' }}>{card.value}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Bookings */}
            <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '24px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1f37', margin: 0 }}>Recent Bookings</h2>
                        <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>Latest {recent.length} booking requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        style={{
                            color: '#3b82f6',
                            background: 'none',
                            border: 'none',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >View all</button>
                </div>

                {recent.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No bookings yet</p>
                ) : (
                    <div>
                        {recent.map((booking) => {
                            const initials = booking.client?.name
                                ? booking.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                : '??';
                            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                            const avatarColor = colors[booking.id % colors.length];
                            const sc = statusColors[booking.status] || statusColors.pending;

                            return (
                                <div key={booking.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 0',
                                    borderBottom: '1px solid #f1f5f9',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: avatarColor,
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}>{initials}</div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1f37' }}>{booking.client?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                {booking.service?.name || 'Service'} · {new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1f37' }}>
                                            ₱{booking.service?.base_price ? Number(booking.service.base_price).toLocaleString() : '—'}
                                        </span>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: sc.color,
                                        }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, display: 'inline-block' }} />
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#3b82f6',
                                            background: '#eff6ff',
                                            padding: '3px 10px',
                                            borderRadius: 6,
                                        }}>
                                            #{String(booking.id).padStart(4, '0')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
