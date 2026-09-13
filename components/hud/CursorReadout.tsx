'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CursorReadout() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rawPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rawPos.current = { x: e.clientX, y: e.clientY };
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          setPos({ x: rawPos.current.x, y: rawPos.current.y });
          rafId.current = null;
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-5 right-6 z-[9999] font-mono text-[11px] uppercase tracking-widest text-[#8A8A8A] bg-[#050505]/80 px-3 py-1.5 border border-[rgba(255,255,255,0.12)] backdrop-blur-md pointer-events-none select-none flex items-center gap-3 shadow-lg"
      aria-hidden="true"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#EDEDED] animate-pulse" />
      <span>X:{pos.x.toString().padStart(4, '0')}PX</span>
      <span className="opacity-30">|</span>
      <span>Y:{pos.y.toString().padStart(4, '0')}PX</span>
    </div>
  );
}
