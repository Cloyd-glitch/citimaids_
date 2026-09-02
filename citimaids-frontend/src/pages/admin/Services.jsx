import { useState, useEffect } from 'react';
import api from '../../api/axios';

const serviceIcons = {
    'Home Cleaning': '🏠',
    'Office Cleaning': '🏢',
    'Villa Cleaning': '🏰',
    'Deep Cleaning': '🧽',
    'Carpet & Sofa Cleaning': '🛋️',
    'Window & Glass Cleaning': '🪟',
    'Move-in / Move-out Cleaning': '📦',
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

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [formModal, setFormModal] = useState(null); // null | 'add' | {service object}
    const [form, setForm] = useState({ name: '', description: '', base_price: '', status: 'active' });
    const [formLoading, setFormLoading] = useState(false);

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

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const totalSvcs = services.length;
    const activeSvcs = services.filter(s => s.status === 'active').length;
    const totalBookings = services.reduce((acc, s) => acc + (s.bookings_count || 0), 0);
    const maxBookings = Math.max(...services.map(s => s.bookings_count || 0), 1);

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
                <Overlay onClose={() => setDeleteModal(null)}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 42, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f37', margin: '0 0 8px' }}>Delete Service?</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal(null)} style={outlineBtn}>Cancel</button>
                            <button onClick={handleDelete} style={{ ...solidBtn, background: '#ef4444' }}>Delete</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* Add/Edit Modal */}
            {formModal !== null && (
                <Overlay onClose={() => setFormModal(null)} title={formModal === 'add' ? 'Add New Service' : 'Edit Service'}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <FieldGroup label="Service Name" required>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Home Cleaning" style={inputStyle} />
                        </FieldGroup>
                        <FieldGroup label="Description">
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this service..." rows={3}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                        </FieldGroup>
                        <FieldGroup label="Base Price (₱)">
                            <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })}
                                placeholder="0.00" style={inputStyle} />
                        </FieldGroup>
                        <FieldGroup label="Status">
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FieldGroup>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button type="button" onClick={() => setFormModal(null)} style={{ ...outlineBtn, flex: 1 }}>Cancel</button>
                            <button type="submit" disabled={formLoading} style={{ ...solidBtn, flex: 1 }}>{formLoading ? 'Saving...' : 'Save Service'}</button>
                        </div>
                    </form>
                </Overlay>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Services</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Manage cleaning services and pricing</p>
                </div>
                <button onClick={openAdd} style={solidBtn}>+ Add Service</button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon="📋" label="Total Services" value={totalSvcs} color="#3b82f6" />
                <SummaryCard icon="✅" label="Active Services" value={activeSvcs} color="#10b981" />
                <SummaryCard icon="📅" label="Total Bookings" value={totalBookings} color="#8b5cf6" />
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Header Row */}
                <div style={thRow}>
                    <Th style={{ gridColumn: 'span 1' }}>SERVICE</Th>
                    <Th>DESCRIPTION</Th>
                    <Th>BOOKINGS</Th>
                    <Th>REVENUE</Th>
                    <Th>STATUS</Th>
                    <Th>ACTIONS</Th>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading services...</div>
                ) : services.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No services found</div>
                ) : (
                    services.map(svc => {
                        const color = serviceColors[svc.name] || '#6366f1';
                        const icon = serviceIcons[svc.name] || '🧹';
                        const bookings = svc.bookings_count || 0;
                        const revenue = svc.total_revenue || (bookings * (svc.base_price || 0));
                        const barPct = Math.round((bookings / maxBookings) * 100);
                        const isActive = svc.status === 'active';

                        return (
                            <div key={svc.id} style={tdRow}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                {/* Service */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 10, fontSize: 20,
                                        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{icon}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1f37' }}>{svc.name}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: SVC-{String(svc.id).padStart(3, '0')}</div>
                                    </div>
                                </div>
                                {/* Description */}
                                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, paddingRight: 12 }}>
                                    {svc.description || '—'}
                                </div>
                                {/* Bookings bar */}
                                <div>
                                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, width: '80%', marginBottom: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1f37' }}>{bookings}</span>
                                </div>
                                {/* Revenue */}
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1f37' }}>
                                    ₱{Number(revenue).toLocaleString()}
                                </div>
                                {/* Status */}
                                <button
                                    onClick={() => handleToggle(svc)}
                                    style={{
                                        padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                        fontSize: 12, fontWeight: 700,
                                        background: isActive ? '#d1fae5' : '#f1f5f9',
                                        color: isActive ? '#10b981' : '#94a3b8',
                                    }}
                                >
                                    {isActive ? '● Active' : '○ Inactive'}
                                </button>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <ActionBtn title="View" icon={eyeIcon} />
                                    <ActionBtn title="Edit" onClick={() => openEdit(svc)} icon={editIcon} />
                                    <ActionBtn title="Delete" danger onClick={() => setDeleteModal(svc)} icon={trashIcon} />
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Footer */}
                <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', fontSize: 13, color: '#64748b' }}>
                    Showing 1–{services.length} of {services.length} services
                </div>
            </div>
        </div>
    );
}

/* ── Sub-components ─────────────────────────────── */

function SummaryCard({ icon, label, value, color }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1f37' }}>{value}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
            </div>
        </div>
    );
}

function Overlay({ children, onClose, title }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                {title && <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#1a1f37' }}>{title}</h3>}
                {children}
            </div>
        </div>
    );
}

function FieldGroup({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function Th({ children, style }) {
    return <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, ...style }}>{children}</span>;
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

const thRow = {
    display: 'grid', gridTemplateColumns: '1.8fr 2fr 140px 120px 110px 100px',
    padding: '13px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc',
    alignItems: 'center', gap: 12,
};
const tdRow = {
    display: 'grid', gridTemplateColumns: '1.8fr 2fr 140px 120px 110px 100px',
    padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
    alignItems: 'center', gap: 12, transition: 'background 0.1s',
};
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1a1f37', outline: 'none', boxSizing: 'border-box' };
const solidBtn = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const outlineBtn = { background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };

const eyeIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const editIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const trashIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>;
