'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursorNDC } from '../useCursorNDC';

export default function ListingsWireGrid() {
  const groupRef = useRef<THREE.Group>(null!);
  const mouse = useCursorNDC();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -Math.PI / 2.8 + mouse.current.y * 0.08;
      groupRef.current.rotation.z = mouse.current.x * 0.05;
      groupRef.current.position.y = -3 + mouse.current.y * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -3, -5]}>
      {/* Horizon Grid Mesh */}
      <gridHelper
        args={[50, 50, '#EDEDED', '#8A8A8A']}
        position={[0, 0, 0]}
      >
        <lineBasicMaterial
          attach="material"
          color="#EDEDED"
          transparent
          opacity={0.12}
        />
      </gridHelper>

      {/* Floating Blueprint Reference Nodes */}
      {[
        [-8, 0, -5],
        [10, 0, -12],
        [-12, 0, -18],
        [6, 0, -8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial wireframe color="#EDEDED" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}
