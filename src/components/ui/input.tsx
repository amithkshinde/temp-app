import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        const togglePassword = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor={props.id}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        className={`flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-pink)] disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : 'border-slate-200'
                            } ${className} ${isPassword ? 'pr-10' : ''}`}
                        ref={ref}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </button>
                    )}
                </div>
                {error && <p className="text-sm text-red-500 px-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
