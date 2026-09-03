import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, card, solidBtn, outlineBtn, statusBadge, idBadge, avatar } from './adminStyles';

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
            setRecent(res.data.recent_bookings || []);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: brand.navy,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: fonts.heading,
                }}>
                    <div style={{
                        width: 18,
                        height: 18,
                        border: `3px solid ${brand.royal}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    Loading CitiMaids Operations Hub...
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const totalBookings = stats?.total || 0;
    const pendingCount = stats?.pending || 0;
    const confirmedCount = stats?.confirmed || 0;
    const completedCount = stats?.completed || 0;
    const estimatedRevenue = (completedCount * 350) + (confirmedCount * 120);

    const statCards = [
        {
            label: 'TOTAL BOOKINGS',
            value: totalBookings,
            subtext: `${confirmedCount} confirmed · ${pendingCount} pending`,
            accent: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            iconColor: '#2563eb',
            iconBg: '#eff6ff',
            badge: '+12%',
            icon: (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
            ),
        },
        {
            label: 'TOTAL CLIENTS',
            value: stats?.total || 0,
            subtext: 'High repeat client rate in AD',
            accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            iconColor: '#7c3aed',
            iconBg: '#f5f3ff',
            badge: '+10%',
            icon: (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
        {
            label: 'ACTIVE SERVICES',
            value: '7',
            subtext: 'Residential & Commercial UAE',
            accent: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            iconColor: '#d97706',
            iconBg: '#fffbeb',
            badge: '100% active',
            icon: (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
            ),
        },
        {
            label: 'ESTIMATED REVENUE',
            value: `AED ${estimatedRevenue.toLocaleString()}`,
            subtext: 'Average AED 350 / handover',
            accent: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            iconColor: '#059669',
            iconBg: '#ecfdf5',
            badge: '+15%',
            icon: (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    const pipelineStages = [
        { label: 'New Requests', count: pendingCount, color: '#d97706', bg: '#fffbeb' },
        { label: 'Vetted & Confirmed', count: confirmedCount, color: '#2563eb', bg: '#eff6ff' },
        { label: 'Specialist Dispatched', count: Math.max(0, confirmedCount - 1), color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'Completed & Signed', count: completedCount, color: '#059669', bg: '#ecfdf5' },
    ];

    const demandDistribution = [
        { name: 'Home Cleaning', pct: 38, rate: 'AED 35/hr', color: '#059669' },
        { name: 'Villa Deep Care', pct: 28, rate: 'AED 80/hr', color: '#7c3aed' },
        { name: 'Move-in Handover', pct: 20, rate: 'AED 350 flat', color: '#dc2626' },
        { name: 'Office Commercial', pct: 14, rate: 'AED 45/hr', color: '#2563eb' },
    ];

    const topDistricts = [
        { name: 'Al Reem Island', count: '42%' },
        { name: 'Saadiyat Island', count: '24%' },
        { name: 'Yas Island', count: '18%' },
        { name: 'Al Khalidiyah', count: '16%' },
    ];

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* ═══ Executive Operations Command Header ═══ */}
            <div style={{
                background: 'linear-gradient(135deg, #061429 0%, #0A2342 55%, #1E3A8A 100%)',
                borderRadius: 22,
                padding: '30px 36px',
                color: '#fff',
                marginBottom: 28,
                boxShadow: '0 12px 36px rgba(10,35,66,0.18)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
            }}>
                {/* Background luxury ambient glow */}
                <div style={{
                    position: 'absolute',
                    top: -60,
                    right: -40,
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 20,
                    position: 'relative',
                    zIndex: 2,
                }}>
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1,
                            color: '#93c5fd',
                            marginBottom: 10,
                            textTransform: 'uppercase',
                        }}>
                            <span style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#34d399',
                                boxShadow: '0 0 10px #34d399',
                            }} />
                            Abu Dhabi Operations Hub · Live Dispatch
                        </div>

                        <h1 style={{
                            fontSize: 30,
                            fontWeight: 800,
                            margin: '0 0 6px',
                            fontFamily: fonts.heading,
                            letterSpacing: '-0.5px',
                            color: '#fff',
                        }}>
                            Operations Command Center
                        </h1>
                        <p style={{ color: '#bfdbfe', fontSize: 14, margin: 0, fontWeight: 500, maxWidth: 520, lineHeight: 1.5 }}>
                            Real-time booking dispatch, performance analytics, and field crew monitoring across the Emirate.
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 12,
                            color: '#fff',
                            fontSize: 12.5,
                            fontWeight: 600,
                        }}>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {todayFormatted}
                        </div>

                        <button
                            onClick={() => navigate('/admin/bookings')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 18px',
                                background: '#fff',
                                color: brand.navy,
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                transition: 'all 0.15s',
                            }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Booking
                        </button>

                        <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                background: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 12,
                                color: '#fff',
                                fontSize: 12.5,
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span>Live Site</span>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Primary Executive KPI Row ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {statCards.map((c, i) => (
                    <div key={i} style={{
                        ...card,
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}>
                        {/* Top subtle brand accent line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3.5,
                            background: c.accent,
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 0.8 }}>
                                {c.label}
                            </span>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: c.iconBg,
                                color: c.iconColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {c.icon}
                            </div>
                        </div>

                        <div style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: brand.navy,
                            fontFamily: fonts.heading,
                            letterSpacing: '-0.5px',
                            marginBottom: 6,
                        }}>
                            {c.value}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                                {c.subtext}
                            </span>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#059669',
                                background: '#ecfdf5',
                            }}>
                                {c.badge}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ Operational Pipeline Status Strip ═══ */}
            <div style={{
                ...card,
                padding: '16px 24px',
                marginBottom: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                alignItems: 'center',
                background: '#fff',
            }}>
                {pipelineStages.map((st, i) => (
                    <div key={st.label} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        borderRight: i < 3 ? `1px solid ${brand.border}` : 'none',
                        paddingRight: 16,
                    }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: st.bg,
                            color: st.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 800,
                        }}>
                            {st.count}
                        </div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                Step {i + 1}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>
                                {st.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ Two-Column Operations Layout ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* ── Left Column: Recent Bookings Stream ── */}
                <div style={{ ...card, padding: '26px 28px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${brand.border}`,
                    }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: brand.navy, margin: 0, fontFamily: fonts.heading }}>
                                Recent Booking Inquiries
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 13, margin: '3px 0 0' }}>
                                Customer appointments received through the online booking system
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/bookings')}
                            style={{
                                ...outlineBtn,
                                padding: '8px 16px',
                                fontSize: 12.5,
                                color: brand.royal,
                                borderColor: '#bfdbfe',
                                background: '#eff6ff',
                            }}
                        >
                            View All Requests →
                        </button>
                    </div>

                    {recent.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 16,
                                background: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: brand.royal,
                            }}>
                                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 6px', fontFamily: fonts.heading }}>
                                Operations Ready for Bookings
                            </h3>
                            <p style={{ color: '#64748b', fontSize: 13, maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
                                When clients submit appointments on the customer site, they will appear here instantly with full property details, date, and contact information.
                            </p>
                            <Link
                                to="/book"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ ...solidBtn, padding: '9px 20px', fontSize: 12.5 }}
                            >
                                Test Public Booking Flow →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {recent.map((b) => {
                                const initials = b.client?.name
                                    ? b.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                    : 'CM';
                                const colors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669'];
                                const avatarColor = colors[b.id % colors.length];

                                return (
                                    <div
                                        key={b.id}
                                        onClick={() => navigate(`/admin/bookings/${b.id}`)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 12px',
                                            borderBottom: '1px solid #f1f5f9',
                                            borderRadius: 12,
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={avatar(avatarColor, 40)}>{initials}</div>
                                            <div>
                                                <div style={{ fontSize: 14.5, fontWeight: 700, color: brand.navy }}>
                                                    {b.client?.name || 'Client'}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontWeight: 600, color: brand.royal }}>
                                                        {b.service?.name || 'Home Cleaning'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(b.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <span style={{ fontSize: 13.5, fontWeight: 800, color: brand.navy }}>
                                                AED {b.service?.base_price ? Number(b.service.base_price).toLocaleString() : '35'}
                                            </span>
                                            <span style={statusBadge(b.status)}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                                {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                                            </span>
                                            <span style={idBadge}>
                                                #{String(b.id).padStart(4, '0')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Right Column: Telemetry & Quality ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Service Demand Breakdown */}
                    <div style={{ ...card, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: brand.navy, margin: 0, fontFamily: fonts.heading }}>
                                Demand by Service
                            </h3>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>UAE Mix</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {demandDistribution.map((item) => (
                                <div key={item.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
                                        <span style={{ fontWeight: 600, color: brand.navy }}>{item.name}</span>
                                        <span style={{ fontWeight: 700, color: '#64748b' }}>{item.pct}% ({item.rate})</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 4 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Coverage Zones */}
                    <div style={{ ...card, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: brand.navy, margin: 0, fontFamily: fonts.heading }}>
                                Abu Dhabi Territory
                            </h3>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>
                                Active
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {topDistricts.map((d) => (
                                <div key={d.name} style={{
                                    padding: '12px 14px',
                                    borderRadius: 12,
                                    background: brand.softBg,
                                    border: `1px solid ${brand.border}`,
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{d.name}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: brand.navy, marginTop: 4 }}>{d.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SLA & Trust Card */}
                    <div style={{
                        ...card,
                        padding: '22px',
                        background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)',
                        color: '#fff',
                        border: 'none',
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                            Operations Standards SLA
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, fontFamily: fonts.heading }}>
                            UAE Hotel-Grade Protocol
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#e0e7ff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Police & Emirates ID Cleared</span>
                                <span style={{ fontWeight: 800, color: '#34d399' }}>100%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>On-Time Arrival Rate</span>
                                <span style={{ fontWeight: 800, color: '#34d399' }}>99.2%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Customer Satisfaction</span>
                                <span style={{ fontWeight: 800, color: '#34d399' }}>4.9 / 5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
