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
                    <label className="text-sm font-semibold text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block" htmlFor={props.id}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-pink)] disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 opacity-100 ${error ? 'border-red-500' : 'border-slate-200'
                            } ${className} ${isPassword ? 'pr-10' : ''} [--date-icon-position:right]`}
                        ref={ref}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        style={{ colorScheme: 'light' }}
                        {...props}
                    />
                    <style jsx>{`
                        input[type="date"]::-webkit-calendar-picker-indicator {
                            background: transparent;
                            bottom: 0;
                            color: transparent;
                            cursor: pointer;
                            height: auto;
                            left: 0;
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: auto;
                            z-index: 10; 
                            /* Using a custom icon or leveraging lucide icon overlay would be cleaner, but standard requested "Move calendar icon to far right" */
                            /* Native solution: */
                        }
                        /* Re-style: We want the icon visible on right. */
                    `}</style>
                    {/* Wait, the request is "move user-agent indicator". 
                        Resetting: The easiest way to consistently style date inputs in React/Tailwind without a custom component is using flex row-reverse is unreliable.
                        Better: Absolute positioning the indicator.
                     */}
                    <style jsx global>{`
                        input[type="date"] {
                            position: relative;
                        }
                        input[type="date"]::-webkit-calendar-picker-indicator {
                            position: absolute;
                            right: 12px;
                            opacity: 0.6;
                            cursor: pointer;
                        }
                        input[type="date"]::-webkit-calendar-picker-indicator:hover {
                            opacity: 1;
                        }
                    `}</style>

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
