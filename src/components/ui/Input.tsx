import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1 w-full">
                {label && <label className="text-sm font-bold text-gray-700">{label}</label>}
                <input
                    ref={ref}
                    className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${error
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-blue-100 focus:border-[#006bff]'
                        } ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
