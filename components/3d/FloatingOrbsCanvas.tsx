'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function SpheresGroup() {
  const groupRef = useRef<THREE.Group>(null!);
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

  useFrame(() => {
    mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
    mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.y = mousePos.current.x * 0.35;
      groupRef.current.rotation.x = -mousePos.current.y * 0.25;
    }
  });

  const orbData = [
    { position: [-3.5, 2, -2] as [number, number, number], scale: 1.4, color: '#DDD6FE' }, // Soft Lilac
    { position: [4, 1.5, -3] as [number, number, number], scale: 1.8, color: '#A7F3D0' },  // Mint Green
    { position: [-2, -2.5, -1] as [number, number, number], scale: 1.2, color: '#FED7AA' }, // Glowing Peach
    { position: [3.5, -2, -2] as [number, number, number], scale: 1.5, color: '#BAE6FD' },   // Baby Blue
    { position: [0, 3, -4] as [number, number, number], scale: 2.2, color: '#FBCFE8' },    // Soft Rose
  ];

  return (
    <group ref={groupRef}>
      {orbData.map((orb, index) => (
        <Float key={index} speed={1.5 + index * 0.2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={orb.position} scale={orb.scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial
              color={orb.color}
              roughness={0.15}
              metalness={0.05}
              transmission={0.6}
              thickness={1.2}
              ior={1.33}
              transparent
              opacity={0.85}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function FloatingOrbsCanvas() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-80 transition-opacity duration-700">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#ddd6fe" />
        <pointLight position={[0, 0, 5]} intensity={1.0} color="#a7f3d0" />
        <SpheresGroup />
      </Canvas>
    </div>
  );
}
