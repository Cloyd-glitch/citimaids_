import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    { label: 'Bookings', path: '/admin/bookings', icon: BookingsIcon },
    { label: 'Billing & Transactions', path: '/admin/payments', icon: BillingIcon },
    { label: 'Clients', path: '/admin/clients', icon: ClientsIcon },
    { label: 'Services', path: '/admin/services', icon: ServicesIcon },
    { label: 'Reports', path: '/admin/reports', icon: ReportsIcon },
    { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Sidebar */}
            <aside style={{
                width: 250,
                background: 'linear-gradient(180deg, #0A2342 0%, #061429 100%)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                borderRight: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
            }}>
                {/* Brand Header */}
                <div style={{
                    padding: '24px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <img
                        src="/images/citimaids-badge.png"
                        alt="CitiMaids Logo"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            flexShrink: 0,
                        }}
                    />
                    <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 0.8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CITIMAIDS</div>
                        <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>Staff Portal</div>
                    </div>
                </div>

                {/* Live Customer Website Shortcut */}
                <div style={{ padding: '14px 14px 4px' }}>
                    <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            color: '#93c5fd',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                            View Public Website
                        </span>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
                    <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, padding: '8px 12px', textTransform: 'uppercase', letterSpacing: 1.2 }}>Main Menu</div>
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                borderRadius: 10,
                                color: isActive ? '#fff' : '#94a3b8',
                                background: isActive ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' : 'transparent',
                                boxShadow: isActive ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                                textDecoration: 'none',
                                fontSize: 13.5,
                                fontWeight: isActive ? 700 : 500,
                                marginBottom: 4,
                                transition: 'all 0.15s ease-in-out',
                            })}
                        >
                            <item.icon />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User & Logout Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 14px' }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 8px' }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: '#1E3A8A',
                                border: '1px solid #3b82f6',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                            }}>
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {user.name || 'Administrator'}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 11 }}>Staff Member</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            color: '#f87171',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            width: '100%',
                            transition: 'all 0.2s',
                        }}
                    >
                        <LogoutIcon />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, marginLeft: 250, padding: '32px 36px', minHeight: '100vh', background: '#f8fafc' }}>
                <Outlet />
            </main>
        </div>
    );
}

/* ── Crisp Vector SVG Icons ──────────────────────────────── */

function DashboardIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
    );
}

function BookingsIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function BillingIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function ClientsIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    );
}

function ServicesIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
    );
}

function ReportsIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}
