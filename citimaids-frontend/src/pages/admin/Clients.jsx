import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn as solidBtnToken, outlineBtn as outlineBtnToken, searchBar, searchInput, avatar as avatarToken, inputStyle as inputStyleToken } from './adminStyles';

const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#d97706', '#059669', '#0891b2', '#dc2626'];

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
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', contact_number: '', email: '', address: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [filterModal, setFilterModal] = useState(false);
    const [filters, setFilters] = useState({ sort_by: 'created_at', sort_dir: 'desc' });
    const searchTimer = useRef(null);

    useEffect(() => { fetchClients(); }, [page, filters]);
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setPage(1); fetchClients(); }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params = { page, sort_by: filters.sort_by, sort_dir: filters.sort_dir };
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

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Contact Number', 'Email', 'Address', 'Total Bookings', 'Joined Date'];
        const rows = clients.map(c => [
            `C${String(c.id).padStart(3, '0')}`,
            `"${c.name}"`,
            `"${c.contact_number || ''}"`,
            `"${c.email || ''}"`,
            `"${c.address || ''}"`,
            c.bookings_count || (c.bookings?.length || 0),
            new Date(c.created_at).toLocaleDateString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `citimaids_clients_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Clients exported successfully.', 'success');
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.put(`/clients/${editId}`, form);
            setEditModal(false);
            showToast('Client updated successfully.', 'success');
            fetchClients();
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

    const totalPages = meta.last_page || 1;
    const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

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

            {/* Delete Modal */}
            {deleteModal && (
                <Modal onClose={() => setDeleteModal(null)}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16, background: '#fee2e2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: '#dc2626',
                        }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: brand.navy, margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Client?</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal(null)} style={outlineBtnToken}>Cancel</button>
                            <button onClick={handleDelete} style={{ ...solidBtnToken, background: '#dc2626', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add Client Modal */}
            {addModal && (
                <Modal onClose={() => setAddModal(false)} title="Add New Client">
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                            <button type="button" onClick={() => setAddModal(false)} style={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button type="submit" disabled={formLoading} style={{ ...solidBtnToken, flex: 1, justifyContent: 'center', opacity: formLoading ? 0.6 : 1 }}>
                                {formLoading ? 'Saving...' : 'Add Client'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Filter Modal */}
            {filterModal && (
                <Modal onClose={() => setFilterModal(false)} title="Sort & Filter Clients">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <FormField label="Sort By">
                            <select
                                value={filters.sort_by}
                                onChange={e => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                                style={inputStyleToken}
                            >
                                <option value="created_at">Joined Date</option>
                                <option value="bookings_count">Total Bookings</option>
                                <option value="name">Name</option>
                            </select>
                        </FormField>
                        <FormField label="Sort Direction">
                            <select
                                value={filters.sort_dir}
                                onChange={e => setFilters(prev => ({ ...prev, sort_dir: e.target.value }))}
                                style={inputStyleToken}
                            >
                                <option value="desc">Descending (Newest / Highest First)</option>
                                <option value="asc">Ascending (Oldest / Lowest First)</option>
                            </select>
                        </FormField>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button type="button" onClick={() => setFilterModal(false)} style={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }}>Close</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Client Modal */}
            {editModal && (
                <Modal onClose={() => setEditModal(false)} title="Edit Client">
                    <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                            <button type="button" onClick={() => setEditModal(false)} style={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button type="submit" disabled={formLoading} style={{ ...solidBtnToken, flex: 1, justifyContent: 'center', opacity: formLoading ? 0.6 : 1 }}>
                                {formLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <h1 style={pageTitle}>Clients</h1>
                    <p style={pageSubtitle}>
                        Manage all clients — <strong>{meta.total || 0}</strong> total
                    </p>
                </div>
                <button onClick={() => {
                    setForm({ name: '', contact_number: '', email: '', address: '' });
                    setAddModal(true);
                }} style={solidBtnToken}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Client
                </button>
            </div>

            {/* Search & Actions */}
            <div style={{ display: 'flex', gap: 10, margin: '20px 0 20px', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
                    <div style={{ ...searchBar, maxWidth: '100%' }}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search client by name, phone, or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={searchInput}
                        />
                    </div>
                    {search && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                            background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
                            borderRadius: 12, border: `1px solid ${brand.border}`,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                            maxHeight: 250, overflowY: 'auto', zIndex: 50,
                        }}>
                            {clients.length > 0 ? clients.map(c => (
                                <div key={c.id}
                                     onClick={() => navigate(`/admin/clients/${c.id}`)}
                                     style={{ padding: '10px 16px', fontSize: 14, color: brand.navy, cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <strong>{c.name}</strong> <span style={{color: '#64748b', fontSize: 12, marginLeft: 8}}>{c.contact_number}</span>
                                </div>
                            )) : (
                                <div style={{ padding: '10px 16px', fontSize: 13, color: '#64748b' }}>No matches found...</div>
                            )}
                        </div>
                    )}
                </div>
                <button onClick={() => setFilterModal(true)} style={outlineBtnToken}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 4h18M7 8h10M10 12h4" /></svg>
                    Sort & Filters
                </button>
                <button onClick={handleExport} style={outlineBtnToken}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    Export CSV
                </button>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: 'hidden' }}>
                {/* Header */}
                <div style={tableHeaderStyle}>
                    <ColHead>CLIENT</ColHead>
                    <ColHead>CONTACT</ColHead>
                    <ColHead>EMAIL</ColHead>
                    <ColHead>TOTAL BOOKINGS</ColHead>
                    <ColHead>LAST BOOKING</ColHead>
                    <ColHead style={{ textAlign: 'right' }}>ACTIONS</ColHead>
                </div>

                {/* Body */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Loading clients...</div>
                ) : clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 12px', color: '#2563eb',
                        }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>No clients found</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Clients will appear here when bookings are placed.</div>
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
                                {/* Client */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={avatarToken(color, 38)}>{initials}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: brand.navy }}>{client.name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>C{String(client.id).padStart(3, '0')}</div>
                                    </div>
                                </div>
                                {/* Contact */}
                                <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {client.contact_number || '—'}
                                </div>
                                {/* Email */}
                                <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>{client.email || '—'}</div>
                                {/* Bookings */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {Array.from({ length: Math.min(bookingCount, 5) }).map((_, i) => (
                                            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.8 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{bookingCount}</span>
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
                                    <ActionBtn title="Edit" onClick={() => {
                                        setForm({
                                            name: client.name || '',
                                            contact_number: client.contact_number || '',
                                            email: client.email || '',
                                            address: client.address || ''
                                        });
                                        setEditId(client.id);
                                        setEditModal(true);
                                    }} icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    } />
                                    <ActionBtn title="Delete" danger onClick={() => setDeleteModal(client)} icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                    } />
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: `1px solid ${brand.border}` }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,20,41,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(10,35,66,0.2)' }}>
                {title && <h3 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 800, color: brand.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>}
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

function ColHead({ children, style }) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, ...style }}>{children}</span>;
}

function ActionBtn({ title, onClick, icon, danger }) {
    return (
        <button title={title} onClick={onClick} style={{
            width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${brand.border}`, background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#dc2626' : '#64748b', transition: 'all 0.15s',
        }}>{icon}</button>
    );
}

function PageBtn({ label, active, disabled, onClick }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            minWidth: 34, height: 34, borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 500,
            border: active ? 'none' : `1.5px solid ${brand.border}`,
            background: active ? `linear-gradient(135deg, ${brand.navy} 0%, ${brand.midBlue} 100%)` : '#fff',
            color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: active ? '0 2px 8px rgba(10,35,66,0.2)' : 'none',
        }}>{label}</button>
    );
}

const tableHeaderStyle = {
    display: 'grid', gridTemplateColumns: '1.8fr 1.3fr 1.6fr 130px 130px 110px',
    padding: '14px 24px', borderBottom: `1px solid ${brand.border}`, background: brand.softBg,
    alignItems: 'center', gap: 16,
};

const tableRowStyle = {
    display: 'grid', gridTemplateColumns: '1.8fr 1.3fr 1.6fr 130px 130px 110px',
    padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
    alignItems: 'center', gap: 16, transition: 'background 0.15s',
};
