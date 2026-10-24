import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * Standard quick shortcuts for CitiMaids booking
 */
export const DEFAULT_TIME_SLOTS = [
  '8:00 AM',
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM',
];

/**
 * Operating hours: 7:00 AM (420 min) to 8:30 PM (1230 min)
 */
export const OPERATING_HOURS_START = 7 * 60;       // 7:00 AM
export const OPERATING_HOURS_END = 20 * 60 + 30;   // 8:30 PM

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

  if (hours < 1 || hours > 12) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Check if a time string is within CitiMaids operating hours (7:00 AM to 8:30 PM)
 */
export function isTimeWithinWorkingHours(timeStr) {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) return false;
  return minutes >= OPERATING_HOURS_START && minutes <= OPERATING_HOURS_END;
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

  // Parse hour, minute, period from current value
  const parsedTime = useMemo(() => {
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
    return { hour: '10', minute: '30', period: 'AM' };
  }, [value]);

  const [hourInput, setHourInput] = useState(parsedTime.hour);
  const [minuteInput, setMinuteInput] = useState(parsedTime.minute);
  const [periodInput, setPeriodInput] = useState(parsedTime.period);
  const [inlineError, setInlineError] = useState(null);
  const [justApplied, setJustApplied] = useState(false);

  const minuteInputRef = useRef(null);

  // Sync state if value changes externally
  useEffect(() => {
    if (value) {
      const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        setHourInput(match[1]);
        setMinuteInput(match[2]);
        setPeriodInput(match[3].toUpperCase());
      }
    }
  }, [value]);

  // Revalidate against today's date or working hours
  useEffect(() => {
    if (!value) return;
    if (!isTimeWithinWorkingHours(value)) {
      setInlineError('CitiMaids operating hours are 7:00 AM – 8:30 PM. Please enter a time within working hours.');
      return;
    }
    if (isSlotPassedToday(selectedDate, value)) {
      setInlineError('Selected time has already passed for today. Please select an upcoming slot.');
      return;
    }
    setInlineError(null);
  }, [selectedDate, value]);

  /**
   * Validate user-typed time and update parent only if valid
   */
  const validateAndApplyTypedTime = (h, m, p) => {
    const rawH = String(h).trim();
    const rawM = String(m).trim();

    if (!rawH || !rawM) {
      setInlineError('Please enter both hour and minute.');
      return;
    }

    const numH = parseInt(rawH, 10);
    const numM = parseInt(rawM, 10);

    if (isNaN(numH) || numH < 1 || numH > 12) {
      setInlineError('Hour must be between 1 and 12.');
      return;
    }

    if (isNaN(numM) || numM < 0 || numM > 59) {
      setInlineError('Minute must be between 00 and 59.');
      return;
    }

    const formattedTime = formatTime12(numH, numM, p);
    const minutesFromMidnight = parseTimeToMinutes(formattedTime);

    // Enforce working hours strictly: 7:00 AM to 8:30 PM
    if (minutesFromMidnight < OPERATING_HOURS_START || minutesFromMidnight > OPERATING_HOURS_END) {
      setInlineError('CitiMaids operating hours are 7:00 AM – 8:30 PM. We do not accept bookings outside working hours.');
      return;
    }

    // Check if time has passed for today
    if (isSlotPassedToday(selectedDate, formattedTime)) {
      setInlineError('This time has already passed for today. Please enter an upcoming time.');
      return;
    }

    setInlineError(null);
    setJustApplied(true);
    onChange(formattedTime);
    setTimeout(() => {
      setJustApplied(false);
    }, 2500);
  };

  const handleHourChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setHourInput(val);
    setInlineError(null);
    setJustApplied(false);
    if (val.length === 2 && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 12) {
      minuteInputRef.current?.focus();
    }
  };

  const handleMinuteChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMinuteInput(val);
    setInlineError(null);
    setJustApplied(false);
  };

  const handlePeriodToggle = (newPeriod) => {
    setPeriodInput(newPeriod);
    setInlineError(null);
    setJustApplied(false);
  };

  const handleApplyTime = () => {
    validateAndApplyTypedTime(hourInput, minuteInput, periodInput);
  };

  const handleSelectQuickSlot = (slot) => {
    if (isSlotPassedToday(selectedDate, slot)) {
      setInlineError(`The ${slot} slot has already passed for today. Please select a later time.`);
      return;
    }
    setInlineError(null);
    setJustApplied(false);
    onChange(slot);
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* ── Section Title (Clean, without top Selected text badge) ── */}
      <div style={{ marginBottom: 10 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}>
          Choose a Time
        </span>
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

      {/* ── "Choose a different time" Drop Button (Matching services accordion style) ── */}
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={() => setShowCustomPicker((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '9px 14px',
            borderRadius: 12,
            border: showCustomPicker || isCustomTime ? '1.5px solid #0A2342' : '1.5px solid #e2e8f0',
            background: showCustomPicker || isCustomTime ? '#f0f7ff' : '#ffffff',
            color: '#0A2342',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
          aria-expanded={showCustomPicker}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            <span>Choose a different time</span>
          </div>

          {/* Smooth Drop Arrow Chevron */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
          }}>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke={showCustomPicker ? '#0A2342' : '#94a3b8'}
              strokeWidth="2.4"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s',
                transform: showCustomPicker ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* ── Collapsible Custom Time Input Panel (Smooth CSS Grid Animation) ── */}
      <div style={{
        display: 'grid',
        gridTemplateRows: showCustomPicker ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            marginTop: 10,
            padding: '16px 18px',
            background: '#ffffff',
            borderRadius: 14,
            border: '1.5px solid #dbeafe',
            boxShadow: '0 4px 16px rgba(10,35,66,0.04)',
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#0A2342',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>Enter Preferred Time</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                Working Hours: 7:00 AM – 8:30 PM
              </span>
            </div>

            {/* Direct Input Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Hour Input Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Hour
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={hourInput}
                  onChange={handleHourChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyTime();
                    }
                  }}
                  placeholder="09"
                  maxLength={2}
                  style={{
                    width: 58,
                    height: 44,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#0A2342',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 10,
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0A2342';
                    e.target.style.boxShadow = '0 0 0 3px rgba(10,35,66,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                  aria-label="Input hour"
                />
              </div>

              {/* Colon Separator */}
              <div style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#64748b',
                paddingTop: 16,
                userSelect: 'none',
              }}>
                :
              </div>

              {/* Minute Input Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Minute
                </span>
                <input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={minuteInput}
                  onChange={handleMinuteChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyTime();
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                  style={{
                    width: 58,
                    height: 44,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#0A2342',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 10,
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0A2342';
                    e.target.style.boxShadow = '0 0 0 3px rgba(10,35,66,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                  aria-label="Input minute"
                />
              </div>

              {/* AM / PM Toggle Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Period
                </span>
                <div style={{
                  display: 'flex',
                  height: 44,
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  overflow: 'hidden',
                  background: '#f8fafc',
                }}>
                  {['AM', 'PM'].map((p) => {
                    const isCurrent = periodInput === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodToggle(p)}
                        style={{
                          padding: '0 16px',
                          border: 'none',
                          background: isCurrent ? '#0A2342' : 'transparent',
                          color: isCurrent ? '#ffffff' : '#64748b',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label={`Set period to ${p}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm / Apply Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 18 }}>
                <button
                  type="button"
                  onClick={handleApplyTime}
                  style={{
                    height: 44,
                    padding: '0 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: justApplied
                      ? '#059669'
                      : 'linear-gradient(135deg, #0A2342, #1E3A8A)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: justApplied
                      ? '0 2px 8px rgba(5,150,105,0.25)'
                      : '0 2px 8px rgba(10,35,66,0.15)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  aria-label="Apply preferred time"
                >
                  {justApplied ? (
                    <>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Applied ✓</span>
                    </>
                  ) : (
                    <span>Apply Time</span>
                  )}
                </button>
              </div>
            </div>

            {/* Helper guidance: prompts user to tap Apply Time to reflect */}
            {hourInput && minuteInput && !justApplied && (
              <div style={{
                marginTop: 10,
                fontSize: 11,
                color: '#2563eb',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                </svg>
                <span>Tap "Apply Time" to reflect this preferred time in your order summary.</span>
              </div>
            )}

            {justApplied && (
              <div style={{
                marginTop: 10,
                fontSize: 11,
                color: '#059669',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Preferred time applied and reflected in your order summary!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Inline Validation Error Message ── */}
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
          animation: 'errorFadeIn 0.2s ease',
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{inlineError}</span>
        </div>
      )}

      <style>{`
        @keyframes errorFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
