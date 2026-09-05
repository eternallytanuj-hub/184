import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neon' | 'zinc' | 'critical' | 'outline' | 'pulse';
  className?: string;
  dot?: boolean;
}

export default function Badge({
  children,
  variant = 'zinc',
  className,
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    neon: "text-neon border-neon/30 bg-neon/10",
    zinc: "text-zinc-400 border-white/10 bg-white/5",
    critical: "text-red-400 border-red-500/30 bg-red-500/10",
    outline: "text-zinc-300 border-white/20 bg-transparent",
    pulse: "text-neon border-white/10 bg-black/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-neon opacity-75"></span>
          <span className="relative inline-flex rounded-none h-1.5 w-1.5 bg-neon"></span>
        </span>
      )}
      <span>[</span>
      <span className="font-mono">{children}</span>
      <span>]</span>
    </span>
  );
}
