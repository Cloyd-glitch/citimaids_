import React, { useState, useEffect, useMemo } from 'react';

/**
 * Standard quick shortcuts for CitiMaids booking
 */
export const DEFAULT_TIME_SLOTS = [
  '7:00 AM',
  '9:00 AM',
  '11:00 AM',
  '1:00 PM',
  '3:00 PM',
  '5:00 PM',
];

/**
 * Parse time string (e.g. "9:00 AM", "10:30 PM") into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Format hours, minutes, and period into standard 12-hour format string (e.g. "10:30 AM")
 */
export function formatTime12(hours, minutes, period) {
  const h = parseInt(hours, 10);
  const m = String(minutes).padStart(2, '0');
  const p = String(period).toUpperCase();
  return `${h}:${m} ${p}`;
}

/**
 * Check if a given time slot has already passed for today
 */
export function isSlotPassedToday(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const now = new Date();
  const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (dateStr !== todayYMD) return false;

  const slotMinutes = parseTimeToMinutes(timeStr);
  if (slotMinutes === null) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= currentMinutes;
}

export default function TimePicker({
  value,
  onChange,
  selectedDate,
  slots = DEFAULT_TIME_SLOTS,
}) {
  const isCustomTime = value && !slots.includes(value);
  const [showCustomPicker, setShowCustomPicker] = useState(() => isCustomTime);

  // Initialize custom picker values based on current value
  const initialTimeParts = useMemo(() => {
    if (value) {
      const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        return {
          hour: match[1],
          minute: match[2],
          period: match[3].toUpperCase(),
        };
      }
    }
    return { hour: '10', minute: '00', period: 'AM' };
  }, [value]);

  const [customHour, setCustomHour] = useState(initialTimeParts.hour);
  const [customMinute, setCustomMinute] = useState(initialTimeParts.minute);
  const [customPeriod, setCustomPeriod] = useState(initialTimeParts.period);
  const [inlineError, setInlineError] = useState(null);

  // Synchronize custom state if value changes externally
  useEffect(() => {
    if (value) {
      const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        setCustomHour(match[1]);
        setCustomMinute(match[2]);
        setCustomPeriod(match[3].toUpperCase());
      }
    }
  }, [value]);

  // Revalidate current selection if the selectedDate changes
  useEffect(() => {
    if (!value) return;
    if (isSlotPassedToday(selectedDate, value)) {
      setInlineError('Selected time has already passed for today. Please select an upcoming slot.');
    } else {
      setInlineError(null);
    }
  }, [selectedDate, value]);

  const validateAndApplyCustomTime = (h, m, p) => {
    const formatted = formatTime12(h, m, p);
    const minutes = parseTimeToMinutes(formatted);

    // Operating hours: 7:00 AM (420 mins) to 8:30 PM (1230 mins)
    if (minutes === null || minutes < 7 * 60 || minutes > 20 * 60 + 30) {
      setInlineError('CitiMaids operating hours are between 7:00 AM and 8:30 PM.');
      onChange(formatted);
      return;
    }

    if (isSlotPassedToday(selectedDate, formatted)) {
      setInlineError('This time has already passed for today. Please pick an upcoming time.');
      onChange(formatted);
      return;
    }

    setInlineError(null);
    onChange(formatted);
  };

  const handleSelectQuickSlot = (slot) => {
    if (isSlotPassedToday(selectedDate, slot)) {
      setInlineError(`The ${slot} slot has already passed for today. Please select a later time.`);
      return;
    }
    setInlineError(null);
    onChange(slot);
  };

  const handleCustomHourChange = (newHour) => {
    setCustomHour(newHour);
    validateAndApplyCustomTime(newHour, customMinute, customPeriod);
  };

  const handleCustomMinuteChange = (newMinute) => {
    setCustomMinute(newMinute);
    validateAndApplyCustomTime(customHour, newMinute, customPeriod);
  };

  const handleCustomPeriodChange = (newPeriod) => {
    setCustomPeriod(newPeriod);
    validateAndApplyCustomTime(customHour, customMinute, newPeriod);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}>
          Choose a Time
        </span>

        {value && (
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#0A2342',
            background: '#f0f7ff',
            border: '1px solid #bfdbfe',
            padding: '2px 8px',
            borderRadius: 6,
          }}>
            Selected: {value}
          </span>
        )}
      </div>

      {/* ── 3-Column Grid of Quick Selection Buttons ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {slots.map((t) => {
          const isActive = value === t;
          const isPassed = isSlotPassedToday(selectedDate, t);

          return (
            <button
              key={t}
              type="button"
              disabled={isPassed}
              onClick={() => handleSelectQuickSlot(t)}
              style={{
                padding: '12px 8px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: isActive
                  ? '2px solid #0A2342'
                  : isPassed
                  ? '1.5px dashed #cbd5e1'
                  : '1.5px solid #e2e8f0',
                background: isActive
                  ? '#0A2342'
                  : isPassed
                  ? '#f8fafc'
                  : '#ffffff',
                color: isActive
                  ? '#ffffff'
                  : isPassed
                  ? '#94a3b8'
                  : '#334155',
                cursor: isPassed ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isActive ? '0 4px 12px rgba(10,35,66,0.15)' : '0 1px 2px rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isPassed) {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isPassed) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
              aria-label={`Select time slot ${t}${isPassed ? ' (Already passed)' : ''}`}
            >
              <div>{t}</div>
              {isPassed && (
                <div style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}>
                  Passed
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── "Choose a different time" Toggle Button ── */}
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={() => setShowCustomPicker((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 10,
            border: isCustomTime ? '1.5px solid #0A2342' : '1px solid #cbd5e1',
            background: isCustomTime ? '#f0f7ff' : '#ffffff',
            color: '#0A2342',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          aria-expanded={showCustomPicker}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
          <span>Choose a different time</span>
          {isCustomTime && (
            <span style={{
              background: '#0A2342',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 4,
            }}>
              Active
            </span>
          )}
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transition: 'transform 0.2s ease',
              transform: showCustomPicker ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Custom Time Picker Form ── */}
      {showCustomPicker && (
        <div style={{
          marginTop: 12,
          padding: '16px 18px',
          background: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #dbeafe',
          boxShadow: '0 4px 16px rgba(10,35,66,0.05)',
          animation: 'customTimeFade 0.2s ease',
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#0A2342',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>Set Preferred Arrival Time</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Hours: 7:00 AM – 8:30 PM</span>
          </div>

          {/* Controls: Hour : Minute Period */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Hour select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Hour
              </label>
              <select
                value={customHour}
                onChange={(e) => handleCustomHourChange(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0A2342',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Select hour"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((hr) => (
                  <option key={hr} value={hr}>
                    {hr}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: '#94a3b8', paddingTop: 18 }}>
              :
            </div>

            {/* Minute select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Minute
              </label>
              <select
                value={customMinute}
                onChange={(e) => handleCustomMinuteChange(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0A2342',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Select minute"
              >
                {['00', '15', '30', '45'].map((mn) => (
                  <option key={mn} value={mn}>
                    {mn}
                  </option>
                ))}
              </select>
            </div>

            {/* AM / PM Segmented Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Period
              </label>
              <div style={{
                display: 'flex',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                overflow: 'hidden',
                background: '#f8fafc',
              }}>
                {['AM', 'PM'].map((p) => {
                  const isCurrent = customPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleCustomPeriodChange(p)}
                      style={{
                        padding: '9px 14px',
                        border: 'none',
                        background: isCurrent ? '#0A2342' : 'transparent',
                        color: isCurrent ? '#ffffff' : '#475569',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      aria-label={`Select ${p}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 18 }}>
              <button
                type="button"
                onClick={() => validateAndApplyCustomTime(customHour, customMinute, customPeriod)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0A2342, #1E3A8A)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(10,35,66,0.15)',
                  transition: 'opacity 0.15s',
                }}
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inline Validation Feedback ── */}
      {inlineError && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 10,
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#be123c',
          fontWeight: 600,
          animation: 'customTimeFade 0.2s ease',
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{inlineError}</span>
        </div>
      )}

      <style>{`
        @keyframes customTimeFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
