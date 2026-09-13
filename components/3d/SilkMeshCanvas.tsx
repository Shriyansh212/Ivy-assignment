'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RipplingSilkPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.targetX = x;
      mousePos.current.targetY = y;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
    mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const geom = meshRef.current.geometry as THREE.PlaneGeometry;
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt((x - mousePos.current.x * 4) ** 2 + (y - mousePos.current.y * 4) ** 2);
        const z = Math.sin(dist * 1.5 - time * 2) * 0.25 + Math.cos(x * 2 + time) * 0.15;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      meshRef.current.rotation.z = time * 0.05 + mousePos.current.x * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, 0, -2]}>
      <planeGeometry args={[16, 12, 48, 48]} />
      <meshPhysicalMaterial
        color="#DDD6FE"
        emissive="#A7F3D0"
        emissiveIntensity={0.25}
        roughness={0.2}
        metalness={0.1}
        wireframe={false}
        transmission={0.4}
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

export default function SilkMeshCanvas() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-70">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#BAE6FD" />
        <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#FED7AA" />
        <RipplingSilkPlane />
      </Canvas>
    </div>
  );
}
