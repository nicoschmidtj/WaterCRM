import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'card' | 'elev';
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'card'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5 md:p-6',
    lg: 'p-6 md:p-8'
  };

  const shadowClasses = {
    card: 'shadow-card',
    elev: 'shadow-elev'
  };

  return (
    <div className={`
      bg-panel border border-border rounded-card
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${className}
    `}>
      {children}
    </div>
  );
}
