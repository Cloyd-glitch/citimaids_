import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
    brand, fonts, pageTitle, pageSubtitle, card,
    solidBtn as solidBtnToken, outlineBtn as outlineBtnToken,
    statusBadge,
} from './adminStyles';

/* ── Helpers ─────────────────────────────────── */
const AED = v => `AED ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = v => `${Number(v || 0).toFixed(1)}%`;
const chg = v => v == null ? '—  vs prev' : `${v >= 0 ? '+' : ''}${v}% vs prev`;
const PAL = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#ec4899', '#0891b2', '#dc2626', '#16a34a'];

function today() { return new Date().toISOString().slice(0, 10); }
function firstOfMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }

const TABS = [
    { id: 'overview', label: 'Overview Report', desc: 'Cross-entity KPIs & trend' },
    { id: 'bookings', label: 'Bookings Report', desc: 'Velocity, funnel & patterns' },
    { id: 'clients', label: 'Clients Report', desc: 'Retention & lifetime value' },
    { id: 'services', label: 'Services Report', desc: 'Performance by category' },
    { id: 'revenue', label: 'Revenue Report', desc: 'Yield, billings & cash flow' },
];

/* ═══════════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Reports() {
    const [active, setActive] = useState('overview');
    const [from, setFrom] = useState(firstOfMonth());
    const [to, setTo] = useState(today());
    const [cache, setCache] = useState({});
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async (tab, f, t) => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/${tab}`, { params: { from: f, to: t } });
            setCache(prev => ({ ...prev, [tab]: res.data }));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(active, from, to); }, [active]);

    const generate = () => { setCache(prev => ({ ...prev, [active]: undefined })); fetch(active, from, to); };

    const exportCsv = () => {
        const d = cache[active]; if (!d) return;
        const rows = [['Report', active, 'From', from, 'To', to]];
        const flat = (obj, prefix = '') =>
            Object.entries(obj).forEach(([k, v]) =>
                typeof v === 'object' && v !== null && !Array.isArray(v) ? flat(v, `${prefix}${k}_`) : rows.push([`${prefix}${k}`, v]));
        flat(d);
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `citimaids-${active}.csv` });
        a.click();
    };

    const d = cache[active];

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={pageTitle}>Operational Reports</h1>
                    <p style={pageSubtitle}>Performance telemetry, booking analytics, and revenue yield</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${brand.border}`, borderRadius: 12, padding: '6px 14px' }}>
                        <CalIcon />
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={dateInput} />
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>to</span>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={dateInput} />
                    </div>
                    <button style={solidBtnToken} onClick={generate}>Generate Report</button>
                    <button style={{ ...outlineBtnToken, gap: 6 }} onClick={exportCsv}>
                        <DlIcon /> Export CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Sidebar */}
                <div style={{ ...card, padding: 10 }}>
                    {TABS.map(t => {
                        const act = t.id === active;
                        return (
                            <button key={t.id} onClick={() => setActive(t.id)} style={{
                                width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', borderRadius: 12,
                                marginBottom: 4, cursor: 'pointer', transition: 'all .15s',
                                background: act ? 'linear-gradient(135deg,#0A2342,#1E3A8A)' : 'transparent',
                                color: act ? '#fff' : brand.navy,
                                boxShadow: act ? '0 4px 12px rgba(10,35,66,.2)' : 'none',
                            }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.label}</div>
                                <div style={{ fontSize: 11, color: act ? '#bfdbfe' : '#94a3b8', marginTop: 1 }}>{t.desc}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Panel */}
                <div>
                    {loading || !d ? (
                        <div style={{ ...card, padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>{loading ? '⏳' : '📊'}</div>
                            {loading ? 'Fetching live data from database…' : 'Click Generate Report to load data.'}
                        </div>
                    ) : (
                        <>
                            {active === 'overview' && <OverviewPanel d={d} />}
                            {active === 'bookings' && <BookingsPanel d={d} />}
                            {active === 'clients' && <ClientsPanel d={d} />}
                            {active === 'services' && <ServicesPanel d={d} />}
                            {active === 'revenue' && <RevenuePanel d={d} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW PANEL
═══════════════════════════════════════════════════════════ */
function OverviewPanel({ d }) {
    const b = d.bookings, r = d.revenue, c = d.clients, weeks = d.weekly_trend || [];

    return (
        <Col>
            {/* KPI cards */}
            <Grid4>
                <Kpi label="Total Bookings" value={b.total} sub={chg(b.change)} clr="#2563eb" />
                <Kpi label="Completed" value={b.completed} sub={pct(b.completion_rate) + ' rate'} clr="#059669" />
                <Kpi label="New Clients (Period)" value={c.new_in_period} sub={`${c.total} total`} clr="#7c3aed" />
                <Kpi label="Revenue (Period)" value={AED(r.total)} sub={chg(r.change)} clr="#d97706" />
            </Grid4>

            <Grid2 left="1fr" right="1.7fr">
                {/* Status funnel */}
                <Pane title="Booking Status Funnel" sub="Distribution in selected period">
                    {[
                        { label: 'Pending', v: b.pending, c: '#d97706' },
                        { label: 'Confirmed', v: b.confirmed, c: '#2563eb' },
                        { label: 'Completed', v: b.completed, c: '#059669' },
                        { label: 'Cancelled', v: b.cancelled, c: '#dc2626' },
                    ].map(s => (
                        <div key={s.label} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                <span style={{ color: brand.navy }}>{s.label}</span>
                                <span style={{ color: s.c }}>{s.v} ({b.total > 0 ? Math.round((s.v / b.total) * 100) : 0}%)</span>
                            </div>
                            <Bar pct={b.total > 0 ? (s.v / b.total) * 100 : 0} color={s.c} />
                        </div>
                    ))}
                    <StatRow label="Cancellation Rate" value={pct(b.cancellation_rate)} red />
                </Pane>

                {/* Weekly trend SVG grouped bar chart */}
                <GroupedBarChart weeks={weeks} />

            </Grid2>

            <Grid3>
                <StatTile label="Avg Bookings / Week" value={weeks.length ? Math.round(b.total / Math.max(weeks.length, 1)) : b.total} suffix="bookings" />
                <StatTile label="Potential Revenue" value={AED((b.confirmed + b.pending) * 350)} suffix="outstanding jobs" />
                <StatTile label="Cancellation Loss" value={AED(b.cancelled * 350)} suffix="estimated lost" red />
            </Grid3>
        </Col>
    );
}

/* ═══════════════════════════════════════════════════════════
   BOOKINGS PANEL
═══════════════════════════════════════════════════════════ */
function BookingsPanel({ d }) {
    const s = d.summary, buckets = d.volume_buckets || [], dow = d.by_day_of_week || [], recent = d.recent || [];
    const maxW = Math.max(...(dow.map(x => x.count) || [1]), 1);

    return (
        <Col>
            <Grid4>
                <Kpi label="Total Bookings" value={s.total} clr="#2563eb" />
                <Kpi label="Completed" value={s.completed} clr="#059669" />
                <Kpi label="Cancelled" value={s.cancelled} clr="#dc2626" />
                <Kpi label="Avg Lead Time" value={`${s.avg_lead_days}d`} sub="booking→appt" clr="#7c3aed" />
            </Grid4>

            <Grid2 left="1.6fr" right="1fr">
                {/* Volume bar chart */}
                <VolumeBarChart buckets={buckets} />

                {/* Busiest days */}
                <Pane title="Busiest Days" sub="Preferred appointment days">
                    {dow.length === 0 ? <Empty /> : dow.slice(0, 6).map((x, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', width: 76, flexShrink: 0 }}>{x.dow}</span>
                            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round((x.count / maxW) * 100)}%`, background: PAL[i % PAL.length], borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: brand.navy, width: 18 }}>{x.count}</span>
                        </div>
                    ))}
                </Pane>
            </Grid2>

            {/* Recent bookings */}
            <Pane title="Recent Bookings in Period" sub="Latest 10 bookings from selected date range">
                {recent.length === 0 ? <Empty /> : recent.map((b, i) => (
                    <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 110px', gap: 12, padding: '11px 0', borderBottom: i < recent.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>#{String(b.id).padStart(4, '0')}</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{b.client?.name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.service?.name}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                            {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </div>
                        <span style={statusBadge(b.status)}>{b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}</span>
                    </div>
                ))}
            </Pane>
        </Col>
    );
}

