import React from 'react';

export default function CircularGauge({ score, size = 180, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#ef4444'; // Red
  let statusLabel = 'Critical Non-Compliance';
  let badgeClass = 'bg-red-500/20 text-red-400 border-red-500/30';

  if (normalizedScore >= 90) {
    color = '#10b981'; // Emerald
    statusLabel = 'Strong Baseline';
    badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (normalizedScore >= 75) {
    color = '#6366f1'; // Indigo
    statusLabel = 'Good Standing';
    badgeClass = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
  } else if (normalizedScore >= 50) {
    color = '#f59e0b'; // Amber
    statusLabel = 'Needs Remediation';
    badgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight" style={{ color }}>
            {normalizedScore}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Out of 100
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
        {statusLabel}
      </div>
    </div>
  );
}

