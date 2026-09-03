import { useState, useRef, useCallback } from 'react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  label = "Living Room Deep Clean",
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-xl border border-blue-100/50">
      <div
        ref={containerRef}
        className="relative h-72 md:h-80 w-full overflow-hidden select-none cursor-ew-resize group"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
      >
        {/* After image (full width background) */}
        <img
          src={afterImage}
          alt="After cleaning"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before image (clipped by slider position) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Before cleaning"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw',
              maxWidth: 'none',
            }}
          />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg pointer-events-none tracking-wider">
          {beforeLabel}
        </div>
        <div
          className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-lg pointer-events-none tracking-wider shadow-md"
          style={{ background: 'linear-gradient(135deg,#0A2342,#1E3A8A)' }}
        >
          {afterLabel}
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center border-2 text-xs font-bold transition-transform group-hover:scale-110"
            style={{ borderColor: '#0A2342', color: '#0A2342' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Caption bar */}
      <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between border-t border-slate-100 text-sm">
        <span className="font-semibold text-slate-800">{label}</span>
        <span className="text-xs text-blue-800 font-medium flex items-center gap-1">
          <span>⟷</span> Drag slider to compare
        </span>
      </div>
    </div>
  );
}