/* ═══════════════════════════════════════════════════════════
   CLIENTS PANEL
═══════════════════════════════════════════════════════════ */
function ClientsPanel({ d }) {
    const s = d.summary, top = d.top_clients || [], growth = d.monthly_growth || [];
    const maxBk = Math.max(...top.map(c => c.bookings_count), 1);
    const maxGro = Math.max(...growth.map(g => g.new_clients), 1);

    return (
        <Col>
            <Grid4>
                <Kpi label="Total Clients" value={s.total} clr="#2563eb" />
                <Kpi label="New This Period" value={s.new_in_period} clr="#059669" />
                <Kpi label="Repeat Clients" value={s.repeat} sub={pct(s.repeat_rate) + ' repeat rate'} clr="#7c3aed" />
                <Kpi label="Active Upcoming" value={s.active} clr="#d97706" />
            </Grid4>

            <Grid2 left="1.6fr" right="1fr">
                {/* Top clients */}
                <Pane title="Top Clients by Booking Volume" sub="Ranked by total lifetime bookings">
                    {top.length === 0 ? <Empty /> : top.map((c, i) => {
                        const init = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: PAL[i % PAL.length] + '20', color: PAL[i % PAL.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{init}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: brand.navy, marginBottom: 3 }}>
                                        <span>{c.name}</span><span>{c.bookings_count} bookings</span>
                                    </div>
                                    <Bar pct={(c.bookings_count / maxBk) * 100} color={PAL[i % PAL.length]} />
                                    {c.lifetime_value > 0 && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>LTV: {AED(c.lifetime_value)}</div>}
                                </div>
                            </div>
                        );
                    })}
                </Pane>

                {/* Monthly growth bar */}
                <Pane title="Monthly Client Growth" sub="New clients acquired (last 6 months)">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, marginTop: 16 }}>
                        {growth.length === 0 ? <Empty /> : growth.map((g, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>{g.new_clients}</span>
                                <div style={{ width: '100%', height: `${Math.round((g.new_clients / maxGro) * 70) + 4}px`, background: '#7c3aed', borderRadius: '4px 4px 0 0' }} />
                                <span style={{ fontSize: 9, color: '#94a3b8' }}>{g.month.slice(5)}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16, padding: '10px 14px', background: '#f5f3ff', borderRadius: 10, fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Retention: </span>
                        <strong style={{ color: brand.navy }}>{pct(s.repeat_rate)} book more than once</strong>
                    </div>
                </Pane>
            </Grid2>
        </Col>
    );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES PANEL
═══════════════════════════════════════════════════════════ */
function ServicesPanel({ d }) {
    const s = d.summary, svcs = d.services || [];
    const maxBk = Math.max(...svcs.map(s => s.total_bookings), 1);

    return (
        <Col>
            <Grid4>
                <Kpi label="Total Services" value={s.total} clr="#2563eb" />
                <Kpi label="Active" value={s.active} clr="#059669" />
                <Kpi label="Total Bookings" value={s.total_bookings} clr="#7c3aed" />
                <Kpi label="Total Revenue" value={AED(s.total_revenue)} clr="#d97706" />
            </Grid4>

            {s.top_service && (
                <div style={{ ...card, padding: '16px 24px', background: 'linear-gradient(135deg,#0A2342,#1E3A8A)', color: '#fff' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, color: '#93c5fd' }}>🏆 TOP PERFORMING SERVICE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, fontFamily: fonts.heading }}>{s.top_service}</div>
                </div>
            )}

            {/* Services table */}
            <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 80px 90px 100px 80px', gap: 12, padding: '12px 24px', background: brand.softBg, borderBottom: `1px solid ${brand.border}` }}>
                    {['SERVICE', 'BOOKINGS', 'COMPLETED', 'COMP.RATE', 'REVENUE', 'SHARE'].map(h => (
                        <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: .6 }}>{h}</span>
                    ))}
                </div>
                {svcs.length === 0 ? <Empty /> : svcs.map((svc, i) => (
                    <div key={svc.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 80px 80px 90px 100px 80px', gap: 12, padding: '14px 24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: PAL[i % PAL.length], flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{svc.name}</div>
                                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', width: 80, marginTop: 3 }}>
                                    <div style={{ height: '100%', width: `${Math.round((svc.total_bookings / maxBk) * 100)}%`, background: PAL[i % PAL.length], borderRadius: 4 }} />
                                </div>
                            </div>
                        </div>
                        <span style={num}>{svc.total_bookings}</span>
                        <span style={{ ...num, color: '#059669' }}>{svc.completed_bookings}</span>
                        <span style={{ ...num, color: svc.completion_rate >= 70 ? '#059669' : svc.completion_rate >= 40 ? '#d97706' : '#dc2626' }}>{pct(svc.completion_rate)}</span>
                        <span style={num}>{AED(svc.revenue)}</span>
                        <span style={{ ...num, color: '#64748b' }}>{pct(svc.booking_share)}</span>
                    </div>
                ))}
            </div>
        </Col>
    );
}

