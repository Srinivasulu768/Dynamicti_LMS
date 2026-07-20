import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-navy-800 hover:bg-navy-700 text-white': variant === 'primary',
            'bg-gray-100 hover:bg-gray-200 text-gray-800': variant === 'secondary',
            'bg-gold-500 hover:bg-gold-400 text-navy-900': variant === 'gold',
            'hover:bg-gray-100 text-gray-600': variant === 'ghost',
            'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
            'border border-gray-300 hover:bg-gray-50 text-gray-700': variant === 'outline',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
