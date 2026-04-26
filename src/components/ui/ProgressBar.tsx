import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProgressBarProps {
    value: number;
    max: number;
    className?: string;
    showText?: boolean;
    color?: 'blue' | 'green' | 'red' | 'yellow';
}

const ProgressBar = ({ 
    value, 
    max, 
    className, 
    showText = false,
    color = 'blue'
}: ProgressBarProps) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const colors = {
        blue: 'bg-[#14b8a6]',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="flex justify-between items-center mb-1">
                {showText && (
                    <span className="text-xs font-medium text-gray-700">
                        {value} / {max}
                    </span>
                )}
                <span className="text-xs font-medium text-gray-500">{Math.round(percentage)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={cn('h-full transition-all duration-500 ease-out', colors[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