/* ═══════════════════════════════════════════════════════════
   REVENUE PANEL
═══════════════════════════════════════════════════════════ */
function RevenuePanel({ d }) {
    const s = d.summary, monthly = d.monthly_trend || [], bySvc = d.by_service || [];
    const maxRev = Math.max(...monthly.map(m => Number(m.revenue)), 1);
    const svcTot = bySvc.reduce((a, x) => a + x.revenue, 0);

    return (
        <Col>
            <Grid4>
                <Kpi label="Gross Revenue" value={AED(s.gross_revenue)} sub={`${s.completed_bookings} jobs`} clr="#059669" />
                <Kpi label="Outstanding" value={AED(s.outstanding)} sub="confirmed ahead" clr="#2563eb" />
                <Kpi label="Lost (Cancellations)" value={AED(s.lost_revenue)} sub="estimated" clr="#dc2626" />
                <Kpi label="Avg Booking Value" value={AED(s.avg_booking_value)} sub="per completed job" clr="#d97706" />
            </Grid4>

            <Grid2 left="1.6fr" right="1fr">
                {/* Monthly revenue bars */}
                <Pane title="Monthly Revenue Trend" sub="Completed booking revenue — last 6 months">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, marginTop: 16 }}>
                        {monthly.length === 0 ? <Empty /> : monthly.map((m, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>{Number(m.revenue) > 0 ? AED(m.revenue).replace('AED ', '') : '—'}</span>
                                <div style={{ width: '100%', height: `${Math.round((Number(m.revenue) / maxRev) * 70) + 4}px`, background: 'linear-gradient(180deg,#059669,#34d399)', borderRadius: '4px 4px 0 0', transition: 'height .4s' }} />
                                <span style={{ fontSize: 9, color: '#94a3b8' }}>{m.month.slice(5)}</span>
                            </div>
                        ))}
                    </div>
                </Pane>

                {/* Revenue by service */}
                <Pane title="Revenue by Service" sub="Share of collected revenue per category">
                    {bySvc.length === 0 ? <Empty /> : bySvc.map((s, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
                                <span style={{ color: brand.navy }}>{s.name}</span>
                                <span style={{ color: PAL[i % PAL.length] }}>{AED(s.revenue)}</span>
                            </div>
                            <Bar pct={svcTot > 0 ? (s.revenue / svcTot) * 100 : 0} color={PAL[i % PAL.length]} />
                        </div>
                    ))}
                </Pane>
            </Grid2>

            <Grid3>
                <StatTile label="Projected (if all confirmed complete)" value={AED(s.gross_revenue + s.outstanding)} clr="#2563eb" />
                <StatTile label="Collection Efficiency" value={s.gross_revenue > 0 && (s.gross_revenue + s.outstanding) > 0 ? pct((s.gross_revenue / (s.gross_revenue + s.outstanding)) * 100) : '—'} suffix="collected" />
                <StatTile label="30% Win-back Estimate" value={AED(s.lost_revenue * .3)} suffix="recovery" clr="#d97706" />
            </Grid3>
        </Col>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHARED MINI-COMPONENTS
