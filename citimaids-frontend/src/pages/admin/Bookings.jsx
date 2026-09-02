import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const statusColors = {
    pending: { color: '#f59e0b', bg: '#fef3c7' },
    confirmed: { color: '#3b82f6', bg: '#dbeafe' },
    completed: { color: '#10b981', bg: '#d1fae5' },
    cancelled: { color: '#ef4444', bg: '#fee2e2' },
};

const serviceColors = {
    'Home Cleaning': '#10b981',
    'Office Cleaning': '#3b82f6',
    'Villa Cleaning': '#8b5cf6',
    'Deep Cleaning': '#f59e0b',
    'Carpet & Sofa Cleaning': '#ec4899',
    'Window & Glass Cleaning': '#06b6d4',
    'Move-in / Move-out Cleaning': '#ef4444',
};

export default function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [meta, setMeta] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchBookings();
    }, [activeTab, search, page]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = { page };
            if (activeTab !== 'all') params.status = activeTab;
            if (search) params.search = search;
            const res = await api.get('/bookings', { params });
            setBookings(res.data.data || []);
            setMeta(res.data);
        } catch (err) {
            console.error('Bookings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
            fetchBookings();
        } catch (err) {
            console.error('Status update error:', err);
        }
    };

    // Calculate tab counts from meta or visible data
    const tabCounts = {
        all: meta.total || bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Bookings</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Manage all booking requests</p>
                </div>
                <button style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    + New Booking
                </button>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                    flex: 1,
                    maxWidth: 400,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '0 14px',
                }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, service, or booking ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            border: 'none',
                            outline: 'none',
                            padding: '11px 10px',
                            fontSize: 14,
                            width: '100%',
                            background: 'transparent',
                        }}
                    />
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#374151',
                    cursor: 'pointer',
                }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M3 4h18M7 8h10M10 12h4" />
                    </svg>
                    Filters
                </button>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#374151',
                    cursor: 'pointer',
                }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Export
                </button>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {STATUS_TABS.map(tab => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            style={{
                                padding: '7px 16px',
                                borderRadius: 20,
                                border: 'none',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: isActive ? '#3b82f6' : 'transparent',
                                color: isActive ? '#fff' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.15s',
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: isActive ? '#fff' : '#94a3b8',
                            }}>{tabCounts[tab] || 0}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 1fr 1fr 120px 80px',
                    padding: '14px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#fafbfc',
                }}>
                    {['BOOKING ID', 'CLIENT', 'SERVICE', 'PREFERRED DATE', 'STATUS', 'ACTIONS'].map(h => (
                        <span key={h} style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#64748b',
                            letterSpacing: 0.8,
                        }}>{h}</span>
                    ))}
                </div>

                {/* Table Body */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No bookings found</div>
                ) : (
                    bookings.map((booking) => {
                        const initials = booking.client?.name
                            ? booking.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : '??';
                        const avatarColor = avatarColors[booking.id % avatarColors.length];
                        const sc = statusColors[booking.status] || statusColors.pending;
                        const svcColor = serviceColors[booking.service?.name] || '#6366f1';
                        const bookingIdStr = `#${String(booking.id).padStart(4, '0')}`;

                        return (
                            <div key={booking.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '100px 1fr 1fr 1fr 120px 80px',
                                padding: '16px 24px',
                                borderBottom: '1px solid #f1f5f9',
                                alignItems: 'center',
                                transition: 'background 0.1s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                {/* Booking ID */}
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#3b82f6',
                                    background: '#eff6ff',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    width: 'fit-content',
                                }}>{bookingIdStr}</span>

                                {/* Client */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: avatarColor,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>{initials}</div>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1f37' }}>{booking.client?.name || '—'}</span>
                                </div>

                                {/* Service */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: svcColor, flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#fff',
                                        background: svcColor,
                                        padding: '3px 10px',
                                        borderRadius: 6,
                                    }}>{booking.service?.name || '—'}</span>
                                </div>

                                {/* Date */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14 }}>
                                    📅 {new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>

                                {/* Status */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: sc.color,
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        title="View"
                                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 6,
                                            border: '1px solid #e2e8f0',
                                            background: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#64748b',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                    <button
                                        title="Edit"
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 6,
                                            border: '1px solid #e2e8f0',
                                            background: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#64748b',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 24px',
                        borderTop: '1px solid #e2e8f0',
                    }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Showing {meta.from}–{meta.to} of {meta.total} entries
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <PaginationBtn
                                label="‹"
                                active={false}
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            />
                            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map(p => (
                                <PaginationBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
                            ))}
                            {meta.last_page > 5 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            {meta.last_page > 5 && (
                                <PaginationBtn label={meta.last_page} active={page === meta.last_page} onClick={() => setPage(meta.last_page)} />
                            )}
                            <PaginationBtn
                                label="›"
                                active={false}
                                disabled={page >= meta.last_page}
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PaginationBtn({ label, active, disabled, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: active ? 'none' : '1px solid #e2e8f0',
                background: active ? '#3b82f6' : '#fff',
                color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >{label}</button>
    );
}
