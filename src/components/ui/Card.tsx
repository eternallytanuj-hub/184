import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'glass' | 'platinum';
  crosshairs?: boolean;
}

export default function Card({
  children,
  variant = 'dark',
  crosshairs = true,
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    dark: "bg-[#111111] border border-white/10 text-white",
    glass: "bg-black/60 backdrop-blur-xl border border-white/15 text-white shadow-2xl",
    platinum: "bg-white border border-black/10 text-black shadow-sm",
  };

  return (
    <div
      className={cn(
        "relative p-6 transition-all duration-300 group",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {crosshairs && (
        <>
          <span className="absolute -top-1.5 -left-1.5 font-mono text-[10px] text-zinc-600 select-none group-hover:text-neon transition-colors">+</span>
          <span className="absolute -top-1.5 -right-1.5 font-mono text-[10px] text-zinc-600 select-none group-hover:text-neon transition-colors">+</span>
          <span className="absolute -bottom-1.5 -left-1.5 font-mono text-[10px] text-zinc-600 select-none group-hover:text-neon transition-colors">+</span>
          <span className="absolute -bottom-1.5 -right-1.5 font-mono text-[10px] text-zinc-600 select-none group-hover:text-neon transition-colors">+</span>
        </>
      )}
      {children}
    </div>
  );
}
