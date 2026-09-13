'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const SignInWireframe = dynamic(() => import('./scenes/SignInWireframe'), { ssr: false });
const ListingsWireGrid = dynamic(() => import('./scenes/ListingsWireGrid'), { ssr: false });
const DetailBlueprintMesh = dynamic(() => import('./scenes/DetailBlueprintMesh'), { ssr: false });
const InsightsNetwork = dynamic(() => import('./scenes/InsightsNetwork'), { ssr: false });

export default function SceneRouter() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <SignInWireframe />;
  }
  
  if (pathname === '/insights') {
    return <InsightsNetwork />;
  }

  if (pathname.startsWith('/listings/') || pathname.startsWith('/rentals/') || pathname.startsWith('/projects/')) {
    return <DetailBlueprintMesh />;
  }

  if (pathname === '/listings' || pathname === '/rentals' || pathname === '/projects' || pathname === '/saved') {
    return <ListingsWireGrid />;
  }

  // Default homepage / hero scene
  return <ListingsWireGrid />;
}
