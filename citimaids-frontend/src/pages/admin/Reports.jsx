import { useState, useEffect } from 'react';
import api from '../../api/axios';

const REPORT_TYPES = [
    { id: 'overview', label: 'Overview Report', desc: 'Summary of bookings and clients', icon: '📊' },
    { id: 'bookings', label: 'Bookings Report', desc: 'Detailed booking report', icon: '📅' },
    { id: 'clients', label: 'Clients Report', desc: 'Detailed clients report', icon: '👥' },
    { id: 'services', label: 'Services Report', desc: 'Services performance report', icon: '⚙️' },
    { id: 'revenue', label: 'Revenue Report', desc: 'Revenue and earnings report', icon: '💰' },
];

const statusColors = { pending: '#f59e0b', confirmed: '#3b82f6', completed: '#10b981', cancelled: '#ef4444' };

const serviceColorList = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

// Generate mock chart data when API doesn't return it
const generateLineData = () => {
    const days = ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'];
    return days.map((d, i) => ({
        label: d,
        new: Math.round(10 + Math.random() * 15),
        confirmed: Math.round(6 + Math.random() * 12),
        completed: Math.round(3 + Math.random() * 10),
        cancelled: Math.round(1 + Math.random() * 5),
    }));
};

export default function Reports() {
    const [activeReport, setActiveReport] = useState('overview');
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('2025-05-01');
    const [dateTo, setDateTo] = useState('2025-05-31');
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
        { label: 'Total Bookings', value: total, change: '+12%', icon: '📅', color: '#3b82f6' },
        { label: 'Completed Bookings', value: completed_cnt, change: '+8%', icon: '✅', color: '#10b981' },
        { label: 'Total Clients', value: totalClients, change: '+10%', icon: '👥', color: '#8b5cf6' },
        { label: 'Total Revenue', value: `₱${revenue.toLocaleString()}`, change: '+15%', icon: '💰', color: '#f59e0b' },
    ];

    const svcData = services.length > 0
        ? services.map((s, i) => ({ name: s.name, count: s.bookings_count || Math.round(10 + Math.random() * 30), color: serviceColorList[i % serviceColorList.length] }))
        : [
            { name: 'Home Cleaning', count: 38, color: '#10b981' },
            { name: 'Office Cleaning', count: 26, color: '#3b82f6' },
            { name: 'Villa Cleaning', count: 18, color: '#8b5cf6' },
            { name: 'Deep Cleaning', count: 15, color: '#f59e0b' },
            { name: 'Others', count: 11, color: '#ec4899' },
        ];
    const svcTotal = svcData.reduce((a, s) => a + s.count, 0);

    // Donut chart calculation
    const donutR = 60, cx = 80, cy = 80, strokeWidth = 22;
    const circumference = 2 * Math.PI * donutR;
    let offset = 0;
    const donutSegments = svcData.map(s => {
        const pct = s.count / svcTotal;
        const seg = { ...s, pct, dasharray: `${pct * circumference} ${(1 - pct) * circumference}`, offset };
        offset += pct * circumference;
        return seg;
    });

    // Line chart SVG
    const W = 440, H = 140;
    const pts_count = lineData.length;
    const allVals = lineData.flatMap(d => [d.new, d.confirmed, d.completed, d.cancelled]);
    const maxVal = Math.max(...allVals, 1);
    const toX = i => 40 + (i / (pts_count - 1)) * (W - 60);
    const toY = v => H - 20 - ((v / maxVal) * (H - 35));
    const makePath = key => lineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d[key])}`).join(' ');

    const lineKeys = [
        { key: 'new', color: '#3b82f6', label: 'New' },
        { key: 'confirmed', color: '#10b981', label: 'Confirmed' },
        { key: 'completed', color: '#8b5cf6', label: 'Completed' },
        { key: 'cancelled', color: '#ef4444', label: 'Cancelled' },
    ];

    // Top services bar
    const maxSvc = Math.max(...svcData.map(s => s.count), 1);

    const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Reports</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>View and export business reports</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>📅</span>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInput} />
                        <span style={{ fontSize: 13, color: '#64748b' }}>to</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInput} />
                    </div>
                    <button style={solidBtn} onClick={fetchData}>Generate Report</button>
                    <button style={outlineBtn}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Main grid: sidebar + content */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
                {/* Report types sidebar */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 8, alignSelf: 'start' }}>
                    {REPORT_TYPES.map(rt => (
                        <button key={rt.id} onClick={() => setActiveReport(rt.id)} style={{
                            width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', borderRadius: 8,
                            background: activeReport === rt.id ? '#eff6ff' : 'transparent',
                            cursor: 'pointer', marginBottom: 2,
                            borderLeft: activeReport === rt.id ? '3px solid #3b82f6' : '3px solid transparent',
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: activeReport === rt.id ? '#1d4ed8' : '#1a1f37' }}>
                                {rt.icon} {rt.label}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{rt.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {summaryCards.map((c, i) => (
                            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.label}</span>
                                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{c.icon}</div>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1f37' }}>{c.value}</div>
                                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                                    {c.change} <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs Apr</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                        {/* Line Chart */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37' }}>Bookings Overview</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>May 1 – May 31, 2025</div>
                                </div>
                                <div style={{ display: 'flex', gap: 14 }}>
                                    {lineKeys.map(k => (
                                        <span key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                                            <span style={{ width: 20, height: 2, background: k.color, display: 'inline-block', borderRadius: 2 }} />
                                            {k.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                                {/* Grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                                    <line key={i} x1={40} y1={toY(maxVal * f)} x2={W - 20} y2={toY(maxVal * f)}
                                        stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                ))}
                                {/* X labels */}
                                {lineData.map((d, i) => (
                                    <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
                                ))}
                                {/* Lines */}
                                {lineKeys.map(k => (
                                    <path key={k.key} d={makePath(k.key)} fill="none" stroke={k.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                ))}
                                {/* Dots */}
                                {lineKeys.map(k =>
                                    lineData.map((d, i) => (
                                        <circle key={`${k.key}-${i}`} cx={toX(i)} cy={toY(d[k.key])} r="3.5" fill={k.color} stroke="#fff" strokeWidth="1.5" />
                                    ))
                                )}
                            </svg>
                        </div>

                        {/* Donut Chart */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37', marginBottom: 4 }}>Bookings by Service</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Distribution this period</div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                <svg width="160" height="160" viewBox="0 0 160 160">
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
                                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1a1f37">{svcTotal}</text>
                                    <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">Total</text>
                                </svg>
                            </div>
                            {svcData.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: '#374151' }}>{s.name}</span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{Math.round(s.count / svcTotal * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom row: Recent bookings + Top services */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                        {/* Recent Bookings */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37' }}>Recent Bookings</div>
                                <a href="#" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
                            </div>
                            {/* Table mini header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 1.2fr 1fr 90px', gap: 8, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                                {['BOOKING', 'CLIENT', 'SERVICE', 'DATE', 'STATUS'].map(h => (
                                    <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
                                ))}
                            </div>
                            {recentBookings.length === 0
                                ? ([...Array(5)].map((_, i) => {
                                    const mockStatuses = ['pending', 'confirmed', 'pending', 'confirmed', 'completed'];
                                    const mockNames = ['Juan Dela Cruz', 'Maria Santos', 'Ana Reyes', 'Pedro Garcia', 'John Paul'];
                                    const mockSvcs = ['Home Cleaning', 'Office Cleaning', 'Villa Cleaning', 'Deep Cleaning', 'Home Cleaning'];
                                    const s = mockStatuses[i];
                                    const initials = mockNames[i].split(' ').map(n => n[0]).join('').slice(0, 2);
                                    const avColor = avatarColors[i % avatarColors.length];
                                    return (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 1.2fr 1fr 90px', gap: 8, padding: '12px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>#{String(1008 - i).padStart(4, '0')}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: avColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{initials}</div>
                                                <span style={{ fontSize: 13, color: '#1a1f37' }}>{mockNames[i]}</span>
                                            </div>
                                            <span style={{ fontSize: 13, color: '#64748b' }}>{mockSvcs[i]}</span>
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>May {18 - i * 1}, 2025</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[s], background: s === 'pending' ? '#fef3c7' : s === 'confirmed' ? '#dbeafe' : '#d1fae5', padding: '3px 8px', borderRadius: 6 }}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </span>
                                        </div>
                                    );
                                }))
                                : recentBookings.map(b => {
                                    const initials = b.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
                                    const avColor = avatarColors[b.id % avatarColors.length];
                                    const s = b.status;
                                    const sc = statusColors[s] || '#94a3b8';
                                    return (
                                        <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 1.2fr 1fr 90px', gap: 8, padding: '12px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>#{String(b.id).padStart(4, '0')}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: avColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{initials}</div>
                                                <span style={{ fontSize: 13, color: '#1a1f37' }}>{b.client?.name}</span>
                                            </div>
                                            <span style={{ fontSize: 13, color: '#64748b' }}>{b.service?.name}</span>
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(b.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: sc, background: sc + '20', padding: '3px 8px', borderRadius: 6 }}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </span>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Top Services */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37', marginBottom: 4 }}>Top Services</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>By booking volume</div>
                            {svcData.map((s, i) => (
                                <div key={i} style={{ marginBottom: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{s.name}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1f37' }}>{s.count}</span>
                                    </div>
                                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.round(s.count / maxSvc * 100)}%`,
                                            background: s.color,
                                            borderRadius: 6,
                                            transition: 'width 0.4s ease',
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

/* ── Styles ─────────────────────────────────────── */
const dateInput = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#374151', outline: 'none', background: '#fff' };
const solidBtn = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const outlineBtn = { background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
