import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn as solidBtnBase, outlineBtn as outlineBtnBase, searchBar, searchInput, tabBtn, idBadge, statusBadge, avatar } from './adminStyles';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const serviceColors = {
    'Home Cleaning': '#059669',
    'Office Cleaning': '#2563eb',
    'Villa Cleaning': '#7c3aed',
    'Deep Cleaning': '#d97706',
    'Carpet & Sofa Cleaning': '#ec4899',
    'Window & Glass Cleaning': '#0891b2',
    'Move-in / Move-out Cleaning': '#dc2626',
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

    const tabCounts = {
        all: meta.total || bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669', '#0891b2'];

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={pageTitle}>Bookings</h1>
                    <p style={pageSubtitle}>Manage all customer booking requests</p>
                </div>
                <button style={solidBtnBase}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Booking
                </button>
            </div>

            {/* Search & Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={searchBar}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, service, or booking ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={searchInput}
                    />
                </div>
                <button style={outlineBtnBase}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
                    </svg>
                    Filters
                </button>
                <button style={outlineBtnBase}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Export
                </button>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        style={tabBtn(activeTab === tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span style={{
                            fontSize: 10, fontWeight: 800, marginLeft: 4,
                            opacity: activeTab === tab ? 0.8 : 0.5,
                        }}>{tabCounts[tab] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 1fr 1fr 130px 90px',
                    padding: '14px 24px',
                    borderBottom: `1px solid ${brand.border}`,
                    background: brand.softBg,
                }}>
                    {['BOOKING ID', 'CLIENT', 'SERVICE', 'PREFERRED DATE', 'STATUS', 'ACTIONS'].map(h => (
                        <span key={h} style={{
                            fontSize: 10, fontWeight: 700, color: '#64748b',
                            letterSpacing: 0.8, textTransform: 'uppercase',
                        }}>{h}</span>
                    ))}
                </div>

                {/* Table Body */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 12px', color: '#2563eb',
                        }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>No bookings found</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Bookings from the public website will appear here.</div>
                    </div>
                ) : (
                    bookings.map((booking) => {
                        const initials = booking.client?.name
                            ? booking.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'CM';
                        const avatarColor = avatarColors[booking.id % avatarColors.length];
                        const svcColor = serviceColors[booking.service?.name] || '#6366f1';
                        const bookingIdStr = `#${String(booking.id).padStart(4, '0')}`;

                        return (
                            <div key={booking.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '100px 1fr 1fr 1fr 130px 90px',
                                padding: '16px 24px',
                                borderBottom: '1px solid #f1f5f9',
                                alignItems: 'center',
                                transition: 'background 0.15s',
                                cursor: 'pointer',
                            }}
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                {/* Booking ID */}
                                <span style={idBadge}>{bookingIdStr}</span>

                                {/* Client */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={avatar(avatarColor, 36)}>{initials}</div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: brand.navy }}>{booking.client?.name || '—'}</span>
                                </div>

                                {/* Service */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: svcColor, flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: 13, fontWeight: 600, color: svcColor,
                                    }}>{booking.service?.name || '—'}</span>
                                </div>

                                {/* Date */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13 }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                                    </svg>
                                    {new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>

                                {/* Status */}
                                <div>
                                    <span style={statusBadge(booking.status)}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                    <button
                                        title="View Details"
                                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                        style={actionBtn}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                    <button title="Edit" style={actionBtn}>
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
                        borderTop: `1px solid ${brand.border}`,
                    }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Showing {meta.from}–{meta.to} of {meta.total} entries
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <PaginationBtn label="‹" active={false} disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
                            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map(p => (
                                <PaginationBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
                            ))}
                            {meta.last_page > 5 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            {meta.last_page > 5 && (
                                <PaginationBtn label={meta.last_page} active={page === meta.last_page} onClick={() => setPage(meta.last_page)} />
                            )}
                            <PaginationBtn label="›" active={false} disabled={page >= meta.last_page} onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const actionBtn = {
    width: 32, height: 32, borderRadius: 10,
    border: `1.5px solid ${brand.border}`, background: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b', transition: 'all 0.15s',
};

function PaginationBtn({ label, active, disabled, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: 34, height: 34, borderRadius: 10,
                border: active ? 'none' : `1.5px solid ${brand.border}`,
                background: active ? `linear-gradient(135deg, ${brand.navy} 0%, ${brand.midBlue} 100%)` : '#fff',
                color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 2px 8px rgba(10,35,66,0.2)' : 'none',
            }}
        >{label}</button>
    );
}
