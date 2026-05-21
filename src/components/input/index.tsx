import { FaEye, FaEyeSlash } from "react-icons/fa";
import { type ReactNode, type InputHTMLAttributes, type HTMLInputTypeAttribute, forwardRef, memo } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    leftIcon?: ReactNode;
    isPassword?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    error?: string;
    isFocused?: boolean;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    type?: HTMLInputTypeAttribute;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    leftIcon,
    isPassword = false,
    showPassword = false,
    onTogglePassword,
    error,
    isFocused = false,
    onClick,
    onFocus,
    onBlur,
    className = '',
    type = 'text',
    ...props
}: InputProps, ref) => {
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type || 'text';

    return (
        <div className={`w-full group ${className}`}>
            {label && (
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider transition-all duration-300 transform
                    ${isFocused ? 'text-[#14b8a6] translate-y-0 opacity-100' : 'text-transparent -translate-y-1 opacity-0'}
                    ${error ? 'text-red-500 opacity-100 translate-y-0' : ''}
                `}>
                    {label}
                </label>
            )}
            <div
                className={`
                    flex items-center border-b px-3 gap-3 
                    transition-all duration-500 ease-out
                    ${error ? 'border-red-500' : isFocused ? 'border-[#14b8a6]' : 'border-slate-200'}
                    bg-transparent
                `}
            >
                {leftIcon && (
                    <span className={`text-xl transition-colors duration-300 ${isFocused ? 'text-[#14b8a6]' : 'text-gray-500'}`}>
                        {leftIcon}
                    </span>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    onClick={onClick}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className={`
                        w-full py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400
                        transition-all duration-300
                        focus:placeholder-transparent 
                        text-sm sm:text-base
                        ${leftIcon ? 'pl-1' : ''}
                        ${isPassword ? 'pr-8' : ''}
                    `}
                    {...props}
                />
                {isPassword && onTogglePassword && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="p-2 -mr-2 text-gray-500 hover:text-[#14b8a6] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 rounded-full"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                )}
            </div>
            <div className="h-5 overflow-hidden">
                {error && (
                    <p className="mt-1 text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-300">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
});

export default memo(Input);
