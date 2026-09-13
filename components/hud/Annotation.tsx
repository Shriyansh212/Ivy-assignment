'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnnotationProps {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  detail?: string;
  isAlert?: boolean;
}

export function Annotation({ x, y, label, detail, isAlert = false }: AnnotationProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryColor = isAlert ? '#FF3B30' : '#EDEDED';
  const borderColor = isAlert ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <div
      className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 group cursor-crosshair"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Anchor Dot */}
      <div className="relative flex items-center justify-center">
        <span
          className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-150"
          style={{ backgroundColor: primaryColor }}
        />
        <span
          className="absolute w-5 h-5 rounded-full animate-ping opacity-40 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Hairline Connector Line & Label Box */}
      <motion.div
        initial={{ opacity: 0.6, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0.75, y: isHovered ? 0 : 5 }}
        className="absolute left-4 bottom-4 flex flex-col pointer-events-none min-w-[180px]"
      >
        {/* Connector Line */}
        <div
          className="w-6 h-px mb-1 origin-left"
          style={{ backgroundColor: borderColor }}
        />

        {/* Label Box */}
        <div
          className="p-2.5 bg-[#050505]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] text-left shadow-xl"
          style={{ borderColor: isHovered ? primaryColor : 'rgba(255, 255, 255, 0.12)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              {label}
            </span>
            <span className="font-mono text-[9px] text-[#8A8A8A]">
              [{x.toFixed(0)}:{y.toFixed(0)}]
            </span>
          </div>

          {detail && (
            <p className="mt-1 text-[11px] text-[#8A8A8A] font-sans leading-tight">
              {detail}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
