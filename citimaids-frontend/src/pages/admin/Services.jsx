import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn as solidBtnToken, outlineBtn as outlineBtnToken, statusBadge, inputStyle as inputStyleToken, selectStyle as selectStyleToken } from './adminStyles';

const serviceColors = {
    'Home Cleaning': '#059669',
    'Office Cleaning': '#2563eb',
    'Villa Cleaning': '#7c3aed',
    'Deep Cleaning': '#d97706',
    'Carpet & Sofa Cleaning': '#ec4899',
    'Window & Glass Cleaning': '#0891b2',
    'Move-in / Move-out Cleaning': '#dc2626',
};

/* SVG icon generator per service name */
function ServiceIcon({ name, size = 20 }) {
    const icons = {
        'Home Cleaning': <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        'Office Cleaning': <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
        'Villa Cleaning': <><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V8l3-5 3 5v13M5 21V14l4-3M19 21V14l-4-3" /></>,
        'Deep Cleaning': <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
        'Carpet & Sofa Cleaning': <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-8h8l4 8M6 16h12M8 20H4v-4M16 20h4v-4" />,
        'Window & Glass Cleaning': <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18M3 12h18" /></>,
        'Move-in / Move-out Cleaning': <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    };
    return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            {icons[name] || <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
        </svg>
    );
}

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', base_price: '', status: 'active' });
    const [formLoading, setFormLoading] = useState(false);
    const [reorderMode, setReorderMode] = useState(false);
    const [reordering, setReordering] = useState(false);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/services');
            setServices(res.data.data || res.data || []);
        } catch (err) {
            console.error('Services fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm({ name: '', description: '', base_price: '', status: 'active' });
        setFormModal('add');
    };

    const openEdit = (svc) => {
        setForm({ name: svc.name, description: svc.description || '', base_price: svc.base_price || '', status: svc.status });
        setFormModal(svc);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (formModal === 'add') {
                await api.post('/services', form);
                showToast('Service added successfully.', 'success');
            } else {
                await api.put(`/services/${formModal.id}`, form);
                showToast('Service updated successfully.', 'success');
            }
            setFormModal(null);
            fetchServices();
        } catch {
            showToast('Failed to save service.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggle = async (svc) => {
        const newStatus = svc.status === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/services/${svc.id}`, { ...svc, status: newStatus });
            showToast(`Service marked as ${newStatus}.`, 'success');
            fetchServices();
        } catch {
            showToast('Failed to toggle status.', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/services/${deleteModal.id}`);
            setDeleteModal(null);
            showToast('Service deleted.', 'success');
            fetchServices();
        } catch {
            showToast('Failed to delete service.', 'error');
        }
    };

    // ── Drag-and-drop reorder handlers ──────────────────────────────────────
    const handleDragStart = (index) => { dragItem.current = index; };
    const handleDragEnter = (index) => { dragOverItem.current = index; };

    const handleDragEnd = async () => {
        const from = dragItem.current;
        const to   = dragOverItem.current;
        if (from === null || to === null || from === to) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }
        // Optimistic local reorder
        const reordered = [...services];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        setServices(reordered);
        dragItem.current = null;
        dragOverItem.current = null;

        // Persist to backend
        setReordering(true);
        try {
            await api.post('/services/reorder', {
                order: reordered.map((s) => ({ id: s.id })),
            });
            showToast('Service order saved.', 'success');
        } catch {
            showToast('Failed to save order — please refresh.', 'error');
            fetchServices(); // revert
        } finally {
            setReordering(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const totalSvcs = services.length;
    const activeSvcs = services.filter(s => s.status === 'active').length;
    const totalBookings = services.reduce((acc, s) => acc + (s.bookings_count || 0), 0);
    const maxBookings = Math.max(...services.map(s => s.bookings_count || 0), 1);

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
                <Overlay onClose={() => setDeleteModal(null)}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16, background: '#fee2e2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: '#dc2626',
                        }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: brand.navy, margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Service?</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal(null)} style={outlineBtnToken}>Cancel</button>
                            <button onClick={handleDelete} style={{ ...solidBtnToken, background: '#dc2626', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>Delete</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* Add/Edit Modal */}
            {formModal !== null && (
                <Overlay onClose={() => setFormModal(null)} title={formModal === 'add' ? 'Add New Service' : 'Edit Service'}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <FieldGroup label="Service Name" required>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Home Cleaning" style={inputStyleToken} />
                        </FieldGroup>
                        <FieldGroup label="Description">
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this service..." rows={3}
                                style={{ ...inputStyleToken, resize: 'vertical', fontFamily: 'inherit' }} />
                        </FieldGroup>
                        <FieldGroup label="Base Price (AED)">
                            <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })}
                                placeholder="0.00" style={inputStyleToken} />
                        </FieldGroup>
                        <FieldGroup label="Status">
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyleToken}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FieldGroup>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button type="button" onClick={() => setFormModal(null)} style={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button type="submit" disabled={formLoading} style={{ ...solidBtnToken, flex: 1, justifyContent: 'center', opacity: formLoading ? 0.6 : 1 }}>
                                {formLoading ? 'Saving...' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </Overlay>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={pageTitle}>Services</h1>
                    <p style={pageSubtitle}>Manage cleaning services and pricing</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setReorderMode((v) => !v)}
                        style={{
                            ...outlineBtnToken,
                            background: reorderMode ? '#eff6ff' : '#fff',
                            borderColor: reorderMode ? '#2563eb' : brand.border,
                            color: reorderMode ? '#2563eb' : '#334155',
                        }}
                        title="Drag rows to reorder how services appear on the booking page"
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {reorderMode ? 'Exit Reorder' : 'Reorder Services'}
                        {reordering && <span style={{ marginLeft: 6, fontSize: 11, color: '#94a3b8' }}>Saving...</span>}
                    </button>
                    <button onClick={openAdd} style={solidBtnToken}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Service
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon={
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                } label="Total Services" value={totalSvcs} color="#2563eb" />
                <SummaryCard icon={
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                } label="Active Services" value={activeSvcs} color="#059669" />
                <SummaryCard icon={
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                } label="Total Bookings" value={totalBookings} color="#7c3aed" />
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: 'hidden' }}>
                {/* Reorder hint banner */}
                {reorderMode && (
                    <div style={{
                        padding: '10px 24px', background: '#eff6ff',
                        borderBottom: `1px solid ${brand.border}`,
                        fontSize: 12, color: '#2563eb', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Drag the ⠿ handle on any row to reorder services. Changes save automatically and reflect on the booking page.
                    </div>
                )}
                <div style={{ ...thRow, gridTemplateColumns: reorderMode ? '32px 1.8fr 2fr 140px 120px 110px 100px' : '1.8fr 2fr 140px 120px 110px 100px' }}>
                    {reorderMode && <span />}
                    <Th>SERVICE</Th>
                    <Th>DESCRIPTION</Th>
                    <Th>BOOKINGS</Th>
                    <Th>REVENUE</Th>
                    <Th>STATUS</Th>
                    <Th>ACTIONS</Th>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Loading services...</div>
                ) : services.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', background: '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 12px', color: '#2563eb',
                        }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>No services found</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Add your first cleaning service to get started.</div>
                    </div>
                ) : (
                    services.map((svc, index) => {
                        const color = serviceColors[svc.name] || '#6366f1';
                        const bookings = svc.bookings_count || 0;
                        const revenue = svc.total_revenue || (bookings * (svc.base_price || 0));
                        const barPct = Math.round((bookings / maxBookings) * 100);
                        const isActive = svc.status === 'active';

                        return (
                            <div
                                key={svc.id}
                                draggable={reorderMode}
                                onDragStart={() => handleDragStart(index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                style={{
                                    ...tdRow,
                                    gridTemplateColumns: reorderMode ? '32px 1.8fr 2fr 140px 120px 110px 100px' : '1.8fr 2fr 140px 120px 110px 100px',
                                    cursor: reorderMode ? 'grab' : 'default',
                                    userSelect: reorderMode ? 'none' : 'auto',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>

                                {/* Drag handle */}
                                {reorderMode && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#94a3b8', fontSize: 18, letterSpacing: 1, cursor: 'grab',
                                        userSelect: 'none',
                                    }} title="Drag to reorder">⠿</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12,
                                        background: `${color}15`, color: color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}><ServiceIcon name={svc.name} /></div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: brand.navy }}>{svc.name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SVC-{String(svc.id).padStart(3, '0')} · Order #{svc.display_order || index + 1}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, paddingRight: 12 }}>
                                    {svc.description || '—'}
                                </div>
                                <div>
                                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, width: '80%', marginBottom: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{bookings}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>
                                    AED {Number(revenue).toLocaleString()}
                                </div>
                                <button
                                    onClick={() => handleToggle(svc)}
                                    style={{
                                        ...statusBadge(isActive ? 'active' : 'inactive'),
                                        border: 'none', cursor: 'pointer',
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                    {isActive ? 'Active' : 'Inactive'}
                                </button>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <ActionBtn title="View" icon={eyeIcon} />
                                    <ActionBtn title="Edit" onClick={() => openEdit(svc)} icon={editIcon} />
                                    <ActionBtn title="Delete" danger onClick={() => setDeleteModal(svc)} icon={trashIcon} />
                                </div>
                            </div>
                        );
                    })
                )}

                <div style={{ padding: '14px 24px', borderTop: `1px solid ${brand.border}`, fontSize: 13, color: '#64748b' }}>
                    Showing 1–{services.length} of {services.length} services
                </div>
            </div>
        </div>
    );
}

/* ── Sub-components ─────────────────────────────── */

function SummaryCard({ icon, label, value, color }) {
    return (
        <div style={{ ...card, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: brand.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
            </div>
        </div>
    );
}

function Overlay({ children, onClose, title }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,20,41,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(10,35,66,0.2)' }}>
                {title && <h3 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 800, color: brand.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>}
                {children}
            </div>
        </div>
    );
}

function FieldGroup({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function Th({ children }) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>{children}</span>;
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

const thRow = {
    display: 'grid', gridTemplateColumns: '1.8fr 2fr 140px 120px 110px 100px',
    padding: '14px 24px', borderBottom: `1px solid ${brand.border}`, background: brand.softBg,
    alignItems: 'center', gap: 12,
};
const tdRow = {
    display: 'grid', gridTemplateColumns: '1.8fr 2fr 140px 120px 110px 100px',
    padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
    alignItems: 'center', gap: 12, transition: 'background 0.15s',
};

const eyeIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const editIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const trashIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>;
