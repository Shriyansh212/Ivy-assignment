'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Session-level in-memory flag so boot sequence plays once per page lifecycle
let hasBooted = false;

const LINES = [
  '001 INITIALIZE INTERFACE',
  '002 LOAD SCENE MODULES',
  '003 CALIBRATE VIEWPORT',
  '004 SYNC CURSOR INPUT',
  '005 READY',
];

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (hasBooted) return;
    hasBooted = true;
    setVisible(true);

    let step = 0;
    const interval = setInterval(() => {
      if (step < LINES.length) {
        setCurrentLineIndex(step);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
        }, 400);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed top-5 left-6 z-[9998] font-mono text-[11px] uppercase tracking-widest text-[#8A8A8A] bg-[#050505]/90 border border-[rgba(255,255,255,0.12)] p-3 backdrop-blur-md pointer-events-none select-none min-w-[240px]"
        >
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.12)] pb-1.5 mb-2 text-[10px] text-[#EDEDED]">
            <span>SYS // BOOT_SEQ</span>
            <span className="w-1.5 h-1.5 bg-[#EDEDED] animate-ping" />
          </div>
          <div className="space-y-1">
            {LINES.map((line, idx) => (
              <div
                key={line}
                className={`transition-opacity duration-150 flex items-center justify-between ${
                  idx <= currentLineIndex ? 'opacity-100' : 'opacity-0'
                } ${idx === currentLineIndex ? 'text-[#EDEDED]' : 'text-[#8A8A8A]'}`}
              >
                <span>{line}</span>
                {idx === currentLineIndex && <span className="text-[10px] text-[#EDEDED]">[OK]</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
