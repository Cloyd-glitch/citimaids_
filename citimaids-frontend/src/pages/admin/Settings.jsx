import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const TABS = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
    { id: 'admins', label: 'Admin Accounts', icon: '👥' },
    { id: 'booking-status', label: 'Booking Statuses', icon: '🏷️' },
    { id: 'booking-form', label: 'Booking Form', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'System Preferences', icon: '🖥️' },
];

export default function Settings() {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tab || 'general');
    const [toast, setToast] = useState(null);

    const changeTab = (id) => {
        setActiveTab(id);
        navigate(`/admin/settings/${id}`, { replace: true });
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}>{toast.msg}</div>
            )}

            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1f37', margin: 0 }}>Settings</h1>
                <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Manage system settings and preferences</p>
            </div>

            {/* Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
                {/* Sidebar */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 8 }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => changeTab(t.id)} style={{
                            width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none', borderRadius: 8,
                            background: activeTab === t.id ? '#eff6ff' : 'transparent',
                            cursor: 'pointer', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 10,
                            borderLeft: activeTab === t.id ? '3px solid #3b82f6' : '3px solid transparent',
                            transition: 'all 0.15s',
                        }}>
                            <span style={{ fontSize: 15 }}>{t.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? '#1d4ed8' : '#374151' }}>
                                {t.label}
                            </span>
                            {activeTab === t.id && (
                                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'general' && <GeneralSettings showToast={showToast} />}
                    {activeTab === 'profile' && <ProfileSettings showToast={showToast} />}
                    {activeTab === 'admins' && <AdminAccounts showToast={showToast} />}
                    {activeTab === 'booking-status' && <BookingStatuses showToast={showToast} />}
                    {activeTab === 'booking-form' && <BookingForm showToast={showToast} />}
                    {activeTab === 'notifications' && <NotificationSettings showToast={showToast} />}
                    {activeTab === 'security' && <SecuritySettings showToast={showToast} />}
                    {activeTab === 'preferences' && <SystemPreferences showToast={showToast} />}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 1: General Settings                          */
/* ─────────────────────────────────────────────── */
function GeneralSettings({ showToast }) {
    const [form, setForm] = useState({
        business_name: 'CitiMaids Cleaning Services',
        contact_number: '(02) 8123 4567',
        business_email: 'info@citimaids.com',
        business_address: '123 Clean St., BGC, Taguig City',
        description: 'We provide professional cleaning services for homes, offices, villas, and more.',
        timezone: 'Asia/Manila',
        date_format: 'MMM DD, YYYY',
        time_format: '12h',
        items_per_page: '10',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/settings').then(res => {
            if (res.data) {
                const s = res.data;
                setForm(prev => ({ ...prev, ...s }));
            }
        }).catch(() => { });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', form);
            showToast('Settings saved successfully!');
        } catch {
            showToast('Failed to save settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave}>
            <SettingsCard title="General Settings" subtitle="Update your business information and branding.">
                <SectionHeader>BUSINESS INFORMATION</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <Field label="Business Name">
                        <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} style={inputStyle} />
                    </Field>
                    <Field label="Contact Number">
                        <input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} style={inputStyle} />
                    </Field>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Field label="Business Email">
                        <input type="email" value={form.business_email} onChange={e => setForm({ ...form, business_email: e.target.value })} style={inputStyle} />
                    </Field>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Field label="Business Address">
                        <input value={form.business_address} onChange={e => setForm({ ...form, business_address: e.target.value })} style={inputStyle} />
                    </Field>
                </div>
                <div style={{ marginBottom: 24 }}>
                    <Field label="Description">
                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                    </Field>
                </div>

                <SectionHeader>PREFERENCES</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 8 }}>
                    <Field label="Time Zone">
                        <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="Asia/Manila">(GMT+08:00) Asia/Manila</option>
                            <option value="Asia/Dubai">(GMT+04:00) Asia/Dubai</option>
                            <option value="UTC">(UTC+00:00) UTC</option>
                        </select>
                    </Field>
                    <Field label="Date Format">
                        <select value={form.date_format} onChange={e => setForm({ ...form, date_format: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="MMM DD, YYYY">May 18, 2025</option>
                            <option value="MM/DD/YYYY">05/18/2025</option>
                            <option value="DD/MM/YYYY">18/05/2025</option>
                        </select>
                    </Field>
                    <Field label="Time Format">
                        <select value={form.time_format} onChange={e => setForm({ ...form, time_format: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="12h">12-Hour (AM/PM)</option>
                            <option value="24h">24-Hour</option>
                        </select>
                    </Field>
                    <Field label="Items per Page">
                        <select value={form.items_per_page} onChange={e => setForm({ ...form, items_per_page: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {['10', '25', '50', '100'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button type="submit" disabled={saving} style={saveBtn}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </SettingsCard>
        </form>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 2: Profile Settings                          */
/* ─────────────────────────────────────────────── */
function ProfileSettings({ showToast }) {
    const [form, setForm] = useState({ name: 'Admin User', email: 'admin@citimaids.com', current_password: '', new_password: '', confirm_password: '' });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (form.new_password && form.new_password !== form.confirm_password) {
            showToast('New passwords do not match.', 'error'); return;
        }
        setSaving(true);
        setTimeout(() => { setSaving(false); showToast('Profile updated successfully!'); }, 800);
    };

    return (
        <form onSubmit={handleSave}>
            <SettingsCard title="Profile Settings" subtitle="Update your personal information and password.">
                <SectionHeader>ACCOUNT INFORMATION</SectionHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '16px 20px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                        {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1f37' }}>{form.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Administrator</div>
                        <button type="button" style={{ fontSize: 12, color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>Change avatar</button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Field label="Full Name">
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                    </Field>
                    <Field label="Email Address">
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                    </Field>
                </div>

                <SectionHeader>CHANGE PASSWORD</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 8 }}>
                    <Field label="Current Password">
                        <input type="password" placeholder="••••••••" value={form.current_password} onChange={e => setForm({ ...form, current_password: e.target.value })} style={inputStyle} />
                    </Field>
                    <Field label="New Password">
                        <input type="password" placeholder="••••••••" value={form.new_password} onChange={e => setForm({ ...form, new_password: e.target.value })} style={inputStyle} />
                    </Field>
                    <Field label="Confirm New Password">
                        <input type="password" placeholder="••••••••" value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} style={inputStyle} />
                    </Field>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 24px' }}>Leave password fields blank to keep current password.</p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={saving} style={saveBtn}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </SettingsCard>
        </form>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 3: Admin Accounts                            */
/* ─────────────────────────────────────────────── */
function AdminAccounts({ showToast }) {
    const [admins] = useState([
        { id: 1, name: 'Admin User', email: 'admin@citimaids.com', role: 'Super Admin', last_login: 'Sep 2, 2026, 09:10 AM', status: 'active' },
        { id: 2, name: 'Support Staff', email: 'support@citimaids.com', role: 'Admin', last_login: 'Sep 1, 2026, 03:45 PM', status: 'active' },
    ]);
    const [addModal, setAddModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: 'Admin', password: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setAddModal(false);
        setForm({ name: '', email: '', role: 'Admin', password: '' });
        showToast('Admin account created successfully!');
    };

    return (
        <div>
            {addModal && (
                <Overlay onClose={() => setAddModal(false)} title="Add Admin Account">
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Field label="Full Name" required><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
                        <Field label="Email" required><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} /></Field>
                        <Field label="Role"><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option>Admin</option><option>Super Admin</option></select></Field>
                        <Field label="Password" required><input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} /></Field>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button type="button" onClick={() => setAddModal(false)} style={{ ...outlineBtn, flex: 1 }}>Cancel</button>
                            <button type="submit" style={{ ...saveBtn, flex: 1 }}>Add Account</button>
                        </div>
                    </form>
                </Overlay>
            )}

            <SettingsCard title="Admin Accounts" subtitle="Manage administrator accounts and roles.">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button onClick={() => setAddModal(true)} style={saveBtn}>+ Add Admin</button>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', padding: '12px 20px', background: '#fafbfc', borderBottom: '1px solid #e2e8f0' }}>
                        {['ADMIN', 'ROLE', 'LAST LOGIN', 'STATUS', 'ACTIONS'].map(h => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
                        ))}
                    </div>
                    {admins.map((admin, i) => (
                        <div key={admin.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 0 ? '#3b82f6' : '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1f37' }}>{admin.name}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{admin.email}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '3px 10px', borderRadius: 6, width: 'fit-content' }}>{admin.role}</span>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{admin.last_login}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', background: '#d1fae5', padding: '3px 10px', borderRadius: 6, width: 'fit-content' }}>Active</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <SmallBtn title="Edit" icon="✏️" />
                                {i !== 0 && <SmallBtn title="Delete" icon="🗑️" onClick={() => showToast('Admin removed.', 'error')} />}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>
        </div>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 4: Booking Statuses                          */
/* ─────────────────────────────────────────────── */
function BookingStatuses({ showToast }) {
    const [statuses, setStatuses] = useState([
        { id: 1, label: 'Pending', color: '#f59e0b', description: 'Awaiting admin review', editable: true },
        { id: 2, label: 'Confirmed', color: '#3b82f6', description: 'Booking is confirmed', editable: true },
        { id: 3, label: 'Completed', color: '#10b981', description: 'Service has been completed', editable: true },
        { id: 4, label: 'Cancelled', color: '#ef4444', description: 'Booking was cancelled', editable: true },
    ]);

    const handleColorChange = (id, newColor) => {
        setStatuses(prev => prev.map(s => s.id === id ? { ...s, color: newColor } : s));
    };

    const handleLabelChange = (id, val) => {
        setStatuses(prev => prev.map(s => s.id === id ? { ...s, label: val } : s));
    };

    return (
        <SettingsCard title="Booking Statuses" subtitle="Configure booking status labels and colors.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {statuses.map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 160px', gap: 16, alignItems: 'center', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
                        <span style={{ fontSize: 20 }}>{{ 1: '🟡', 2: '🔵', 3: '🟢', 4: '🔴' }[s.id]}</span>
                        <input
                            value={s.label}
                            onChange={e => handleLabelChange(s.id, e.target.value)}
                            style={{ ...inputStyle, fontWeight: 600, color: s.color }}
                        />
                        <input
                            value={s.description}
                            onChange={e => setStatuses(prev => prev.map(x => x.id === s.id ? { ...x, description: e.target.value } : x))}
                            style={{ ...inputStyle, fontSize: 13, color: '#64748b' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="color" value={s.color} onChange={e => handleColorChange(s.id, e.target.value)}
                                style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>{s.color}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => showToast('Booking statuses saved!')} style={saveBtn}>Save Changes</button>
            </div>
        </SettingsCard>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 5: Booking Form                              */
/* ─────────────────────────────────────────────── */
function BookingForm({ showToast }) {
    const [fields, setFields] = useState([
        { id: 'full_name', label: 'Full Name', required: true, enabled: true, locked: true },
        { id: 'contact_number', label: 'Contact Number', required: true, enabled: true, locked: true },
        { id: 'email', label: 'Email Address', required: false, enabled: true, locked: false },
        { id: 'service', label: 'Service Selection', required: true, enabled: true, locked: true },
        { id: 'preferred_date', label: 'Preferred Date', required: true, enabled: true, locked: true },
        { id: 'preferred_time', label: 'Preferred Time', required: false, enabled: false, locked: false },
        { id: 'address', label: 'Service Address', required: false, enabled: true, locked: false },
        { id: 'notes', label: 'Special Notes / Instructions', required: false, enabled: true, locked: false },
        { id: 'number_of_rooms', label: 'Number of Rooms', required: false, enabled: false, locked: false },
        { id: 'promo_code', label: 'Promo Code', required: false, enabled: false, locked: false },
    ]);

    const toggle = (id, key) => {
        setFields(prev => prev.map(f => f.id === id && !f.locked ? { ...f, [key]: !f[key] } : f));
    };

    return (
        <SettingsCard title="Booking Form" subtitle="Configure which fields appear on the customer booking form.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 0, marginBottom: 8 }}>
                <span style={thStyle}>FORM FIELD</span>
                <span style={{ ...thStyle, textAlign: 'center' }}>ENABLED</span>
                <span style={{ ...thStyle, textAlign: 'center' }}>REQUIRED</span>
            </div>
            {fields.map(f => (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 0, padding: '14px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1f37' }}>{f.label}</div>
                        {f.locked && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Required system field</div>}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Toggle on={f.enabled} disabled={f.locked} onToggle={() => toggle(f.id, 'enabled')} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Toggle on={f.required} disabled={f.locked || !f.enabled} onToggle={() => toggle(f.id, 'required')} />
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={() => showToast('Booking form configuration saved!')} style={saveBtn}>Save Changes</button>
            </div>
        </SettingsCard>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 6: Notifications                             */
/* ─────────────────────────────────────────────── */
function NotificationSettings({ showToast }) {
    const [notifs, setNotifs] = useState({
        email_new_booking: true,
        email_status_change: true,
        email_booking_reminder: false,
        sms_new_booking: false,
        sms_status_change: false,
        daily_digest: true,
        weekly_report: false,
        notify_client_on_confirm: true,
        notify_client_on_complete: true,
    });

    const toggle = key => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

    const groups = [
        {
            title: 'Admin Email Notifications',
            icon: '📧',
            items: [
                { key: 'email_new_booking', label: 'New Booking Submitted', desc: 'Get emailed when a customer submits a new booking.' },
                { key: 'email_status_change', label: 'Booking Status Changed', desc: 'Notify when a booking status is updated.' },
                { key: 'email_booking_reminder', label: 'Upcoming Booking Reminders', desc: 'Daily reminders for bookings scheduled tomorrow.' },
            ],
        },
        {
            title: 'SMS Notifications',
            icon: '📱',
            items: [
                { key: 'sms_new_booking', label: 'SMS on New Booking', desc: 'Receive an SMS for every new booking.' },
                { key: 'sms_status_change', label: 'SMS on Status Change', desc: 'Get an SMS when booking status changes.' },
            ],
        },
        {
            title: 'Reports & Digests',
            icon: '📊',
            items: [
                { key: 'daily_digest', label: 'Daily Summary Digest', desc: 'Daily email summary of bookings and revenue.' },
                { key: 'weekly_report', label: 'Weekly Report', desc: 'Weekly performance report every Monday.' },
            ],
        },
        {
            title: 'Client Notifications',
            icon: '📤',
            items: [
                { key: 'notify_client_on_confirm', label: 'Notify Client on Confirmation', desc: 'Send client an email when their booking is confirmed.' },
                { key: 'notify_client_on_complete', label: 'Notify Client on Completion', desc: 'Send client an email when service is completed.' },
            ],
        },
    ];

    return (
        <SettingsCard title="Notifications" subtitle="Configure when and how notifications are sent.">
            {groups.map(g => (
                <div key={g.title} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {g.icon} {g.title}
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                        {g.items.map((item, i) => (
                            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < g.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1f37' }}>{item.label}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
                                </div>
                                <Toggle on={notifs[item.key]} onToggle={() => toggle(item.key)} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => showToast('Notification preferences saved!')} style={saveBtn}>Save Changes</button>
            </div>
        </SettingsCard>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 7: Security                                  */
/* ─────────────────────────────────────────────── */
function SecuritySettings({ showToast }) {
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('60');
    const [loginHistory] = useState([
        { device: 'Chrome on Windows', ip: '192.168.1.100', time: 'Sep 2, 2026 09:10 AM', status: 'success' },
        { device: 'Firefox on Windows', ip: '192.168.1.100', time: 'Sep 1, 2026 03:45 PM', status: 'success' },
        { device: 'Unknown Device', ip: '112.204.32.11', time: 'Aug 30, 2026 11:23 PM', status: 'failed' },
        { device: 'Chrome on Android', ip: '192.168.1.105', time: 'Aug 28, 2026 08:00 AM', status: 'success' },
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SettingsCard title="Security" subtitle="Configure security settings and monitor account access.">
                {/* 2FA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1f37' }}>Two-Factor Authentication</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Add an extra layer of security to your account via authenticator app or SMS.</div>
                    </div>
                    <Toggle on={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
                </div>

                {/* Session timeout */}
                <div style={{ padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1f37', marginBottom: 8 }}>Session Timeout</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Automatically log out inactive sessions after the selected duration.</div>
                    <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{ ...inputStyle, maxWidth: 240, cursor: 'pointer' }}>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                        <option value="0">Never</option>
                    </select>
                </div>

                {/* Force logout */}
                <div style={{ padding: '16px 20px', border: '1px solid #fee2e2', borderRadius: 10, background: '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>Force Logout All Sessions</div>
                        <div style={{ fontSize: 13, color: '#ef4444', marginTop: 2 }}>This will immediately log out all active admin sessions.</div>
                    </div>
                    <button onClick={() => showToast('All sessions have been terminated.', 'error')}
                        style={{ ...outlineBtn, borderColor: '#ef4444', color: '#ef4444', background: '#fff' }}>
                        Force Logout
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <button onClick={() => showToast('Security settings saved!')} style={saveBtn}>Save Changes</button>
                </div>
            </SettingsCard>

            {/* Login History */}
            <SettingsCard title="Login History" subtitle="Recent login attempts to your admin account.">
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 80px', padding: '12px 20px', background: '#fafbfc', borderBottom: '1px solid #e2e8f0' }}>
                        {['DEVICE', 'IP ADDRESS', 'TIME', 'RESULT'].map(h => (
                            <span key={h} style={thStyle}>{h}</span>
                        ))}
                    </div>
                    {loginHistory.map((l, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 80px', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, color: '#1a1f37' }}>{l.device}</span>
                            <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{l.ip}</span>
                            <span style={{ fontSize: 13, color: '#64748b' }}>{l.time}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, width: 'fit-content', background: l.status === 'success' ? '#d1fae5' : '#fee2e2', color: l.status === 'success' ? '#10b981' : '#ef4444' }}>
                                {l.status === 'success' ? '✓ Success' : '✗ Failed'}
                            </span>
                        </div>
                    ))}
                </div>
            </SettingsCard>
        </div>
    );
}

/* ─────────────────────────────────────────────── */
/* TAB 8: System Preferences                        */
/* ─────────────────────────────────────────────── */
function SystemPreferences({ showToast }) {
    const [prefs, setPrefs] = useState({
        language: 'en',
        currency: 'PHP',
        currency_symbol: '₱',
        date_format: 'MMM DD, YYYY',
        time_format: '12h',
        items_per_page: '10',
        maintenance_mode: false,
        allow_registrations: false,
        max_bookings_per_day: '20',
        advance_booking_days: '60',
        min_advance_hours: '24',
    });

    const set = (key, val) => setPrefs(prev => ({ ...prev, [key]: val }));

    return (
        <SettingsCard title="System Preferences" subtitle="Configure global system behavior and display settings.">
            <SectionHeader>LOCALIZATION</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <Field label="Language">
                    <select value={prefs.language} onChange={e => set('language', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="en">English</option>
                        <option value="fil">Filipino</option>
                        <option value="ar">Arabic</option>
                    </select>
                </Field>
                <Field label="Currency">
                    <select value={prefs.currency} onChange={e => set('currency', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="PHP">PHP — Philippine Peso (₱)</option>
                        <option value="AED">AED — UAE Dirham (د.إ)</option>
                        <option value="USD">USD — US Dollar ($)</option>
                    </select>
                </Field>
                <Field label="Date Format">
                    <select value={prefs.date_format} onChange={e => set('date_format', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="MMM DD, YYYY">May 18, 2025</option>
                        <option value="MM/DD/YYYY">05/18/2025</option>
                        <option value="DD/MM/YYYY">18/05/2025</option>
                        <option value="YYYY-MM-DD">2025-05-18</option>
                    </select>
                </Field>
            </div>

            <SectionHeader>PAGINATION & DISPLAY</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <Field label="Items Per Page">
                    <select value={prefs.items_per_page} onChange={e => set('items_per_page', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {['5', '10', '25', '50', '100'].map(v => <option key={v}>{v}</option>)}
                    </select>
                </Field>
                <Field label="Time Format">
                    <select value={prefs.time_format} onChange={e => set('time_format', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="12h">12-Hour (AM/PM)</option>
                        <option value="24h">24-Hour</option>
                    </select>
                </Field>
            </div>

            <SectionHeader>BOOKING RULES</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <Field label="Max Bookings Per Day">
                    <input type="number" value={prefs.max_bookings_per_day} onChange={e => set('max_bookings_per_day', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Advance Booking (days ahead)">
                    <input type="number" value={prefs.advance_booking_days} onChange={e => set('advance_booking_days', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Min Advance Notice (hours)">
                    <input type="number" value={prefs.min_advance_hours} onChange={e => set('min_advance_hours', e.target.value)} style={inputStyle} />
                </Field>
            </div>

            <SectionHeader>SYSTEM</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <NotifRow
                    label="Maintenance Mode"
                    desc="When enabled, the customer booking site will show a maintenance page."
                    on={prefs.maintenance_mode}
                    danger={prefs.maintenance_mode}
                    onToggle={() => set('maintenance_mode', !prefs.maintenance_mode)}
                />
                <NotifRow
                    label="Allow New Client Registrations"
                    desc="Allow new clients to submit bookings through the public form."
                    on={prefs.allow_registrations}
                    onToggle={() => set('allow_registrations', !prefs.allow_registrations)}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => showToast('System preferences saved!')} style={saveBtn}>Save Changes</button>
            </div>
        </SettingsCard>
    );
}

/* ─────────────────────────────────────────────── */
/* Shared UI components                             */
/* ─────────────────────────────────────────────── */
function SettingsCard({ title, subtitle, children }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f37', margin: '0 0 4px' }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>{subtitle}</p>
            {children}
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function SectionHeader({ children }) {
    return <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>{children}</div>;
}

function Toggle({ on, onToggle, disabled }) {
    return (
        <button type="button" onClick={!disabled ? onToggle : undefined} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
            background: on ? '#3b82f6' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
        }}>
            <span style={{
                position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18,
                borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
    );
}

function NotifRow({ label, desc, on, onToggle, danger }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: `1px solid ${danger && on ? '#fee2e2' : '#e2e8f0'}`, borderRadius: 10, background: danger && on ? '#fef2f2' : '#fff' }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: danger && on ? '#dc2626' : '#1a1f37' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
            </div>
            <Toggle on={on} onToggle={onToggle} />
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

function SmallBtn({ title, onClick, icon }) {
    return (
        <button title={title} onClick={onClick} style={{
            width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
        }}>{icon}</button>
    );
}

/* ─────────────────────────────────────────────── */
/* Shared styles                                    */
/* ─────────────────────────────────────────────── */
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1a1f37', outline: 'none', boxSizing: 'border-box' };
const saveBtn = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const outlineBtn = { background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const thStyle = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 };
