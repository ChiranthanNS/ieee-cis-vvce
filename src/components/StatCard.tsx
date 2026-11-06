import React, { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="relative group overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/15 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 shadow-xl">
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h4 className="text-4xl font-extrabold text-white mt-2 tracking-tight group-hover:text-cyan-300 transition-colors">
            {displayValue.toLocaleString()}
          </h4>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
