'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorNDC } from '../useCursorNDC';

export default function DetailBlueprintMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mouse = useCursorNDC();

  // Create grid plane geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 8, 30, 20);
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const position = meshRef.current.geometry.attributes.position;
    
    // Deform vertices based on cursor NDC proximity and sine wave ripples
    for (let i = 0; i < position.count; i++) {
      const vx = position.getX(i);
      const vy = position.getY(i);
      
      const dx = vx - mouse.current.x * 6;
      const dy = vy - mouse.current.y * 4;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const wave = Math.sin(dist * 2 - time * 2) * 0.2;
      const cursorInfluence = Math.max(0, 1 - dist / 3) * 0.4;
      
      position.setZ(i, wave + cursorInfluence);
    }
    
    position.needsUpdate = true;
    meshRef.current.rotation.x = -0.3 + mouse.current.y * 0.1;
    meshRef.current.rotation.y = mouse.current.x * 0.1;
  });

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          wireframe
          color="#EDEDED"
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}
