'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function MinimalistHouseModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.2}>
      {/* Base Foundation Slab */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#292524" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Main Glass/Concrete Structure */}
      <mesh position={[-0.8, 0.9, 0]}>
        <boxGeometry args={[2, 1.8, 2.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Terracotta Modern Roof Slab */}
      <mesh position={[-0.6, 1.85, 0]}>
        <boxGeometry args={[2.6, 0.15, 2.6]} />
        <meshStandardMaterial color="#c2410c" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Cantilevered Second Level Pavilion */}
      <mesh position={[0.8, 0.7, 0.2]}>
        <boxGeometry args={[1.8, 1.4, 1.8]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Warm Golden Glow Interior Window Mesh */}
      <mesh position={[-0.8, 0.9, 1.11]}>
        <planeGeometry args={[1.4, 1.2]} />
        <meshBasicMaterial color="#fef08a" opacity={0.8} transparent />
      </mesh>

      {/* Architectural Support Columns */}
      {[-1.8, 1.6].map((x, i) => (
        <mesh key={i} position={[x, 0.8, -1.2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
          <meshStandardMaterial color="#ea580c" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}

      {/* Ambient Floating Geometry Elements */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[1.8, 2.2, -1]}>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#f59e0b" wireframe />
        </mesh>
      </Float>
    </group>
  );
}

export default function Hero3DCanvas() {
  return (
    <div className="w-full h-full relative pointer-events-none">
      <Canvas
        camera={{ position: [5, 4, 6], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Warm Golden Hour Lighting Rig */}
        <ambientLight intensity={0.7} color="#fde68a" />
        <directionalLight position={[10, 15, 8]} intensity={2.2} color="#f59e0b" castShadow />
        <directionalLight position={[-8, -5, -5]} intensity={0.5} color="#ea580c" />
        <pointLight position={[0, 2, 0]} intensity={1.5} color="#fef08a" distance={5} />

        <MinimalistHouseModel />
      </Canvas>
    </div>
  );
}
