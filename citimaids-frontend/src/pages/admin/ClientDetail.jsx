import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, card, pageTitle, pageSubtitle, solidBtn as solidBtnToken, outlineBtn as outlineBtnToken, inputStyle as inputStyleToken, avatar } from './adminStyles';
import { formatWhatsAppPhone } from '../../utils/whatsapp';

export default function ClientDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    // Edit Modal state
    const [editModal, setEditModal] = useState(false);
    const [form, setForm] = useState({ name: '', contact_number: '', email: '', address: '' });
    const [formLoading, setFormLoading] = useState(false);

    // Quick Action Template Modals
    const [waModal, setWaModal] = useState(false);
    const [emailModal, setEmailModal] = useState(false);

    useEffect(() => { fetchClient(); }, [id]);

    const fetchClient = () => {
        setLoading(true);
        api.get(`/clients/${id}`)
            .then(res => {
                setClient(res.data);
                setForm({
                    name: res.data.name || '',
                    contact_number: res.data.contact_number || '',
                    email: res.data.email || '',
                    address: res.data.address || ''
                });
            })
            .catch(() => setError('Failed to load client.'))
            .finally(() => setLoading(false));
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const res = await api.put(`/clients/${id}`, form);
            // Refresh full client data to also update booking list
            await fetchClient();
            setEditModal(false);
            showToast('Client updated successfully.', 'success');
        } catch {
            showToast('Failed to update client.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCopy = (text, label) => {
        if (!text || text === '—') {
            showToast(`No ${label.toLowerCase()} registered for this client.`, 'error');
            return;
        }
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`, 'success');
    };

    const handleOpenWhatsApp = (customText) => {
        if (!client?.contact_number || client.contact_number.trim() === '') {
            showToast('No contact number registered for this client.', 'error');
            return;
        }
        const formattedPhone = formatWhatsAppPhone(client.contact_number);
        const defaultText = `Hello ${client.name}! Greetings from CitiMaids Cleaning Services Abu Dhabi. How can we assist you today?`;
        const textToSend = customText || defaultText;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(textToSend)}`, '_blank', 'noopener,noreferrer');
        showToast('Opening WhatsApp...', 'success');
    };

    const handleOpenEmail = (customSubject, customBody) => {
        if (!client?.email || client.email.trim() === '') {
            showToast('No email address registered for this client.', 'error');
            return;
        }
        const subject = customSubject || `CitiMaids Support - Greetings ${client.name}`;
        const body = customBody || `Dear ${client.name},\n\nGreetings from CitiMaids Cleaning Services Abu Dhabi.\n\nBest regards,\nCitiMaids Management`;
        window.location.href = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        showToast('Opening Mail client...', 'success');
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ color: brand.navy, fontSize: 15, fontWeight: 700, fontFamily: fonts.heading }}>
                Loading Client Details...
            </div>
        </div>
    );

    if (error || !client) return (
        <div style={{ textAlign: 'center', padding: 80 }}>
            <h2 style={{ color: brand.navy, fontFamily: fonts.heading }}>{error || 'Client not found'}</h2>
            <button onClick={() => navigate('/admin/clients')} style={outlineBtnToken}>
                ← Back to Clients
            </button>
        </div>
    );

    const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669', '#0891b2', '#dc2626'];
    const avatarColor = avatarColors[client.id % avatarColors.length];
    
    // Stats
    const totalBookings = client.bookings?.length || 0;
    const completedBookings = client.bookings?.filter(b => b.status === 'completed').length || 0;
    const cancelledBookings = client.bookings?.filter(b => b.status === 'cancelled').length || 0;

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

            {/* Edit Modal */}
            {editModal && (
                <Modal onClose={() => setEditModal(false)} title="Edit Client Details">
                    <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <FormField label="Full Name" required>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Mohammed Al Mansoori" style={inputStyleToken} />
                        </FormField>
                        <FormField label="Contact Number">
                            <input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })}
                                placeholder="+971 50 000 0000" style={inputStyleToken} />
                        </FormField>
                        <FormField label="Email">
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="client@email.com" style={inputStyleToken} />
                        </FormField>
                        <FormField label="Address">
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                placeholder="Al Reem Island, Abu Dhabi" style={inputStyleToken} />
                        </FormField>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <HoverButton type="button" onClick={() => setEditModal(false)} base={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }} hoverStyle={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: brand.navy }}>Cancel</HoverButton>
                            <HoverButton type="submit" disabled={formLoading} base={{ ...solidBtnToken, flex: 1, justifyContent: 'center', opacity: formLoading ? 0.6 : 1 }} hoverStyle={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(10,35,66,0.28)' }}>
                                {formLoading ? 'Saving...' : 'Save Changes'}
                            </HoverButton>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <BackBtn onClick={() => navigate('/admin/clients')} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 style={pageTitle}>{client.name}</h1>
                    </div>
                    <p style={pageSubtitle}>Client #{String(client.id).padStart(3, '0')}</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <HoverButton
                        onClick={() => setEditModal(true)}
                        base={solidBtnToken}
                        hoverStyle={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(10,35,66,0.28)' }}
                    >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Client
                    </HoverButton>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, alignItems: 'start' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Client Information */}
                    <div style={{ ...card, padding: '26px 28px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 20px', fontFamily: fonts.heading }}>
                            Contact Information
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${brand.border}` }}>
                            <div style={avatar(avatarColor, 52)}>{initials}</div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                                    {client.name}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                                    Joined on {new Date(client.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                                value={client.contact_number || '—'}
                                onCopy={() => handleCopy(client.contact_number, 'Contact Number')}
                            />
                            <FieldItem
                                icon={
                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                                label="Email Address"
                                value={client.email || '—'}
                                onCopy={() => handleCopy(client.email, 'Email Address')}
                            />
                            <div style={{ gridColumn: 'span 2' }}>
                                <FieldItem
                                    icon={
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" />
                                        </svg>
                                    }
                                    label="Saved Address"
                                    value={client.address || '—'}
                                    onCopy={() => handleCopy(client.address, 'Saved Address')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking History */}
                    <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: 0, fontFamily: fonts.heading }}>
                                Booking History
                            </h3>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: brand.softBg, padding: '4px 10px', borderRadius: 20 }}>
                                {totalBookings} Total
                            </span>
                        </div>
                        
                        {!client.bookings || client.bookings.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                No bookings found for this client.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {client.bookings.map((booking, i) => {
                                    const statusColor = {
                                        pending: { bg: '#fef9c3', text: '#854d0e' },
                                        confirmed: { bg: '#dbeafe', text: '#1e40af' },
                                        completed: { bg: '#dcfce7', text: '#166534' },
                                        cancelled: { bg: '#fee2e2', text: '#991b1b' },
                                    }[booking.status] || { bg: '#f1f5f9', text: '#475569' };

                                    return (
                                        <div key={booking.id} style={{
                                            display: 'grid', gridTemplateColumns: '80px 1fr 140px 110px 80px',
                                            padding: '16px 24px', borderBottom: i < client.bookings.length - 1 ? `1px solid ${brand.border}` : 'none',
                                            alignItems: 'center', gap: 16, transition: 'background 0.15s'
                                        }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>#{String(booking.id).padStart(4, '0')}</span>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: brand.navy }}>{booking.service?.name || 'Service'}</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.address || '—'}</div>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                                                {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </div>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px',
                                                borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                background: statusColor.bg, color: statusColor.text,
                                                textTransform: 'capitalize',
                                            }}>
                                                {booking.status}
                                            </span>
                                            <HoverButton
                                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                base={{ ...outlineBtnToken, fontSize: 12, padding: '6px 12px', justifyContent: 'center' }}
                                                hoverStyle={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', transform: 'translateY(-1px)' }}
                                            >
                                                View
                                            </HoverButton>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Activity Overview */}
                    <div style={{ ...card, padding: '26px' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: brand.navy, margin: '0 0 20px', fontFamily: fonts.heading }}>
                            Activity Overview
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 12, border: `1px solid ${brand.border}`, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading, lineHeight: 1 }}>{totalBookings}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6 }}>Total Bookings</div>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#166534', fontFamily: fonts.heading, lineHeight: 1 }}>{completedBookings}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6 }}>Completed</div>
                            </div>
                            {cancelledBookings > 0 && (
                                <div style={{ gridColumn: 'span 2', background: '#fef2f2', padding: '12px 16px', borderRadius: 12, border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.6 }}>Cancelled Bookings</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#991b1b', fontFamily: fonts.heading }}>{cancelledBookings}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            <strong>Customer Value Insights:</strong> This customer prefers {client.bookings?.length > 0 ? (client.bookings[0]?.service?.name || 'our services') : 'our services'} and has a good track record. Keep them engaged!
                        </div>
                    </div>

            {/* WhatsApp Templates Modal */}
            {waModal && (
                <Modal onClose={() => setWaModal(false)} title="Select WhatsApp Template">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>
                            Choose a pre-formatted message to send to <strong>{client.name}</strong> ({client.contact_number ? formatWhatsAppPhone(client.contact_number) : 'N/A'}):
                        </p>

                        {[
                            {
                                title: '💬 General Support & Care',
                                text: `Hello ${client.name}! Greetings from CitiMaids Cleaning Services Abu Dhabi. How may we assist you today?`
                            },
                            {
                                title: '📅 Schedule Next Cleaning',
                                text: `Hello ${client.name}! We noticed it might be time for your next regular cleaning visit. Would you like to reserve a slot with CitiMaids this week?`
                            },
                            {
                                title: '⭐ Service Quality & Feedback',
                                text: `Hello ${client.name}! Thank you for choosing CitiMaids. We hope your space is sparkling clean and fresh! How was your recent cleaning service?`
                            },
                            {
                                title: '💳 Invoice & Billing Follow-up',
                                text: `Hello ${client.name}! Greetings from CitiMaids Accounts team. We are following up regarding your account invoice and payment status.`
                            }
                        ].map((tpl, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px 14px', borderRadius: 12, background: '#f0fdf4',
                                    border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 6
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{tpl.title}</div>
                                <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', background: '#fff', padding: 8, borderRadius: 8, border: '1px solid #dcfce7' }}>
                                    "{tpl.text}"
                                </div>
                                <button
                                    onClick={() => {
                                        setWaModal(false);
                                        handleOpenWhatsApp(tpl.text);
                                    }}
                                    style={{
                                        alignSelf: 'flex-end', padding: '6px 12px', borderRadius: 8,
                                        background: '#16a34a', color: '#fff', border: 'none',
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        boxShadow: '0 2px 6px rgba(22,163,74,0.2)'
                                    }}
                                >
                                    Send on WhatsApp ➔
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setWaModal(false)}
                            style={{ ...outlineBtnToken, marginTop: 8, justifyContent: 'center' }}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            {/* Email Templates & Tools Modal */}
            {emailModal && (
                <Modal onClose={() => setEmailModal(false)} title="Select Email Action & Template">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>
                            Send formatted email to <strong>{client.email || 'N/A'}</strong>:
                        </p>

                        <button
                            onClick={() => handleCopy(client.email, 'Email Address')}
                            style={{
                                padding: '10px 14px', borderRadius: 10, background: '#f8fafc',
                                border: `1px solid ${brand.border}`, fontSize: 13, fontWeight: 600,
                                color: brand.navy, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                        >
                            <span>📋 Copy Email Address ({client.email})</span>
                            <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>Copy</span>
                        </button>

                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
                            Email Message Templates
                        </div>

                        {[
                            {
                                title: '✉️ General Support Inquiry',
                                subject: `CitiMaids Cleaning Services - Support Inquiry`,
                                body: `Dear ${client.name},\n\nGreetings from CitiMaids Abu Dhabi. Please let us know if you have any questions or require support regarding our services.\n\nBest regards,\nCitiMaids Customer Care`
                            },
                            {
                                title: '🗓️ Schedule Next Cleaning Visit',
                                subject: `CitiMaids - Schedule Your Next Cleaning Visit`,
                                body: `Dear ${client.name},\n\nWe hope your home is feeling fresh and clean! Contact us anytime to reserve your next cleaning appointment.\n\nBest regards,\nCitiMaids Team`
                            },
                            {
                                title: '⭐ Feedback & Quality Review',
                                subject: `CitiMaids - We'd Love Your Feedback!`,
                                body: `Dear ${client.name},\n\nThank you for choosing CitiMaids! We value your feedback on our service.\n\nBest regards,\nCitiMaids Service Team`
                            }
                        ].map((tpl, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px 14px', borderRadius: 12, background: '#eff6ff',
                                    border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: 6
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>{tpl.title}</div>
                                <div style={{ fontSize: 12, color: '#1e293b', fontWeight: 600 }}>Subject: {tpl.subject}</div>
                                <button
                                    onClick={() => {
                                        setEmailModal(false);
                                        handleOpenEmail(tpl.subject, tpl.body);
                                    }}
                                    style={{
                                        alignSelf: 'flex-end', padding: '6px 12px', borderRadius: 8,
                                        background: '#2563eb', color: '#fff', border: 'none',
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                                    }}
                                >
                                    Open Mail App ➔
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setEmailModal(false)}
                            style={{ ...outlineBtnToken, marginTop: 8, justifyContent: 'center' }}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

                    {/* Quick Actions Card */}
                    <div style={{ ...card, padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: '#eff6ff', color: '#2563eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: brand.navy, margin: 0, fontFamily: fonts.heading }}>
                                Quick Actions
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Primary WhatsApp Action */}
                            <QuickActionButton
                                variant="whatsapp"
                                onClick={() => handleOpenWhatsApp()}
                                icon={
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                                    </svg>
                                }
                                label="Message via WhatsApp"
                                badge={client.contact_number ? formatWhatsAppPhone(client.contact_number) : 'Not Provided'}
                            />

                            {/* WhatsApp Template Selector Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!client.contact_number || client.contact_number.trim() === '') {
                                        showToast('No contact number registered for this client.', 'error');
                                    } else {
                                        setWaModal(true);
                                    }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    color: '#15803d', background: '#f0fdf4', border: '1px dashed #86efac',
                                    cursor: 'pointer', transition: 'all 0.15s', width: '100%'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    💬 Select WhatsApp Template
                                </span>
                                <span>➔</span>
                            </button>

                            {/* Primary Email Action */}
                            <QuickActionButton
                                variant="email"
                                onClick={() => handleOpenEmail()}
                                icon={
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                                label="Send Email"
                                badge={client.email || 'Not Provided'}
                            />

                            {/* Email Template Selector Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!client.email || client.email.trim() === '') {
                                        showToast('No email address registered for this client.', 'error');
                                    } else {
                                        setEmailModal(true);
                                    }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    color: '#1d4ed8', background: '#eff6ff', border: '1px dashed #93c5fd',
                                    cursor: 'pointer', transition: 'all 0.15s', width: '100%'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    ✉️ Select Email Template & Copy
                                </span>
                                <span>➔</span>
                            </button>
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
                <span style={{ color: '#2563eb' }}>{icon}</span>
                {label}
            </div>
            <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>
                {value}
            </div>
        </div>
    );
}

function Modal({ children, onClose, title }) {
    const [closeHover, setCloseHover] = useState(false);
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,20,41,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(10,35,66,0.2)' }}>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        onMouseEnter={() => setCloseHover(true)}
                        onMouseLeave={() => setCloseHover(false)}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            width: 32, height: 32, borderRadius: 10,
                            border: 'none', background: closeHover ? '#f1f5f9' : 'transparent',
                            color: closeHover ? '#0f172a' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                {title && <h3 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>}
                {children}
            </div>
        </div>
    );
}

function FormField({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function HoverButton({ children, onClick, base, hoverStyle }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ ...base, ...(hovered ? hoverStyle : {}), transition: 'all 0.15s' }}
        >
            {children}
        </button>
    );
}

function QuickActionButton({ onClick, icon, label, variant, badge }) {
    const [hovered, setHovered] = useState(false);
    const isWa = variant === 'whatsapp';
    
    const baseStyle = isWa ? {
        background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d'
    } : {
        background: '#f8fafc', border: `1px solid ${brand.border}`, color: brand.navy
    };

    const hoverStyle = isWa ? {
        background: '#dcfce7', border: '1px solid #86efac', color: '#166534',
        transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(22,101,52,0.15)'
    } : {
        background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
        transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(37,99,235,0.15)'
    };

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
                transition: 'all 0.15s', textAlign: 'left',
                ...baseStyle,
                ...(hovered ? hoverStyle : {})
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon}
                <span>{label}</span>
            </div>
            {badge && (
                <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                    background: isWa ? 'rgba(22,101,52,0.1)' : 'rgba(15,23,42,0.06)',
                    color: isWa ? '#166534' : '#64748b', maxWidth: 140,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function BackBtn({ onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: hovered ? '#2563eb' : '#64748b',
                background: 'none', border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8,
                transition: 'color 0.15s',
            }}
        >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clients
        </button>
    );
}