═══════════════════════════════════════════════════════════ */
function Col({ children }) { return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>; }
function Grid4({ children }) { return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>{children}</div>; }
function Grid3({ children }) { return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>{children}</div>; }
function Grid2({ children, left = '1fr', right = '1fr' }) {
    return <div style={{ display: 'grid', gridTemplateColumns: `${left} ${right}`, gap: 20 }}>{children}</div>;
}

function Pane({ title, sub, children }) {
    return (
        <div style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>{title}</div>
            {sub && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, marginBottom: 12 }}>{sub}</div>}
            {children}
        </div>
    );
}

function Kpi({ label, value, sub, clr = '#2563eb' }) {
    return (
        <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: clr, fontFamily: fonts.heading }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

function StatTile({ label, value, suffix, red, clr }) {
    return (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: red ? '#dc2626' : clr || brand.navy, fontFamily: fonts.heading }}>{value}</div>
            {suffix && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{suffix}</div>}
        </div>
    );
}

function StatRow({ label, value, red }) {
    return (
        <div style={{ marginTop: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 800, color: red ? '#dc2626' : brand.navy }}>{value}</span>
        </div>
    );
}

function Bar({ pct: p, color }) {
    return (
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(Math.max(p, 0), 100)}%`, background: color, borderRadius: 4, transition: 'width .4s' }} />
        </div>
    );
}

function Empty() {
    return <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1', fontSize: 13 }}>No data for selected period</div>;
}

function VolumeBarChart({ buckets }) {
    if (!buckets?.length) return <Empty />;
    const W = 420, H = 200;
    const mx = Math.max(...buckets.map(b => b.count), 1);
    const barW = 36;
    const usableW = W - 50;
    const stepX = usableW / Math.max(buckets.length, 1);
    const toY = v => H - 44 - ((v / mx) * (H - 64));
    const zeroY = H - 44;
    const ticks = Math.min(mx + 1, 7);

    return (
        <div style={{ ...card, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>Booking Volume by Week</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, marginBottom: 16 }}>By preferred appointment date</div>

            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                {/* Grid lines + Y labels */}
                {Array.from({ length: ticks }, (_, i) => {
                    const val = Math.round((i / Math.max(ticks - 1, 1)) * mx);
                    const y = zeroY - ((i / Math.max(ticks - 1, 1)) * (H - 64));
                    return (
                        <g key={i}>
                            <line x1="34" y1={y} x2={W - 4} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                            <text x="28" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontWeight="600">{val}</text>
                        </g>
                    );
                })}

                {/* Bars */}
                {buckets.map((b, i) => {
                    const cx = 34 + (stepX * i) + (stepX / 2);
                    const barH = Math.max(zeroY - toY(b.count), 0);
                    return (
                        <g key={i}>
                            <rect
                                x={cx - barW / 2}
                                y={toY(b.count)}
                                width={barW}
                                height={barH}
                                fill="#3b82f6"
                                rx={4}
                            >
                                <title>{b.label}: {b.count} bookings</title>
                            </rect>
                            {b.count > 0 && (
                                <text x={cx} y={toY(b.count) - 6} fontSize="11" fill="#3b82f6" textAnchor="middle" fontWeight="800">{b.count}</text>
                            )}
                            <text x={cx} y={H - 18} fontSize="10.5" fill={brand.navy} textAnchor="middle" fontWeight="700">{b.label}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function GroupedBarChart({ weeks }) {
    if (!weeks?.length) return <Empty />;
    const W = 480, H = 240;
    const barW = 14, spacing = 3;

    const allV = weeks.flatMap(w => [w.new, w.confirmed, w.completed, w.cancelled]);
    const mx = Math.max(...allV, 1);

    const groupW = (4 * barW) + (3 * spacing);
    const usableW = W - 50;
    const stepX = usableW / Math.max(weeks.length, 1);

    const colors = {
        new: { hex: '#3b82f6', label: 'Pending / New' },
        confirmed: { hex: '#f59e0b', label: 'Confirmed' },
        completed: { hex: '#10b981', label: 'Completed' },
        cancelled: { hex: '#ef4444', label: 'Cancelled' },
    };

    const toY = v => H - 52 - ((v / mx) * (H - 72));
    const zeroY = H - 52;
    const ticks = Math.min(mx + 1, 7);

    return (
        <div style={{ ...card, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>Weekly Booking Trend</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>By preferred appointment date</div>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {Object.entries(colors).map(([key, { hex, label }]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: hex }} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                {/* Grid lines + Y labels */}
                {Array.from({ length: ticks }, (_, i) => {
                    const val = Math.round((i / (ticks - 1)) * mx);
                    const y = zeroY - ((i / (ticks - 1)) * (H - 72));
                    return (
                        <g key={i}>
                            <line x1="38" y1={y} x2={W - 4} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                            <text x="32" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontWeight="600">{val}</text>
                        </g>
                    );
                })}

                {/* Grouped bars + x-axis labels */}
                {weeks.map((w, i) => {
                    const cx = 38 + (stepX * i) + (stepX / 2);
                    const startX = cx - (groupW / 2);
                    const keys = ['new', 'confirmed', 'completed', 'cancelled'];

                    return (
                        <g key={i}>
                            {keys.map((k, j) => {
                                const val = w[k];
                                const barH = Math.max(zeroY - toY(val), 0);
                                return (
                                    <g key={k}>
                                        <rect
                                            x={startX + j * (barW + spacing)}
                                            y={toY(val)}
                                            width={barW}
                                            height={barH}
                                            fill={colors[k].hex}
                                            rx={3}
                                        >
                                            <title>{colors[k].label}: {val}</title>
                                        </rect>
                                        {val > 0 && (
                                            <text
                                                x={startX + j * (barW + spacing) + barW / 2}
                                                y={toY(val) - 4}
                                                fontSize="9"
                                                fill={colors[k].hex}
                                                textAnchor="middle"
                                                fontWeight="700"
                                            >{val}</text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Week label */}
                            <text x={cx} y={H - 26} fontSize="11" fill={brand.navy} textAnchor="middle" fontWeight="700">{w.label}</text>
                            {/* Date range label */}
                            {w.range && (
                                <text x={cx} y={H - 12} fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontWeight="600">{w.range}</text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/* ── tiny icon helpers ───────────────────────── */
const CalIcon = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
const DlIcon = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;

const dateInput = { border: 'none', outline: 'none', fontSize: 12.5, fontWeight: 600, color: '#0A2342', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' };
const num = { fontSize: 13, fontWeight: 700, color: brand.navy };
