import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  className?: string;
  asChild?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary',
  size = 'md',
  pill = false,
  className = '',
  asChild = false,
  href,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:ring-2 focus:ring-accent/40 focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    secondary: 'bg-panel text-fg hover:bg-fg/5 border border-border',
    ghost: 'bg-transparent text-fg hover:bg-fg/5'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-body',
    lg: 'px-6 py-3 text-base'
  };

  const pillClasses = pill ? 'rounded-pill' : 'rounded-card';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${pillClasses}
    ${className}
  `;

  if (asChild && href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
