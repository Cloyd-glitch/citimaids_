import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, card, pageTitle, pageSubtitle, solidBtn as solidBtnToken, outlineBtn as outlineBtnToken, inputStyle as inputStyleToken } from './adminStyles';

export default function ClientDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/clients/${id}`)
            .then(res => setClient(res.data))
            .catch(() => setError('Failed to load client.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, fontFamily: fonts.body }}>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading client...</div>
        </div>
    );

    if (error || !client) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, fontFamily: fonts.body }}>
            <div style={{ color: '#dc2626', fontSize: 14 }}>{error || 'Client not found.'}</div>
        </div>
    );

    const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Back */}
            <button
                onClick={() => navigate('/admin/clients')}
                style={{ ...outlineBtnToken, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Clients
            </button>

            {/* Profile card */}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ ...pageTitle, marginBottom: 2 }}>{client.name}</h1>
                    <p style={pageSubtitle}>Client #{String(client.id).padStart(3, '0')}</p>
                </div>
            </div>

            {/* Contact info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Phone', value: client.contact_number || '—', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                    { label: 'Email', value: client.email || '—', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                    { label: 'Address', value: client.address || '—', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                    { label: 'Total Bookings', value: client.bookings?.length ?? 0, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                ].map(item => (
                    <div key={item.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: brand.navy }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bookings list */}
            <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${brand.border}`, fontWeight: 800, fontSize: 16, color: brand.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Booking History
                </div>
                {!client.bookings || client.bookings.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No bookings found for this client.</div>
                ) : (
                    client.bookings.map((booking, i) => {
                        const statusColor = {
                            pending: { bg: '#fef9c3', text: '#854d0e' },
                            confirmed: { bg: '#dbeafe', text: '#1e40af' },
                            completed: { bg: '#dcfce7', text: '#166534' },
                            cancelled: { bg: '#fee2e2', text: '#991b1b' },
                        }[booking.status] || { bg: '#f1f5f9', text: '#475569' };

                        return (
                            <div key={booking.id} style={{
                                display: 'grid', gridTemplateColumns: '80px 1fr 140px 120px 100px',
                                padding: '14px 24px', borderBottom: i < client.bookings.length - 1 ? `1px solid ${brand.border}` : 'none',
                                alignItems: 'center', gap: 16,
                            }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>#{String(booking.id).padStart(4, '0')}</span>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: brand.navy }}>{booking.service?.name || 'Service'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{booking.address || '—'}</div>
                                </div>
                                <div style={{ fontSize: 13, color: '#374151' }}>
                                    {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
                                    borderRadius: 20, fontSize: 11, fontWeight: 700,
                                    background: statusColor.bg, color: statusColor.text,
                                    textTransform: 'capitalize',
                                }}>
                                    {booking.status}
                                </span>
                                <button
                                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                    style={{ ...outlineBtnToken, fontSize: 12, padding: '6px 12px' }}
                                >
                                    View
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
