'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function useCursorNDC() {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isReducedMotion = useRef(false);

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMove = (e: MouseEvent) => {
      if (isReducedMotion.current) return;
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    if (isReducedMotion.current) return;
    // Damped lerp
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;
  });

  return mouse;
}
