'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleNodes() {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const particleCount = 70;

  const [positions, linePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const coords: [number, number, number][] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      coords.push([x, y, z]);
    }

    const linePos: number[] = [];
    const maxDist = 3.2;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist) {
          linePos.push(...coords[i], ...coords[j]);
        }
      }
    }

    return [pos, new Float32Array(linePos)];
  }, [particleCount]);

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

    if (pointsRef.current && linesRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + mousePos.current.x * 0.4;
      pointsRef.current.rotation.x = mousePos.current.y * 0.3;
      linesRef.current.rotation.y = pointsRef.current.rotation.y;
      linesRef.current.rotation.x = pointsRef.current.rotation.x;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#8B5CF6"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#C4B5FD"
          transparent
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralNetworkCanvas() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-80">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={1.0} color="#A7F3D0" />
        <ParticleNodes />
      </Canvas>
    </div>
  );
}
