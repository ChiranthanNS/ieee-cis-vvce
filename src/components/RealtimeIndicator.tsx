import React from 'react';
import { Activity } from 'lucide-react';

export const RealtimeIndicator: React.FC<{ label?: string }> = ({ label = 'Live Sync Active' }) => {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
      </span>
      <span className="tracking-wide hidden sm:inline">{label}</span>
      <Activity className="w-3 h-3 text-cyan-400 sm:hidden" />
    </div>
  );
};
