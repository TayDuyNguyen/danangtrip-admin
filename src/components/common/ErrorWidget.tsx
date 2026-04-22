import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';

interface ErrorWidgetProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

const ErrorWidget = ({
    title,
    message,
    onRetry,
    className,
}: ErrorWidgetProps) => {
    const { t } = useTranslation('dashboard');

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 text-center bg-red-50/30 rounded-3xl border border-red-100/50 h-full", className)}>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 text-red-500">
                <AlertCircle size={24} />
            </div>
            <h4 className="text-sm font-black text-red-900 leading-tight">
                {title || t('dashboard:error_states.title')}
            </h4>
            {message && <p className="text-[11px] font-bold text-red-400 mt-1 max-w-[240px] leading-relaxed">{message}</p>}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-white border border-red-100 text-red-600 text-xs font-black rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm active:scale-95"
                >
                    <RefreshCw size={12} />
                    {t('dashboard:retry')}
                </button>
            )}
        </div>
    );
};

export default ErrorWidget;
