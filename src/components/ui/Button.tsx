import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'neon' | 'dark' | 'bracket' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  href,
  variant = 'neon',
  size = 'md',
  className,
  children,
  icon,
  ...props
}: ButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-between font-mono uppercase tracking-wider transition-all duration-300 select-none group";
  
  const sizeClasses = {
    sm: "text-[11px] px-3 py-1.5 gap-x-2",
    md: "text-xs px-4 py-2.5 gap-x-3",
    lg: "text-sm px-6 py-3.5 gap-x-4",
  };

  let variantClasses = "";
  if (variant === 'neon') {
    variantClasses = "btn-wipe-neon";
  } else if (variant === 'dark') {
    variantClasses = "btn-wipe-dark";
  } else if (variant === 'bracket') {
    variantClasses = "text-neon hover:text-white bg-transparent p-0 font-mono text-xs tracking-widest transition-opacity";
  } else if (variant === 'outline') {
    variantClasses = "border border-white/20 text-white hover:border-neon hover:text-neon bg-black/40 backdrop-blur-sm";
  }

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        <span className="font-semibold">{children}</span>
      </span>
      {icon ? (
        <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      ) : variant === 'neon' ? (
        <span className="relative z-10 text-[8px]">■</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        id={props.id}
        title={props.title}
        tabIndex={props.tabIndex}
        role={props.role}
        aria-label={props['aria-label']}
        className={cn(baseClasses, variant !== 'bracket' && sizeClasses[size], variantClasses, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(baseClasses, variant !== 'bracket' && sizeClasses[size], variantClasses, className)}
      {...props}
    >
      {content}
    </button>
  );
}
