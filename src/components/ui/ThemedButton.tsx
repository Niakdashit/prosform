import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useTheme, getButtonStyles } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant = 'primary', size, children, style, ...props }, ref) => {
    const { theme } = useTheme();
    const baseStyles = getButtonStyles(theme);
    
    // Variant overrides
    const variantStyles = {
      primary: {},
      secondary: {
        background: theme.secondaryColor,
      },
      outline: {
        background: 'transparent',
        border: `2px solid ${theme.primaryColor}`,
        color: theme.primaryColor,
      },
      ghost: {
        background: 'transparent',
        color: theme.textColor,
        boxShadow: 'none',
      },
    };

    // Size overrides
    const sizeStyles = {
      sm: { height: '36px', padding: '0 16px', fontSize: '13px' },
      md: { height: '44px', padding: '0 24px', fontSize: '15px' },
      lg: { height: '52px', padding: '0 32px', fontSize: '16px' },
    };

    const finalStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(size ? sizeStyles[size] : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2',
          className
        )}
        style={finalStyles}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ThemedButton.displayName = 'ThemedButton';

export default ThemedButton;
