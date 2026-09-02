import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const statusColors = {
    pending: { color: '#f59e0b', bg: '#fef3c7' },
    confirmed: { color: '#3b82f6', bg: '#dbeafe' },
    completed: { color: '#10b981', bg: '#d1fae5' },
    cancelled: { color: '#ef4444', bg: '#fee2e2' },
};

const statusFlow = ['pending', 'confirmed', 'completed', 'cancelled'];

const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchBooking(); }, [id]);

    const fetchBooking = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bookings/${id}`);
            const b = res.data.data || res.data;
            setBooking(b);
            setSelectedStatus(b.status);
        } catch (err) {
            console.error('Booking fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (selectedStatus === booking.status) return;
        setSaving(true);
        try {
            await api.patch(`/bookings/${id}/status`, { status: selectedStatus });
            setBooking(prev => ({ ...prev, status: selectedStatus }));
            showToast('Booking status updated successfully!', 'success');
        } catch (err) {
            console.error('Status update error:', err);
            showToast('Failed to update status.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: '#64748b', fontSize: 16 }}>Loading booking details...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 80 }}>
                <h2 style={{ color: '#1a1f37' }}>Booking not found</h2>
                <button onClick={() => navigate('/admin/bookings')} style={btnStyle('secondary')}>← Back to Bookings</button>
            </div>
        );
    }

    const sc = statusColors[booking.status] || statusColors.pending;
    const initials = booking.client?.name
        ? booking.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';
    const avatarColor = avatarColors[booking.id % avatarColors.length];
    const bookingIdStr = `#${String(booking.id).padStart(4, '0')}`;
    const preferredDate = booking.preferred_date
        ? new Date(booking.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const createdAt = booking.created_at
        ? new Date(booking.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    animation: 'slideIn 0.2s ease',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button
                    onClick={() => navigate('/admin/bookings')}
                    style={{
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                        padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        gap: 6, color: '#64748b', fontSize: 14, fontWeight: 500,
                    }}
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>
                        Booking {bookingIdStr}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '2px 0 0' }}>
                        Submitted on {createdAt}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        color: sc.color, background: sc.bg,
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.color }} />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Client Info Card */}
                    <Card title="Client Information">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', background: avatarColor,
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, fontWeight: 700, flexShrink: 0,
                            }}>{initials}</div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1f37' }}>{booking.client?.name || '—'}</div>
                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Client Account</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <InfoField icon="📞" label="Contact Number" value={booking.client?.contact_number || '—'} />
                            <InfoField icon="✉️" label="Email" value={booking.client?.email || '—'} />
                            <InfoField icon="📍" label="Address" value={booking.client?.address || '—'} />
                        </div>
                    </Card>

                    {/* Booking Details Card */}
                    <Card title="Booking Details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <InfoField icon="🧹" label="Service" value={booking.service?.name || '—'} />
                            <InfoField icon="📅" label="Preferred Date" value={preferredDate} />
                            <InfoField icon="🆔" label="Booking ID" value={bookingIdStr} />
                            <InfoField icon="⚙️" label="Processed By"
                                value={booking.processed_by?.name || 'Not yet assigned'} />
                        </div>
                        {booking.notes && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                    NOTES
                                </div>
                                <div style={{
                                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                                    padding: '12px 14px', fontSize: 14, color: '#374151', lineHeight: 1.6,
                                }}>
                                    {booking.notes}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Booking Items (if any details) */}
                    {booking.details && booking.details.length > 0 && (
                        <Card title="Booking Items">
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px',
                                    padding: '12px 16px', background: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700,
                                    color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8,
                                }}>
                                    <span>SERVICE</span><span>QTY</span><span>UNIT PRICE</span><span>TOTAL</span>
                                </div>
                                {booking.details.map((d, i) => (
                                    <div key={i} style={{
                                        display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px',
                                        padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                                        fontSize: 14, color: '#1a1f37',
                                    }}>
                                        <span>{d.service?.name || '—'}</span>
                                        <span>{d.quantity}</span>
                                        <span>₱{Number(d.unit_price).toLocaleString()}</span>
                                        <span style={{ fontWeight: 600 }}>₱{Number(d.total_price).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Status Update Card */}
                    <Card title="Update Status">
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 16 }}>
                            Change the booking status to reflect the current state.
                        </p>

                        {/* Status flow visual */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {statusFlow.map((s, i) => {
                                const sc2 = statusColors[s];
                                const isCurrent = booking.status === s;
                                const isPast = statusFlow.indexOf(booking.status) > i && s !== 'cancelled';
                                return (
                                    <div key={s} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 14px', borderRadius: 8,
                                        border: `1px solid ${isCurrent ? sc2.color : '#e2e8f0'}`,
                                        background: isCurrent ? sc2.bg : '#fafbfc',
                                        opacity: isPast ? 0.5 : 1,
                                    }}>
                                        <div style={{
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: isCurrent || isPast ? sc2.color : '#e2e8f0',
                                            border: `2px solid ${isCurrent ? sc2.color : '#e2e8f0'}`,
                                        }} />
                                        <span style={{
                                            fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                                            color: isCurrent ? sc2.color : '#64748b',
                                            flex: 1, textTransform: 'capitalize',
                                        }}>{s}</span>
                                        {isCurrent && <span style={{ fontSize: 11, color: sc2.color, fontWeight: 600 }}>CURRENT</span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Status Dropdown */}
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                            Set New Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 8,
                                border: '1px solid #e2e8f0', fontSize: 14, color: '#1a1f37',
                                background: '#fff', marginBottom: 14, cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            {statusFlow.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleStatusUpdate}
                            disabled={saving || selectedStatus === booking.status}
                            style={{
                                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                                background: selectedStatus === booking.status ? '#e2e8f0' : '#3b82f6',
                                color: selectedStatus === booking.status ? '#94a3b8' : '#fff',
                                fontSize: 14, fontWeight: 600, cursor: selectedStatus === booking.status ? 'default' : 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {saving ? 'Saving...' : 'Update Status'}
                        </button>
                    </Card>

                    {/* Quick Info Card */}
                    <Card title="Booking Summary">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <SummaryRow label="Booking ID" value={bookingIdStr} highlight />
                            <SummaryRow label="Service" value={booking.service?.name || '—'} />
                            <SummaryRow label="Preferred Date" value={booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
                            <SummaryRow label="Client" value={booking.client?.name || '—'} />
                            <SummaryRow label="Contact" value={booking.client?.contact_number || '—'} />
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                                <SummaryRow label="Date Submitted" value={createdAt} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ── Sub-components ──────────────────────────────────── */

function Card({ title, children }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37', margin: '0 0 20px' }}>{title}</h3>
            {children}
        </div>
    );
}

function InfoField({ icon, label, value }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: 14, color: '#1a1f37', fontWeight: 500 }}>{value}</div>
        </div>
    );
}

function SummaryRow({ label, value, highlight }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
            <span style={{
                fontSize: 13, fontWeight: 600,
                color: highlight ? '#3b82f6' : '#1a1f37',
                background: highlight ? '#eff6ff' : 'transparent',
                padding: highlight ? '2px 10px' : 0,
                borderRadius: highlight ? 6 : 0,
            }}>{value}</span>
        </div>
    );
}

function btnStyle(variant) {
    return {
        padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: 'pointer', border: variant === 'secondary' ? '1px solid #e2e8f0' : 'none',
        background: variant === 'secondary' ? '#fff' : '#3b82f6',
        color: variant === 'secondary' ? '#374151' : '#fff',
    };
}
