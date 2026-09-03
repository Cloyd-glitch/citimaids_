import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn, outlineBtn, idBadge, statusBadge } from './adminStyles';

const REPORT_TYPES = [
    {
        id: 'overview',
        label: 'Overview Report',
        desc: 'Summary of bookings and clients',
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: 'bookings',
        label: 'Bookings Report',
        desc: 'Detailed booking velocity',
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
        ),
    },
    {
        id: 'clients',
        label: 'Clients Report',
        desc: 'Customer retention & accounts',
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        id: 'services',
        label: 'Services Report',
        desc: 'Performance per service category',
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" />
            </svg>
        ),
    },
    {
        id: 'revenue',
        label: 'Revenue Report',
        desc: 'Yield, billings, and cash flow',
        icon: (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

const serviceColorList = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#ec4899', '#0891b2'];

const generateLineData = () => {
    const days = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
    return days.map((d) => ({
        label: d,
        new: Math.round(10 + Math.random() * 15),
        confirmed: Math.round(8 + Math.random() * 12),
        completed: Math.round(6 + Math.random() * 10),
        cancelled: Math.round(1 + Math.random() * 3),
    }));
};

export default function Reports() {
    const [activeReport, setActiveReport] = useState('overview');
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('2026-05-01');
    const [dateTo, setDateTo] = useState('2026-05-31');
    const [lineData] = useState(generateLineData);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, bookingsRes, svcRes] = await Promise.all([
                api.get('/dashboard/stats').catch(() => ({ data: {} })),
                api.get('/bookings', { params: { per_page: 5 } }).catch(() => ({ data: { data: [] } })),
                api.get('/services').catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data.stats || statsRes.data);
            setRecentBookings(bookingsRes.data.data || []);
            setServices(svcRes.data.data || svcRes.data || []);
        } catch (err) {
            console.error('Reports fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const total = stats?.total || 108;
    const completed_cnt = stats?.completed || 45;
    const totalClients = stats?.total_clients || 156;
    const revenue = (completed_cnt * 350) || 54300;

    const summaryCards = [
        {
            label: 'Total Bookings',
            value: total,
            change: '+12%',
            color: '#2563eb',
            iconBg: '#eff6ff',
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
            ),
        },
        {
            label: 'Completed Bookings',
            value: completed_cnt,
            change: '+8%',
            color: '#059669',
            iconBg: '#ecfdf5',
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: 'Total Clients',
            value: totalClients,
            change: '+10%',
            color: '#7c3aed',
            iconBg: '#f5f3ff',
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
        {
            label: 'Total Revenue',
            value: `AED ${revenue.toLocaleString()}`,
            change: '+15%',
            color: '#d97706',
            iconBg: '#fffbeb',
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    const svcData = services.length > 0
        ? services.map((s, i) => ({ name: s.name, count: s.bookings_count || Math.round(10 + Math.random() * 30), color: serviceColorList[i % serviceColorList.length] }))
        : [
            { name: 'Home Cleaning', count: 38, color: '#059669' },
            { name: 'Office Cleaning', count: 26, color: '#2563eb' },
            { name: 'Villa Cleaning', count: 18, color: '#7c3aed' },
            { name: 'Deep Cleaning', count: 15, color: '#d97706' },
            { name: 'Move-in / Out', count: 11, color: '#dc2626' },
        ];
    const svcTotal = svcData.reduce((a, s) => a + s.count, 0);

    const donutR = 60, cx = 80, cy = 80, strokeWidth = 20;
    const circumference = 2 * Math.PI * donutR;
    let offset = 0;
    const donutSegments = svcData.map(s => {
        const pct = s.count / svcTotal;
        const seg = { ...s, pct, dasharray: `${pct * circumference} ${(1 - pct) * circumference}`, offset };
        offset += pct * circumference;
        return seg;
    });

    const W = 460, H = 150;
    const pts_count = lineData.length;
    const allVals = lineData.flatMap(d => [d.new, d.confirmed, d.completed, d.cancelled]);
    const maxVal = Math.max(...allVals, 1);
    const toX = i => 40 + (i / (pts_count - 1)) * (W - 60);
    const toY = v => H - 24 - ((v / maxVal) * (H - 40));
    const makePath = key => lineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d[key])}`).join(' ');

    const lineKeys = [
        { key: 'new', color: '#2563eb', label: 'New' },
        { key: 'confirmed', color: '#059669', label: 'Confirmed' },
        { key: 'completed', color: '#7c3aed', label: 'Completed' },
        { key: 'cancelled', color: '#dc2626', label: 'Cancelled' },
    ];

    const maxSvc = Math.max(...svcData.map(s => s.count), 1);
    const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669'];

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={pageTitle}>Operational Reports</h1>
                    <p style={pageSubtitle}>Performance telemetry, booking analytics, and revenue yield</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#fff',
                        border: `1.5px solid ${brand.border}`,
                        borderRadius: 12,
                        padding: '6px 12px',
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInputStyle} />
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>to</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInputStyle} />
                    </div>
                    <button style={solidBtn} onClick={fetchData}>
                        Generate Report
                    </button>
                    <button style={outlineBtn}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Report types sidebar */}
                <div style={{ ...card, padding: 10 }}>
                    {REPORT_TYPES.map(rt => {
                        const isActive = activeReport === rt.id;
                        return (
                            <button
                                key={rt.id}
                                onClick={() => setActiveReport(rt.id)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '12px 14px',
                                    border: 'none',
                                    borderRadius: 12,
                                    background: isActive ? 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' : 'transparent',
                                    color: isActive ? '#fff' : brand.navy,
                                    cursor: 'pointer',
                                    marginBottom: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    transition: 'all 0.15s',
                                    boxShadow: isActive ? '0 4px 12px rgba(10,35,66,0.2)' : 'none',
                                }}
                            >
                                <span style={{ color: isActive ? '#60a5fa' : brand.royal }}>{rt.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{rt.label}</div>
                                    <div style={{ fontSize: 11, color: isActive ? '#bfdbfe' : '#94a3b8', marginTop: 1 }}>{rt.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {summaryCards.map((c, i) => (
                            <div key={i} style={{ ...card, padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{c.label}</span>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: c.iconBg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {c.icon}
                                    </div>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>{c.value}</div>
                                <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 700, marginTop: 4 }}>
                                    {c.change} <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs previous</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
                        {/* Line Chart */}
                        <div style={{ ...card, padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>Booking Trajectory</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Weekly trend breakdown</div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {lineKeys.map(k => (
                                        <span key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                                            <span style={{ width: 14, height: 3, background: k.color, display: 'inline-block', borderRadius: 2 }} />
                                            {k.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                                {[0, 0.33, 0.66, 1].map((f, i) => (
                                    <line key={i} x1={40} y1={toY(maxVal * f)} x2={W - 20} y2={toY(maxVal * f)}
                                        stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                ))}
                                {lineData.map((d, i) => (
                                    <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">{d.label}</text>
                                ))}
                                {lineKeys.map(k => (
                                    <path key={k.key} d={makePath(k.key)} fill="none" stroke={k.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                ))}
                                {lineKeys.map(k =>
                                    lineData.map((d, i) => (
                                        <circle key={`${k.key}-${i}`} cx={toX(i)} cy={toY(d[k.key])} r="3.5" fill={k.color} stroke="#fff" strokeWidth="1.5" />
                                    ))
                                )}
                            </svg>
                        </div>

                        {/* Donut Chart */}
                        <div style={{ ...card, padding: '24px' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: brand.navy, marginBottom: 2, fontFamily: fonts.heading }}>Service Mix</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Volume allocation</div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                <svg width="150" height="150" viewBox="0 0 160 160">
                                    {donutSegments.map((s, i) => (
                                        <circle key={i}
                                            cx={cx} cy={cy} r={donutR}
                                            fill="none"
                                            stroke={s.color}
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={s.dasharray}
                                            strokeDashoffset={-s.offset + circumference * 0.25}
                                            style={{ transition: 'all 0.3s' }}
                                        />
                                    ))}
                                    <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill={brand.navy} fontFamily={fonts.heading}>{svcTotal}</text>
                                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#94a3b8">Total</text>
                                </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {svcData.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{s.name}</span>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: brand.navy }}>{Math.round(s.count / svcTotal * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
                        {/* Recent Bookings in Period */}
                        <div style={{ ...card, padding: '24px' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: brand.navy, marginBottom: 14, fontFamily: fonts.heading }}>
                                Audit Sample Records
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {recentBookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 13 }}>
                                        No recent bookings to audit for this range.
                                    </div>
                                ) : (
                                    recentBookings.map(b => (
                                        <div key={b.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 0', borderBottom: '1px solid #f1f5f9',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={idBadge}>#{String(b.id).padStart(4, '0')}</span>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{b.client?.name || 'Client'}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b' }}>{b.service?.name}</div>
                                                </div>
                                            </div>
                                            <span style={statusBadge(b.status)}>
                                                {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Services Bar */}
                        <div style={{ ...card, padding: '24px' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: brand.navy, marginBottom: 4, fontFamily: fonts.heading }}>
                                Performance by Category
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18 }}>Ranked by request volume</div>
                            {svcData.map((s, i) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                                        <span style={{ fontWeight: 600, color: brand.navy }}>{s.name}</span>
                                        <span style={{ fontWeight: 800, color: brand.navy }}>{s.count} orders</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.round(s.count / maxSvc * 100)}%`,
                                            background: s.color,
                                            borderRadius: 4,
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const dateInputStyle = {
    border: 'none',
    outline: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    color: '#0A2342',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
};
