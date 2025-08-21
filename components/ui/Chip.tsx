import { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Chip({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}: ChipProps) {
  const baseClasses = 'inline-flex items-center rounded-pill font-medium border';
  
  const variantClasses = {
    default: 'bg-muted/10 text-muted border-muted/20',
    primary: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}
