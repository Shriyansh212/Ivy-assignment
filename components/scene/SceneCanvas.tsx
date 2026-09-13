'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import SceneRouter from './SceneRouter';

export default function SceneCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} color="#EDEDED" />
        <SceneRouter />
      </Canvas>
    </div>
  );
}
