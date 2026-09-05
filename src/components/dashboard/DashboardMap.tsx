'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MapEngine = dynamic(() => import('./MapEngine'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0c0c0c] flex flex-col items-center justify-center font-mono text-xs text-zinc-400 gap-3">
      <div className="h-6 w-6 border-2 border-neon border-t-transparent animate-spin rounded-none" />
      <span className="text-[11px] uppercase tracking-wider text-neon">
        INITIALIZING GEOSPATIAL INTELLIGENCE GRID...
      </span>
      <span className="text-[9px] text-zinc-600">
        OPENSTREETMAP • CFCFRMS TELEMETRY SYNC
      </span>
    </div>
  ),
});

export default function DashboardMap(props: any) {
  return <MapEngine {...props} />;
}
