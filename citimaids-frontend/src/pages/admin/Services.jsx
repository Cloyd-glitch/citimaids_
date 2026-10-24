import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../api/axios';
import { brand, fonts, pageTitle, pageSubtitle, card, solidBtn as solidBtnToken, outlineBtn as outlineBtnToken, inputStyle as inputStyleToken, selectStyle as selectStyleToken, tabBtn, searchBar as searchBarToken, searchInput as searchInputToken } from './adminStyles';

/* Category tabs matching Bookings tab layout with counts */
const CATEGORY_TABS = [
    { key: 'all', label: 'All' },
    { key: 'residential', label: 'Residential' },
    { key: 'commercial', label: 'Commercial' },
    { key: 'specialized', label: 'Specialized' },
    { key: 'maintenance', label: 'Maintenance' },
];

/* Category config: dot color for pills, and soft avatar bg/text tint */
const CATEGORY_CONFIG = {
    residential: { label: 'Residential', dot: '#059669', avatarBg: '#ecfdf5', avatarColor: '#065f46' },
    commercial:  { label: 'Commercial',  dot: '#2563eb', avatarBg: '#eff6ff', avatarColor: '#1e40af' },
    specialized: { label: 'Specialized', dot: '#7c3aed', avatarBg: '#f5f3ff', avatarColor: '#5b21b6' },
    maintenance: { label: 'Maintenance', dot: '#d97706', avatarBg: '#fffbeb', avatarColor: '#92400e' },
};

/* Letter avatar tinted to the service's category */
function ServiceLetterAvatar({ name, category, status = 'active', size = 36 }) {
    const letter = (name || 'S').trim().charAt(0).toUpperCase();
    const isActive = status === 'active';
    const cat = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.residential;
    return (
        <div style={{
            width: size, height: size, borderRadius: 9,
            background: isActive ? cat.avatarBg : '#f1f5f9',
            color: isActive ? cat.avatarColor : '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: Math.round(size * 0.42),
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: `1.5px solid ${isActive ? cat.avatarBg : '#e2e8f0'}`,
            flexShrink: 0,
        }}>
            {letter}
        </div>
    );
}

/* Subtle category pill with colored dot */
function CategoryPill({ category }) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.residential;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
            background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
            {config.label}
        </span>
    );
}

