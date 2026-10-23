import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Helper to get YYYY-MM-DD from a Date object in local time
 */
export function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a YYYY-MM-DD string into a human-friendly format
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'Select a booking date';
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({
  value,
  onChange,
  minDate = toYMD(new Date()),
  label = 'Choose a Date',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value or fallback to today
  const selectedDateObj = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  }, [value]);

  // Current view month & year in the calendar
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth());

  // Keep view aligned if value changes from outside
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  // Close calendar popover only on Escape key (or explicit toggle / selection)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    // Days in current view month
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Weekday of the 1st of this month (0 = Sunday)
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

    const days = [];
    // Padding for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null, isCurrentMonth: false });
    }
    // Actual days of the month
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${mStr}-${dStr}`;
      days.push({ day: d, dateStr, isCurrentMonth: true });
    }
    return days;
  }, [viewYear, viewMonth]);

  // Determine if previous month navigation should be disabled
  const minDateParts = useMemo(() => {
    if (!minDate) return null;
    const parts = minDate.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1,
      day: parseInt(parts[2], 10),
    };
  }, [minDate]);

  const canNavigatePrev = useMemo(() => {
    if (!minDateParts) return true;
    if (viewYear < minDateParts.year) return false;
    if (viewYear === minDateParts.year && viewMonth <= minDateParts.month) return false;
    return true;
  }, [viewYear, viewMonth, minDateParts]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (!canNavigatePrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const todayYMD = toYMD(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(todayYMD);
    setIsOpen(false);
  };

  const handleSelectDate = (dateStr) => {
    if (!dateStr) return;
    if (minDate && dateStr < minDate) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = toYMD(new Date());

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        marginBottom: isOpen ? 65 : 0,
        transition: 'margin-bottom 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {label && (
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 8,
        }}>
          {label}
        </label>
      )}

      {/* ── Trigger Field ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          borderRadius: 14,
          border: isOpen ? '2px solid #0A2342' : '1.5px solid #e2e8f0',
          background: isOpen ? '#f0f7ff' : '#f8fafc',
          boxShadow: isOpen ? '0 0 0 3px rgba(10,35,66,0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxSizing: 'border-box',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Calendar Icon */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: isOpen ? '#0A2342' : '#eff6ff',
            color: isOpen ? '#ffffff' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#0A2342',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {formatFriendlyDate(value)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Scheduled cleaning date
            </div>
          </div>
        </div>

        {/* Right Chevron Arrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: 8,
          padding: '4px',
        }}>
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke={isOpen ? '#0A2342' : '#94a3b8'}
            strokeWidth="2.4"
            style={{
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── Calendar Popover ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 35,
            width: '100%',
            maxWidth: 380,
            background: '#ffffff',
            borderRadius: 18,
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 16px 40px rgba(10,35,66,0.14), 0 4px 12px rgba(0,0,0,0.04)',
            padding: '16px 18px',
            boxSizing: 'border-box',
            animation: 'datePickerFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Popover Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: '1px solid #f1f5f9',
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canNavigatePrev}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: '1px solid #e2e8f0',
                background: canNavigatePrev ? '#fff' : '#f8fafc',
                color: canNavigatePrev ? '#0A2342' : '#cbd5e1',
                cursor: canNavigatePrev ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              aria-label="Previous month"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0A2342',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.2px',
              }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: '1.5px solid #e2e8f0',
                background: '#fff',
                color: '#0A2342',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              aria-label="Next month"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  padding: '4px 0',
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            textAlign: 'center',
          }}>
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return <div key={`empty-${idx}`} style={{ height: 38 }} />;
              }

              const isPast = minDate && item.dateStr < minDate;
              const isSelected = value === item.dateStr;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDate(item.dateStr)}
                  style={{
                    height: 38,
                    borderRadius: 10,
                    border: isSelected
                      ? '2px solid #0A2342'
                      : isToday
                      ? '1.5px solid #2563eb'
                      : '1px solid transparent',
                    background: isSelected
                      ? '#0A2342'
                      : isToday
                      ? '#eff6ff'
                      : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : isPast
                      ? '#cbd5e1'
                      : isToday
                      ? '#1d4ed8'
                      : '#1e293b',
                    fontSize: 13,
                    fontWeight: isSelected || isToday ? 800 : 600,
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 3px 8px rgba(10,35,66,0.22)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isPast && !isSelected) {
                      e.currentTarget.style.background = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPast && !isSelected) {
                      e.currentTarget.style.background = isToday ? '#eff6ff' : 'transparent';
                    }
                  }}
                  aria-label={`${item.dateStr}${isToday ? ' (Today)' : ''}${isSelected ? ' (Selected)' : ''}`}
                >
                  <span>{item.day}</span>
                  {isToday && !isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: 3,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#2563eb',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes datePickerFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
