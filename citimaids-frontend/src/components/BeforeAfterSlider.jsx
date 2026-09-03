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

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging || e.buttons === 1) {
      updatePosition(e.clientX);
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-200/80 transition-all duration-300 hover:shadow-2xl">
      {/* Visual Frame */}
      <div
        ref={containerRef}
        className="relative h-80 sm:h-96 w-full overflow-hidden select-none cursor-ew-resize group"
        onMouseDown={(e) => {
          setIsDragging(true);
          updatePosition(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          if (e.touches && e.touches[0]) updatePosition(e.touches[0].clientX);
        }}
        onTouchMove={handleTouchMove}
      >
        {/* AFTER Image (Full Layer) */}
        <img
          src={afterImage}
          alt={`${label} - After`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        {/* BEFORE Image (Clipped via clip-path) */}
        <img
          src={beforeImage}
          alt={`${label} - Before`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
          loading="lazy"
        />

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg pointer-events-none tracking-wider shadow-lg">
          {beforeLabel}
        </div>
        <div
          className="absolute top-4 right-4 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg pointer-events-none tracking-wider shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0A2342 0%, #1E3A8A 100%)' }}
        >
          {afterLabel}
        </div>

        {/* Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-slate-900 text-slate-900 transition-transform duration-150 group-hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 sm:p-5 flex items-center justify-between bg-slate-50 border-t border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">Verified Result</span>
          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{label}</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <span>⇄</span>
          <span>Drag to compare</span>
        </div>
      </div>
    </div>
  );
}