export default function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [formModal, setFormModal] = useState(null);
    const [form, setForm] = useState({ name: '', category: 'residential', description: '', base_price: '', status: 'active' });
    const [formLoading, setFormLoading] = useState(false);
    const [reorderMode, setReorderMode] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [dragState, setDragState] = useState(null);
    const dragRef = useRef(null);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/services');
            setServices(res.data.data || res.data || []);
        } catch (err) {
            console.error('Services fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sort: active on top (by display_order), inactive at the bottom
    const sortedServices = useMemo(() => {
        return [...services].sort((a, b) => {
            const aActive = a.status === 'active' ? 0 : 1;
            const bActive = b.status === 'active' ? 0 : 1;
            if (aActive !== bActive) return aActive - bActive;
            return (a.display_order || 0) - (b.display_order || 0);
        });
    }, [services]);

    // Filter by search and category
    const filteredServices = useMemo(() => {
        return sortedServices.filter((s) => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
            const matchCat = categoryFilter === 'all' || (s.category || 'residential').toLowerCase() === categoryFilter;
            return matchSearch && matchCat;
        });
    }, [sortedServices, search, categoryFilter]);

    // Active vs Inactive partitioning for clean visual grouping
    const activeServices = useMemo(() => filteredServices.filter(s => s.status === 'active'), [filteredServices]);
    const inactiveServices = useMemo(() => filteredServices.filter(s => s.status !== 'active'), [filteredServices]);

    const openAdd = () => {
        setForm({ name: '', category: 'residential', description: '', base_price: '', status: 'active' });
        setFormModal('add');
    };

    const openEdit = (svc) => {
        setForm({
            name: svc.name,
            category: svc.category || 'residential',
            description: svc.description || '',
            base_price: svc.base_price || '',
            status: svc.status || 'active'
        });
        setFormModal(svc);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            // Convert empty string to null so Laravel's nullable|numeric rule passes
            const payload = {
                ...form,
                base_price: form.base_price === '' ? null : form.base_price,
            };
            if (formModal === 'add') {
                await api.post('/services', payload);
                showToast('Service created successfully.', 'success');
            } else {
                await api.put(`/services/${formModal.id}`, payload);
                showToast('Service updated successfully.', 'success');
            }
            setFormModal(null);
            fetchServices();
        } catch (err) {
            console.error('Save service error:', err?.response?.status, err?.response?.data);
            const errData = err?.response?.data;
            let msg = 'Failed to save service.';
            if (errData?.errors) {
                msg = 'Validation error: ' + Object.values(errData.errors).flat().join(', ');
            } else if (errData?.message) {
                msg = errData.message;
            }
            showToast(msg, 'error');
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

    // ── Smooth Pointer-based Drag & Drop (No HTML5 Ghost, No Glitching) ──
    const handlePointerDown = (e, index) => {
        if (!reorderMode) return;
        const rowEl = e.currentTarget.closest('[data-service-row]');
        const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 58;

        const state = {
            activeIndex: index,
            startY: e.clientY,
            offsetY: 0,
            targetIndex: index,
            rowHeight,
            maxIndex: sortedServices.length - 1,
        };
        dragRef.current = state;
        setDragState(state);
    };

    useEffect(() => {
        if (!dragState) return;

        const onPointerMove = (e) => {
            const current = dragRef.current;
            if (!current) return;
            const deltaY = e.clientY - current.startY;
            const indexDiff = Math.round(deltaY / current.rowHeight);
            const targetIndex = Math.max(0, Math.min(current.maxIndex, current.activeIndex + indexDiff));

            const updated = {
                ...current,
                offsetY: deltaY,
                targetIndex,
            };
            dragRef.current = updated;
            setDragState(updated);
        };

        const onPointerUp = async () => {
            const current = dragRef.current;
            dragRef.current = null;
            setDragState(null);

            if (current && current.activeIndex !== current.targetIndex) {
                const from = current.activeIndex;
                const to = current.targetIndex;
                const reordered = [...sortedServices];
                const [moved] = reordered.splice(from, 1);
                reordered.splice(to, 0, moved);
                const withNewOrders = reordered.map((item, idx) => ({
                    ...item,
                    display_order: idx + 1,
                }));
                setServices(withNewOrders);
                await persistReorder(withNewOrders);
            }
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragState, sortedServices]);

    const getRowTransform = (index) => {
        if (!dragState) return 'translateY(0px)';
        const { activeIndex, targetIndex, rowHeight, offsetY } = dragState;

        if (index === activeIndex) {
            return `translateY(${offsetY}px)`;
        }
        if (activeIndex === targetIndex) {
            return 'translateY(0px)';
        }
        if (activeIndex < targetIndex) {
            // Dragging down: rows between activeIndex and targetIndex shift UP
            if (index > activeIndex && index <= targetIndex) {
                return `translateY(-${rowHeight}px)`;
            }
        } else if (activeIndex > targetIndex) {
            // Dragging up: rows between targetIndex and activeIndex shift DOWN
            if (index >= targetIndex && index < activeIndex) {
                return `translateY(${rowHeight}px)`;
            }
        }
        return 'translateY(0px)';
    };

    const persistReorder = async (reordered) => {
        setReordering(true);
        try {
            await api.post('/services/reorder', {
                order: reordered.map((s) => ({ id: s.id })),
            });
            showToast('Order saved.', 'success');
        } catch {
            showToast('Failed to save order — please refresh.', 'error');
            fetchServices();
        } finally {
            setReordering(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const totalSvcs = services.length;
    const activeCount = services.filter(s => s.status === 'active').length;
    const inactiveCount = totalSvcs - activeCount;
    const totalBookings = services.reduce((acc, s) => acc + (s.bookings_count || 0), 0);

    const categoryCounts = useMemo(() => {
        const counts = { all: services.length, residential: 0, commercial: 0, specialized: 0, maintenance: 0 };
        services.forEach((s) => {
            const cat = (s.category || 'residential').toLowerCase();
            if (counts[cat] !== undefined) {
                counts[cat]++;
            }
        });
        return counts;
    }, [services]);

    return (
        <div style={{ fontFamily: fonts.body }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: toast.type === 'success'
                        ? 'rgba(10, 35, 66, 0.85)'
                        : toast.type === 'info'
                            ? 'rgba(15, 23, 42, 0.88)'
                            : 'rgba(220, 38, 38, 0.85)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    boxShadow: '0 8px 30px rgba(10,35,66,0.22)',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        {toast.type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />}
                        {toast.type === 'info' && <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {toast.type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                    </svg>
                    {toast.msg}
                </div>
            )}

            {/* View Modal — clean, non-redundant service detail sheet */}
            {viewModal && (() => {
                const cat = CATEGORY_CONFIG[viewModal.category] || CATEGORY_CONFIG.residential;
                const isActive = viewModal.status === 'active';
                return (
                    <Overlay onClose={() => setViewModal(null)} noHeader>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                            {/* Colored header band */}
                            <div style={{
                                background: cat.avatarBg,
                                borderRadius: '12px 12px 0 0',
                                padding: '18px 20px 16px',
                                marginBottom: 0,
                                display: 'flex', alignItems: 'center', gap: 14,
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: '#fff', color: cat.avatarColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: 20,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    flexShrink: 0,
                                }}>
                                    {(viewModal.name || 'S').trim().charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 17, fontWeight: 800, color: brand.navy, lineHeight: 1.2 }}>{viewModal.name}</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <CategoryPill category={viewModal.category} />
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                                            background: isActive ? '#dcfce7' : '#f1f5f9',
                                            color: isActive ? '#166534' : '#64748b',
                                        }}>
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#16a34a' : '#94a3b8' }} />
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setViewModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: 18, padding: 4, alignSelf: 'flex-start' }}>✕</button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                                {/* 3 quick stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                    {[
                                        { label: 'Starting Rate', value: `AED ${Number(viewModal.base_price || 0).toFixed(2)}` },
                                        { label: 'Display Order', value: `#${viewModal.display_order || '—'}` },
                                        { label: 'Bookings', value: viewModal.bookings_count || 0 },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${brand.border}` }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: brand.navy, marginTop: 3 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                {viewModal.description && (
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Description</div>
                                        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, margin: 0 }}>
                                            {viewModal.description}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <HoverBtn
                                        onClick={() => { const t = viewModal; setViewModal(null); openEdit(t); }}
                                        base={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }}
                                        hoverStyle={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: brand.navy, transform: 'translateY(-1px)' }}
                                    >
                                        Edit
                                    </HoverBtn>
                                    <HoverBtn
                                        onClick={() => { handleToggle(viewModal); setViewModal(null); }}
                                        base={{
                                            ...outlineBtnToken, flex: 1, justifyContent: 'center',
                                            borderColor: isActive ? '#fca5a5' : '#cbd5e1',
                                            color: isActive ? '#dc2626' : brand.navy,
                                        }}
                                        hoverStyle={{ background: isActive ? '#fef2f2' : '#f8fafc', transform: 'translateY(-1px)' }}
                                    >
                                        {isActive ? 'Deactivate' : 'Activate'}
                                    </HoverBtn>
                                    <HoverBtn
                                        onClick={() => setViewModal(null)}
                                        base={{ ...solidBtnToken, flex: 1, justifyContent: 'center' }}
                                        hoverStyle={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(10,35,66,0.3)' }}
                                    >
                                        Close
                                    </HoverBtn>
                                </div>
                            </div>
                        </div>
                    </Overlay>
                );
            })()}

            {/* Delete Modal */}
            {deleteModal && (
                <Overlay onClose={() => setDeleteModal(null)}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 50, height: 50, borderRadius: 14, background: '#fee2e2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 14px', color: '#dc2626',
                        }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: brand.navy, margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Service?</h3>
                        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <HoverBtn onClick={() => setDeleteModal(null)} base={outlineBtnToken} hoverStyle={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: brand.navy }}>Cancel</HoverBtn>
                            <HoverBtn onClick={handleDelete} base={{ ...solidBtnToken, background: '#dc2626' }} hoverStyle={{ opacity: 0.9, transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}>Delete</HoverBtn>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* Add / Edit Modal */}
            {formModal !== null && (
                <Overlay onClose={() => setFormModal(null)} title={formModal === 'add' ? 'Add New Service' : 'Edit Service'}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <FieldGroup label="Service Name" required>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Villa Deep Cleaning" style={inputStyleToken} />
                        </FieldGroup>
                        <FieldGroup label="Category" required>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyleToken}>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="specialized">Specialized & Deep Care</option>
                                <option value="maintenance">Outdoor & Maintenance</option>
                            </select>
                        </FieldGroup>
                        <FieldGroup label="Description">
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this cleaning service..." rows={3}
                                style={{ ...inputStyleToken, resize: 'vertical', fontFamily: 'inherit' }} />
                        </FieldGroup>
                        <FieldGroup label="Base Price (AED)">
                            <input type="number" step="0.5" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })}
                                placeholder="0.00" style={inputStyleToken} />
                        </FieldGroup>
                        <FieldGroup label="Status">
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyleToken}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FieldGroup>
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                            <HoverBtn type="button" onClick={() => setFormModal(null)} base={{ ...outlineBtnToken, flex: 1, justifyContent: 'center' }} hoverStyle={{ background: '#f1f5f9', borderColor: '#cbd5e1', color: brand.navy }}>Cancel</HoverBtn>
                            <HoverBtn type="submit" disabled={formLoading} base={{ ...solidBtnToken, flex: 1, justifyContent: 'center', opacity: formLoading ? 0.6 : 1 }} hoverStyle={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(10,35,66,0.3)' }}>
                                {formLoading ? 'Saving...' : 'Save Service'}
                            </HoverBtn>
                        </div>
                    </form>
                </Overlay>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={pageTitle}>Services</h1>
                    <p style={pageSubtitle}>Manage services, categories, and customer booking display order</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <HoverBtn
                        onClick={() => {
                            setReorderMode((v) => {
                                if (!v) {
                                    setCategoryFilter('all');
                                    setSearch('');
                                }
                                return !v;
                            });
                        }}
                        base={{
                            ...outlineBtnToken,
                            background: reorderMode ? '#f1f5f9' : '#fff',
                            borderColor: reorderMode ? brand.navy : brand.border,
                            color: brand.navy,
                        }}
                        hoverStyle={{
                            background: '#f8fafc',
                            borderColor: '#cbd5e1',
                            transform: 'translateY(-1px)',
                        }}
                        title="Reorder services"
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {reorderMode ? 'Done Reordering' : 'Reorder Services'}
                        {reordering && <span style={{ marginLeft: 6, fontSize: 11, color: '#94a3b8' }}>Saving...</span>}
                    </HoverBtn>
                    <HoverBtn
                        onClick={openAdd}
                        base={solidBtnToken}
                        hoverStyle={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(10,35,66,0.30)' }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Service
                    </HoverBtn>
                </div>
            </div>

            {/* KPI Summary Cards (Consistent with Billing & Transactions) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                <KpiCard
                    label="Total Services"
                    value={totalSvcs}
                    color="#2563eb"
                    iconBg="#dbeafe"
                    subtitle="All catalog services"
                    icon={
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Active Services"
                    value={activeCount}
                    color="#059669"
                    iconBg="#d1fae5"
                    subtitle="Live on customer booking"
                    icon={
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Inactive Services"
                    value={inactiveCount}
                    color="#64748b"
                    iconBg="#f1f5f9"
                    subtitle="Currently paused"
                    icon={
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Total Bookings"
                    value={totalBookings}
                    color="#7c3aed"
                    iconBg="#ede9fe"
                    subtitle="All customer reservations"
                    icon={
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                    }
                />
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={searchBarToken}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search services by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={searchInputToken}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: 4 }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* Category Tabs (styled identical to Bookings page tabs, with jitter-free fixed dimensions) */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
                {CATEGORY_TABS.map((tab) => {
                    const isSelected = categoryFilter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setCategoryFilter(tab.key)}
                            style={{
                                ...tabBtn(isSelected),
                                border: isSelected ? '1.5px solid transparent' : `1.5px solid ${brand.border}`,
                                boxSizing: 'border-box',
                                height: 38,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                            }}
                        >
                            {tab.label}
                            <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                marginLeft: 5,
                                opacity: isSelected ? 0.8 : 0.5,
                            }}>
                                {categoryCounts[tab.key] || 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Table Container */}
            <div style={{ ...card, overflow: 'hidden', minHeight: 440 }}>
                {/* Reorder Hint */}
                {reorderMode && (
                    <div style={{
                        padding: '10px 18px', background: '#f8fafc',
                        borderBottom: `1px solid ${brand.border}`,
                        fontSize: 12, color: brand.navy, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Reorder mode</span>
                        </div>
                        {reordering && <span style={{ color: '#64748b', fontSize: 11 }}>Saving order...</span>}
                    </div>
                )}

                {/* Table Header */}
                <div style={{
                    ...thRow,
                    gridTemplateColumns: reorderMode
                        ? '28px 1.8fr 130px 110px 105px 92px'
                        : '1.8fr 130px 110px 105px 92px',
                }}>
                    {reorderMode && <span />}
                    <Th>SERVICE</Th>
                    <Th>CATEGORY</Th>
                    <Th>STARTING RATE</Th>
                    <Th>STATUS</Th>
                    <Th style={{ textAlign: 'right' }}>ACTIONS</Th>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 50, color: '#94a3b8', fontSize: 13 }}>Loading services...</div>
                ) : filteredServices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ fontWeight: 700, color: brand.navy, fontSize: 14, marginBottom: 4 }}>No services found</div>
                        <div style={{ color: '#64748b', fontSize: 12 }}>Try adjusting your search or category filter.</div>
                    </div>
                ) : (
                    <div>
                        {/* 1. Active Services Group */}
                        {activeServices.map((svc, index) => {
                            return (
                                <ServiceRow
                                    key={svc.id}
                                    svc={svc}
                                    index={index}
                                    reorderMode={reorderMode}
                                    isDragging={dragState?.activeIndex === index}
                                    transform={getRowTransform(index)}
                                    onPointerDown={(e) => handlePointerDown(e, index)}
                                    onView={() => setViewModal(svc)}
                                    onEdit={() => openEdit(svc)}
                                    onDelete={() => setDeleteModal(svc)}
                                    onToggle={() => handleToggle(svc)}
                                    onActionBlocked={() => showToast("Please press 'Done Reordering' first.", 'info')}
                                />
                            );
                        })}

                        {/* 2. Inactive Services Group (Cleanly sits at the bottom) */}
                        {inactiveServices.length > 0 && (
                            <div>
                                <div style={{
                                    padding: '8px 18px', background: '#f8fafc',
                                    borderTop: `1px solid ${brand.border}`, borderBottom: `1px solid ${brand.border}`,
                                    fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />
                                    <span>Inactive Services</span>
                                </div>
                                {inactiveServices.map((svc, index) => {
                                    const actualIndex = activeServices.length + index;
                                    return (
                                        <ServiceRow
                                            key={svc.id}
                                            svc={svc}
                                            index={actualIndex}
                                            reorderMode={reorderMode}
                                            isDragging={dragState?.activeIndex === actualIndex}
                                            transform={getRowTransform(actualIndex)}
                                            onPointerDown={(e) => handlePointerDown(e, actualIndex)}
                                            onView={() => setViewModal(svc)}
                                            onEdit={() => openEdit(svc)}
                                            onDelete={() => setDeleteModal(svc)}
                                            onToggle={() => handleToggle(svc)}
                                            onActionBlocked={() => showToast("Please press 'Done Reordering' first.", 'info')}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Info */}
                <div style={{
                    padding: '12px 18px', borderTop: `1px solid ${brand.border}`,
                    fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span>Showing {filteredServices.length} of {services.length} services</span>
                    <span style={{ color: '#94a3b8' }}>Click any row to view full details</span>
                </div>
            </div>
        </div>
    );
}

/* ── Minimal Table Row ─────────────────────────────────────────── */
function ServiceRow({
    svc, index, reorderMode,
    isDragging, transform,
    onPointerDown,
    onView, onEdit, onDelete, onToggle,
    onActionBlocked,
}) {
    const isActive = svc.status === 'active';
    const hasTransform = reorderMode && transform && transform !== 'none' && transform !== 'translateY(0px)';

    return (
        <div
            data-service-row
            onClick={() => !reorderMode && onView()}
            onPointerDown={(e) => {
                if (reorderMode && !e.target.closest('button')) {
                    onPointerDown(e);
                }
            }}
            style={{
                ...tdRow,
                gridTemplateColumns: reorderMode
                    ? '28px 1.8fr 130px 110px 105px 92px'
                    : '1.8fr 130px 110px 105px 92px',
                cursor: reorderMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                userSelect: reorderMode ? 'none' : 'auto',
                touchAction: reorderMode ? 'none' : 'auto',
                background: isDragging
                    ? '#ffffff'
                    : (!isActive ? '#fafbfc' : '#fff'),
                opacity: 1,
                border: isDragging ? '1.5px solid #2563eb' : undefined,
                boxShadow: isDragging ? '0 12px 32px rgba(10,35,66,0.20)' : 'none',
                borderRadius: isDragging ? 10 : 0,
                transform: reorderMode ? transform : 'none',
                transition: isDragging
                    ? 'none'
                    : (hasTransform ? 'transform 0.22s cubic-bezier(0.2, 0, 0, 1), background 0.15s' : 'background 0.15s'),
                position: 'relative',
                zIndex: isDragging ? 50 : 1,
                boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
                if (!isDragging) e.currentTarget.style.background = !isActive ? '#f1f5f9' : '#f8fafc';
            }}
            onMouseLeave={e => {
                if (!isDragging) e.currentTarget.style.background = !isActive ? '#fafbfc' : '#fff';
            }}
        >
            {/* Reorder drag handle */}
            {reorderMode && (
                <div
                    style={{
                        color: isDragging ? '#0284c7' : '#94a3b8',
                        fontSize: 16,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                    }}
                    title="Drag to reorder"
                >
                    ⠿
                </div>
            )}

            {/* Service Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ServiceLetterAvatar name={svc.name} category={svc.category} status={svc.status} size={36} />
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        Order #{svc.display_order || index + 1}
                    </div>
                </div>
            </div>

            {/* Category */}
            <div>
                <CategoryPill category={svc.category} />
            </div>

            {/* Starting Rate */}
            <div style={{ fontSize: 13, fontWeight: 700, color: brand.navy }}>
                AED {Number(svc.base_price || 0).toFixed(2)}
            </div>

            {/* Status (Clickable Toggle) */}
            <div onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => {
                        if (reorderMode) {
                            onActionBlocked();
                            return;
                        }
                        onToggle();
                    }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                        border: `1px solid ${isActive ? '#dcfce7' : '#e2e8f0'}`,
                        background: isActive ? '#f0fdf4' : '#f8fafc',
                        color: isActive ? '#166534' : '#64748b',
                        cursor: reorderMode ? 'not-allowed' : 'pointer',
                        opacity: reorderMode ? 0.45 : 1,
                        transition: 'all 0.15s',
                    }}
                    title={reorderMode ? "Press 'Done Reordering' first" : "Click to toggle active/inactive status"}
                >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16a34a' : '#94a3b8' }} />
                    {isActive ? 'Active' : 'Inactive'}
                </button>
            </div>

            {/* Actions */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}
            >
                <ActionBtn
                    title="View"
                    onClick={() => {
                        if (reorderMode) {
                            onActionBlocked();
                            return;
                        }
                        onView();
                    }}
                    icon={eyeIcon}
                    disabled={reorderMode}
                />
                <ActionBtn
                    title="Edit"
                    onClick={() => {
                        if (reorderMode) {
                            onActionBlocked();
                            return;
                        }
                        onEdit();
                    }}
                    icon={editIcon}
                    disabled={reorderMode}
                />
                <ActionBtn
                    title="Delete"
                    danger
                    onClick={() => {
                        if (reorderMode) {
                            onActionBlocked();
                            return;
                        }
                        onDelete();
                    }}
                    icon={trashIcon}
                    disabled={reorderMode}
                />
            </div>
        </div>
    );
}

/* ── KPI Stat Card (Matching Billing & Transactions design) ── */
function KpiCard({ label, value, color, iconBg, icon, subtitle }) {
    return (
        <div style={{ ...card, padding: '18px 20px', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </span>
                <span style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: iconBg,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                {value}
            </div>
            {subtitle && (
                <div style={{ fontSize: 12, color: color, fontWeight: 600, marginTop: 4 }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}

function Overlay({ children, onClose, title, noHeader }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,20,41,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', borderRadius: 18, width: 460, maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(10,35,66,0.18)', overflow: 'hidden' }}>
                {!noHeader && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0', marginBottom: title ? 14 : 0, flexShrink: 0 }}>
                        {title && <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: brand.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>}
                        <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: 4, lineHeight: 1, marginLeft: 'auto' }}>✕</button>
                    </div>
                )}
                <div style={{ overflowY: 'auto', ...(noHeader ? {} : { padding: '0 24px 24px' }) }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

function FieldGroup({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
                {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function Th({ children, style }) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, ...style }}>{children}</span>;
}

function HoverBtn({ children, onClick, base, hoverStyle, type = 'button', disabled = false, title }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            type={type}
            title={title}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ ...base, ...(hovered && !disabled ? hoverStyle : {}), transition: 'all 0.15s' }}
        >
            {children}
        </button>
    );
}

function ActionBtn({ title, onClick, icon, danger, disabled }) {
    const [hovered, setHovered] = useState(false);
    const isView = title === 'View';
    const bgHover = danger ? '#fef2f2' : isView ? '#f1f5f9' : '#f1f5f9';
    const borderHover = danger ? '#fecaca' : '#cbd5e1';
    const textHover = danger ? '#dc2626' : brand.navy;
    return (
        <button
            title={disabled ? "Press 'Done Reordering' first" : title}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 28, height: 28, borderRadius: 8,
                border: `1.5px solid ${!disabled && hovered ? borderHover : brand.border}`,
                background: !disabled && hovered ? bgHover : '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: !disabled && hovered ? textHover : '#64748b',
                transition: 'all 0.15s',
                transform: !disabled && hovered ? 'translateY(-1px)' : 'none',
                boxShadow: !disabled && hovered ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
            }}
        >{icon}</button>
    );
}

const thRow = {
    display: 'grid',
    padding: '11px 18px', borderBottom: `1px solid ${brand.border}`, background: brand.softBg,
    alignItems: 'center', gap: 12,
};
const tdRow = {
    display: 'grid',
    padding: '12px 18px', borderBottom: '1px solid #f1f5f9',
    alignItems: 'center', gap: 12, transition: 'background 0.15s',
};

const eyeIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const editIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const trashIcon = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>;
