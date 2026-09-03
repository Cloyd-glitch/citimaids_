import { useState } from 'react';

const WA_NUMBER = '97150000000';
const WA_URL = `https://wa.me/${WA_NUMBER}?text=Hi%20CitiMaids!%20I%20would%20like%20to%20inquire%20about%20your%20cleaning%20services%20in%20Abu%20Dhabi.`;

export default function FloatingWhatsApp() {
  const [tooltip, setTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
      {tooltip && (
        <div
          className="text-white text-xs px-3.5 py-2 rounded-xl font-semibold cursor-pointer shadow-xl flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: '#0A2342', border: '1px solid rgba(255,255,255,0.15)' }}
          onClick={() => setTooltip(false)}
        >
          <span>Need help? Chat on WhatsApp</span>
          <span className="text-slate-400 text-sm hover:text-white">✕</span>
        </div>
      )}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-pulse w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 text-white"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L0 24l6.335-1.509A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.184-1.381l-.372-.22-3.762.897.944-3.658-.242-.378A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </div>
  );
}
