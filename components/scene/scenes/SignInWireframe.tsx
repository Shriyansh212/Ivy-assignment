'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorNDC } from '../useCursorNDC';

export default function SignInWireframe() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const mouse = useCursorNDC();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x = mouse.current.y * 0.4;
      meshRef.current.rotation.z = mouse.current.x * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.4;
      innerRef.current.rotation.x = -mouse.current.y * 0.2;
    }
  });

  return (
    <group position={[2.5, 0, 0]}>
      {/* Outer Displaced Wireframe Structure */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.4, 2]} />
        <meshBasicMaterial
          wireframe
          color="#EDEDED"
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner Blueprint Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          wireframe
          color="#8A8A8A"
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Accent Point Lights */}
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#EDEDED" />
    </group>
  );
}
