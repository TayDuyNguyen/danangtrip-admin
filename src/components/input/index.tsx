import { FaEye, FaEyeSlash } from "react-icons/fa";
import { type ReactNode, type InputHTMLAttributes, type HTMLInputTypeAttribute, forwardRef } from "react";

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
        <div className={`w-full ${className}`}>
            {label && (
                <label className={`block text-sm bg-transparent font-medium mb-1  transition-colors duration-200
                    ${isFocused ? 'text-cyan-300' : 'text-transparent'}
                    ${error ? 'text-red-500' : ''}
                `}>
                    {label}
                </label>
            )}
            <div
                className={`
                    flex items-center border-b px-3 gap-2 
                    transition-colors duration-200
                    ${error ? 'border-red-500' : isFocused ? 'border-cyan-300' : 'border-gray-500'}
                `}
            >
                {leftIcon && (
                    <span className={`text-lg ${isFocused ? 'text-cyan-300' : 'text-gray-500'}`}>
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
                        w-full py-2 bg-transparent outline-none text-white placeholder-gray-500
                        focus:placeholder-transparent 
                        ${leftIcon ? 'pl-1' : ''}
                        ${isPassword ? 'pr-8' : ''}
                    `}
                    {...props}
                />
                {isPassword && onTogglePassword && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
});

export default Input;