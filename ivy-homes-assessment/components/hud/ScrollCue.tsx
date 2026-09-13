'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollCue() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none select-none"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A] bg-[#050505]/70 px-3 py-1 border border-[rgba(255,255,255,0.12)] backdrop-blur-sm">
            [ SCROLL TO CONTINUE ]
          </span>
          <div className="w-4 h-6 border border-[rgba(255,255,255,0.2)] rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-[#EDEDED] rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
