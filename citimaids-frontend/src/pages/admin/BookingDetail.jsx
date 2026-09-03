import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn, outlineBtn, statusBadge, idBadge, avatar } from './adminStyles';

const statusFlow = ['pending', 'confirmed', 'completed', 'cancelled'];
const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669', '#0891b2'];

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
                <div style={{ color: brand.navy, fontSize: 15, fontWeight: 700, fontFamily: fonts.heading }}>
                    Loading Booking Details...
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <h2 style={{ color: brand.navy, fontFamily: fonts.heading }}>Booking not found</h2>
                <button onClick={() => navigate('/admin/bookings')} style={outlineBtn}>
                    ← Back to Bookings
                </button>
            </div>
        );
    }

    const initials = booking.client?.name
        ? booking.client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'CM';
    const avatarColor = avatarColors[booking.id % avatarColors.length];
    const bookingIdStr = `#${String(booking.id).padStart(4, '0')}`;
    const preferredDate = booking.preferred_date
        ? new Date(booking.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
    const createdAt = booking.created_at
        ? new Date(booking.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '14px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                    background: toast.type === 'success' ? '#059669' : '#dc2626', color: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        {toast.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            color: '#64748b', background: 'none', border: 'none',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8,
                        }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Bookings
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 style={pageTitle}>Booking {bookingIdStr}</h1>
                        <span style={statusBadge(booking.status)}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                    </div>
                    <p style={pageSubtitle}>Submitted on {createdAt}</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => window.print()} style={outlineBtn}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Manifest
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Client Information */}
                    <div style={{ ...card, padding: '26px 28px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 20px', fontFamily: fonts.heading }}>
                            Client Information
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${brand.border}` }}>
                            <div style={avatar(avatarColor, 52)}>{initials}</div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                                    {booking.client?.name || 'Client Name'}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                                    Registered Client Account · Abu Dhabi
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                                label="Contact Number"
                                value={booking.client?.contact_number || '—'}
                            />
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                                label="Email Address"
                                value={booking.client?.email || '—'}
                            />
                            <div style={{ gridColumn: 'span 2' }}>
                                <FieldItem
                                    icon={
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                                        </svg>
                                    }
                                    label="Service Address"
                                    value={booking.client?.address || '—'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div style={{ ...card, padding: '26px 28px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 20px', fontFamily: fonts.heading }}>
                            Service & Schedule
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                }
                                label="Selected Service"
                                value={booking.service?.name || 'Home Cleaning'}
                            />
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                                    </svg>
                                }
                                label="Preferred Schedule"
                                value={preferredDate}
                            />
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                }
                                label="Booking Reference"
                                value={bookingIdStr}
                            />
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                                label="Assigned Specialist"
                                value={booking.processed_by?.name || 'Operations Dispatch Queue'}
                            />
                        </div>

                        {booking.notes && (
                            <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${brand.border}` }}>
                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                                    Access & Instructions
                                </div>
                                <div style={{
                                    background: brand.softBg,
                                    border: `1px solid ${brand.border}`,
                                    borderRadius: 12,
                                    padding: '14px 16px',
                                    fontSize: 13.5,
                                    color: brand.navy,
                                    lineHeight: 1.6,
                                }}>
                                    {booking.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Status Management Card */}
                    <div style={{ ...card, padding: '26px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 12px', fontFamily: fonts.heading }}>
                            Workflow & Status
                        </h3>
                        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px', lineHeight: 1.5 }}>
                            Update the dispatch stage to notify customer and field team.
                        </p>

                        {/* Status flow tracker */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {statusFlow.map((s, i) => {
                                const isCurrent = booking.status === s;
                                const isPast = statusFlow.indexOf(booking.status) > i && s !== 'cancelled';
                                return (
                                    <div
                                        key={s}
                                        onClick={() => setSelectedStatus(s)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px', borderRadius: 12,
                                            border: `1.5px solid ${isCurrent ? brand.navy : brand.border}`,
                                            background: isCurrent ? '#eff6ff' : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <div style={{
                                            width: 12, height: 12, borderRadius: '50%',
                                            background: isCurrent ? brand.navy : isPast ? '#34d399' : '#e2e8f0',
                                        }} />
                                        <span style={{
                                            fontSize: 13, fontWeight: isCurrent ? 800 : 600,
                                            color: isCurrent ? brand.navy : '#64748b',
                                            flex: 1, textTransform: 'capitalize',
                                        }}>{s}</span>
                                        {isCurrent && (
                                            <span style={{ fontSize: 10, color: brand.royal, fontWeight: 800, background: '#dbeafe', padding: '2px 8px', borderRadius: 6 }}>
                                                CURRENT
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleStatusUpdate}
                            disabled={saving || selectedStatus === booking.status}
                            style={{
                                ...solidBtn,
                                width: '100%',
                                justifyContent: 'center',
                                padding: '12px',
                                opacity: selectedStatus === booking.status ? 0.5 : 1,
                                cursor: selectedStatus === booking.status ? 'default' : 'pointer',
                            }}
                        >
                            {saving ? 'Updating...' : 'Save New Status'}
                        </button>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ ...card, padding: '24px' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: brand.navy, margin: '0 0 16px', fontFamily: fonts.heading }}>
                            Estimated Charges
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                <span>Service Rate</span>
                                <span style={{ fontWeight: 700, color: brand.navy }}>
                                    AED {booking.service?.base_price ? Number(booking.service.base_price).toLocaleString() : '35'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                <span>Inspection Guarantee</span>
                                <span style={{ fontWeight: 700, color: '#059669' }}>Free</span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderTop: `1px solid ${brand.border}`, paddingTop: 12, marginTop: 4,
                            }}>
                                <span style={{ fontWeight: 700, color: brand.navy }}>Total Due Upon Completion</span>
                                <span style={{ fontSize: 18, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                                    AED {booking.service?.base_price ? Number(booking.service.base_price).toLocaleString() : '35'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FieldItem({ icon, label, value }) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                <span style={{ color: brand.royal }}>{icon}</span>
                {label}
            </div>
            <div style={{ fontSize: 14, color: brand.navy, fontWeight: 600 }}>
                {value}
            </div>
        </div>
    );
}
