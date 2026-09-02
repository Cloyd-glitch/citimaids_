import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function Clients() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [form, setForm] = useState({ name: '', contact_number: '', email: '', address: '' });
    const [formLoading, setFormLoading] = useState(false);
    const searchTimer = useRef(null);

    useEffect(() => { fetchClients(); }, [page]);
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setPage(1); fetchClients(); }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params = { page };
            if (search) params.search = search;
            const res = await api.get('/clients', { params });
            setClients(res.data.data || []);
            setMeta(res.data);
        } catch (err) {
            console.error('Clients fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/clients/${deleteModal.id}`);
            setDeleteModal(null);
            showToast('Client deleted successfully.', 'success');
            fetchClients();
        } catch {
            showToast('Failed to delete client.', 'error');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post('/clients', form);
            setAddModal(false);
            setForm({ name: '', contact_number: '', email: '', address: '' });
            showToast('Client added successfully.', 'success');
            fetchClients();
        } catch {
            showToast('Failed to add client.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const totalPages = meta.last_page || 1;
    const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}>{toast.msg}</div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <Modal onClose={() => setDeleteModal(null)}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f37', margin: '0 0 8px' }}>Delete Client?</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal(null)} style={outlineBtn}>Cancel</button>
                            <button onClick={handleDelete} style={{ ...solidBtn, background: '#ef4444' }}>Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add Client Modal */}
            {addModal && (
                <Modal onClose={() => setAddModal(false)} title="Add New Client">
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <FormField label="Full Name" required>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Juan Dela Cruz" style={inputStyle} />
                        </FormField>
                        <FormField label="Contact Number">
                            <input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })}
                                placeholder="+63 917 123 4567" style={inputStyle} />
                        </FormField>
                        <FormField label="Email">
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="juan@email.com" style={inputStyle} />
                        </FormField>
                        <FormField label="Address">
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                placeholder="123 Clean St, Manila" style={inputStyle} />
                        </FormField>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button type="button" onClick={() => setAddModal(false)} style={{ ...outlineBtn, flex: 1 }}>Cancel</button>
                            <button type="submit" disabled={formLoading} style={{ ...solidBtn, flex: 1 }}>
                                {formLoading ? 'Saving...' : 'Add Client'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Clients</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                        Manage all clients — <strong>{meta.total || 0}</strong> total
                    </p>
                </div>
                <button onClick={() => setAddModal(true)} style={solidBtn}>
                    + Add Client
                </button>
            </div>

            {/* Search & Actions */}
            <div style={{ display: 'flex', gap: 10, margin: '20px 0 16px' }}>
                <div style={{
                    flex: 1, maxWidth: 380, display: 'flex', alignItems: 'center',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 14px',
                }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search client by name, phone, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', padding: '11px 10px', fontSize: 14, width: '100%', background: 'transparent' }}
                    />
                </div>
                <IconBtn label="Filters" icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 4h18M7 8h10M10 12h4" /></svg>} />
                <IconBtn label="Export" icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>} />
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={tableHeaderStyle}>
                    <span style={{ width: 36 }}><input type="checkbox" style={{ cursor: 'pointer' }} /></span>
                    <ColHead>CLIENT</ColHead>
                    <ColHead>CONTACT</ColHead>
                    <ColHead>EMAIL</ColHead>
                    <ColHead>TOTAL BOOKINGS</ColHead>
                    <ColHead>LAST BOOKING</ColHead>
                    <ColHead>ACTIONS</ColHead>
                </div>

                {/* Body */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading clients...</div>
                ) : clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                        <div>No clients found</div>
                    </div>
                ) : (
                    clients.map((client, idx) => {
                        const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        const color = avatarColors[idx % avatarColors.length];
                        const bookingCount = client.bookings_count ?? (client.bookings?.length ?? 0);
                        const lastBooking = client.last_booking_date
                            ? new Date(client.last_booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—';
                        return (
                            <div key={client.id} style={tableRowStyle}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                <span style={{ width: 36 }}><input type="checkbox" style={{ cursor: 'pointer' }} /></span>
                                {/* Client */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%', background: color,
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                                    }}>{initials}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1f37' }}>{client.name}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>C{String(client.id).padStart(3, '0')}</div>
                                    </div>
                                </div>
                                {/* Contact */}
                                <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    📞 {client.contact_number || '—'}
                                </div>
                                {/* Email */}
                                <div style={{ fontSize: 13, color: '#3b82f6' }}>{client.email || '—'}</div>
                                {/* Bookings */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {Array.from({ length: Math.min(bookingCount, 5) }).map((_, i) => (
                                            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.8 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1f37' }}>{bookingCount}</span>
                                </div>
                                {/* Last Booking */}
                                <div style={{ fontSize: 13, color: '#64748b' }}>{lastBooking}</div>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <ActionBtn title="View" onClick={() => navigate(`/admin/clients/${client.id}`)} icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    } />
                                    <ActionBtn title="Edit" icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    } />
                                    <ActionBtn title="Delete" danger onClick={() => setDeleteModal(client)} icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                    } />
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Showing {meta.from}–{meta.to} of {meta.total} clients
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <PageBtn label="‹" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
                            {pageNums.map(p => <PageBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />)}
                            {totalPages > 5 && <><span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span><PageBtn label={totalPages} active={page === totalPages} onClick={() => setPage(totalPages)} /></>}
                            <PageBtn label="›" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Shared Sub-components ───────────────────────── */

function Modal({ children, onClose, title }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                {title && <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#1a1f37' }}>{title}</h3>}
                {children}
            </div>
        </div>
    );
}

function FormField({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function ColHead({ children }) {
    return <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>{children}</span>;
}

function ActionBtn({ title, onClick, icon, danger }) {
    return (
        <button title={title} onClick={onClick} style={{
            width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#ef4444' : '#64748b',
        }}>{icon}</button>
    );
}

function IconBtn({ label, icon }) {
    return (
        <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 14, color: '#374151', cursor: 'pointer',
        }}>{icon}{label}</button>
    );
}

function PageBtn({ label, active, disabled, onClick }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            minWidth: 32, height: 32, borderRadius: 6, fontSize: 13, fontWeight: active ? 700 : 500,
            border: active ? 'none' : '1px solid #e2e8f0',
            background: active ? '#3b82f6' : '#fff',
            color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{label}</button>
    );
}

const tableHeaderStyle = {
    display: 'grid', gridTemplateColumns: '36px 1.5fr 1fr 1.2fr 120px 120px 100px',
    padding: '13px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc',
    alignItems: 'center', gap: 12,
};

const tableRowStyle = {
    display: 'grid', gridTemplateColumns: '36px 1.5fr 1fr 1.2fr 120px 120px 100px',
    padding: '14px 24px', borderBottom: '1px solid #f1f5f9',
    alignItems: 'center', gap: 12, transition: 'background 0.1s',
};

const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, color: '#1a1f37', outline: 'none', boxSizing: 'border-box',
};

const solidBtn = {
    background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
};

const outlineBtn = {
    background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
