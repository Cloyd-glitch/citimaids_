/**
 * Shared admin design tokens and reusable style objects.
 * Aligned with the Figma navy brand palette used on the customer side.
 */

/* ── Brand Colors ─── */
export const brand = {
  navy:     '#0A2342',
  midnight: '#061429',
  midBlue:  '#1E3A8A',
  royal:    '#2563eb',
  sky:      '#60a5fa',
  skyLight: '#93c5fd',
  softBg:   '#f8fafc',
  border:   '#e2e8f0',
};

/* ── Typography ─── */
export const fonts = {
  heading: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

/* ── Reusable Inline Styles ─── */

export const pageTitle = {
  fontSize: 28,
  fontWeight: 800,
  color: brand.navy,
  margin: 0,
  fontFamily: fonts.heading,
};

export const pageSubtitle = {
  color: '#64748b',
  fontSize: 14,
  margin: '4px 0 0',
};

export const card = {
  background: '#fff',
  borderRadius: 18,
  border: `1px solid ${brand.border}`,
  boxShadow: '0 4px 20px rgba(10,35,66,0.03)',
};

export const cardPadding = {
  padding: '28px',
};

export const solidBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 22px',
  borderRadius: 12,
  border: 'none',
  background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.midBlue} 100%)`,
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(10,35,66,0.2)',
  transition: 'all 0.15s',
};

export const outlineBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 20px',
  borderRadius: 12,
  border: `1.5px solid ${brand.border}`,
  background: '#fff',
  color: '#334155',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

export const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: `1.5px solid ${brand.border}`,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: brand.softBg,
  transition: 'border 0.2s',
  fontFamily: 'inherit',
  color: brand.navy,
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

export const thRow = {
  display: 'grid',
  padding: '14px 24px',
  background: brand.softBg,
  borderBottom: `1px solid ${brand.border}`,
  fontSize: 10,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
};

export const tdRow = {
  display: 'grid',
  padding: '16px 24px',
  borderBottom: '1px solid #f1f5f9',
  alignItems: 'center',
  transition: 'background 0.15s',
  cursor: 'pointer',
};

export const statusBadge = (status) => {
  const map = {
    pending:   { color: '#d97706', bg: '#fef3c7', label: 'Pending' },
    confirmed: { color: '#2563eb', bg: '#dbeafe', label: 'Confirmed' },
    completed: { color: '#059669', bg: '#d1fae5', label: 'Completed' },
    cancelled: { color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' },
    active:    { color: '#059669', bg: '#d1fae5', label: 'Active' },
    inactive:  { color: '#94a3b8', bg: '#f1f5f9', label: 'Inactive' },
  };
  const s = map[status] || map.pending;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    color: s.color,
    background: s.bg,
  };
};

export const avatar = (color, size = 40) => ({
  width: size,
  height: size,
  borderRadius: 12,
  background: color,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: size * 0.35,
  fontWeight: 700,
  flexShrink: 0,
});

export const searchBar = {
  flex: 1,
  maxWidth: 440,
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  border: `1.5px solid ${brand.border}`,
  borderRadius: 14,
  padding: '0 16px',
  boxShadow: '0 2px 6px rgba(10,35,66,0.02)',
};

export const searchInput = {
  border: 'none',
  outline: 'none',
  padding: '12px 10px',
  fontSize: 14,
  width: '100%',
  background: 'transparent',
  fontFamily: fonts.body,
  color: brand.navy,
};

export const tabBtn = (isActive) => ({
  padding: '8px 16px',
  borderRadius: 10,
  border: isActive ? 'none' : `1.5px solid ${brand.border}`,
  background: isActive ? `linear-gradient(135deg, ${brand.navy} 0%, ${brand.midBlue} 100%)` : '#fff',
  color: isActive ? '#fff' : '#64748b',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s',
  boxShadow: isActive ? '0 4px 12px rgba(10,35,66,0.2)' : 'none',
});

export const idBadge = {
  fontSize: 12,
  fontWeight: 700,
  color: brand.navy,
  background: '#f1f5f9',
  padding: '4px 10px',
  borderRadius: 8,
};
