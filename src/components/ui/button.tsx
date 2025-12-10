import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

        let variantStyles = "";
        if (variant === 'primary') {
            variantStyles = "bg-[var(--color-brand-pink)] text-white hover:opacity-90 active:scale-95 shadow-sm";
        } else if (variant === 'secondary') {
            variantStyles = "bg-slate-100 text-slate-900 hover:bg-[#DADADA] hover:shadow-sm";
        } else if (variant === 'outline') {
            variantStyles = "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900";
        } else if (variant === 'ghost') {
            variantStyles = "hover:bg-slate-100 text-slate-600";
        }

        let sizeStyles = "h-11 px-8 py-2";
        if (size === 'sm') sizeStyles = "h-9 rounded-lg px-3";
        if (size === 'lg') sizeStyles = "h-12 rounded-lg px-8";
        if (size === 'icon') sizeStyles = "h-10 w-10";

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
