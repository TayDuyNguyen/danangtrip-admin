import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface SaveBarProps {
    isVisible: boolean;
    isSubmitting: boolean;
    onDiscard: () => void;
    onSave: () => void;
}

const SaveBar = ({ isVisible, isSubmitting, onDiscard, onSave }: SaveBarProps) => {
    const { t } = useTranslation('settings');

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white rounded-2xl px-6 py-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                            {t('actions.unsaved_title')}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {t('actions.unsaved_desc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                    <button
                        type="button"
                        onClick={onDiscard}
                        disabled={isSubmitting}
                        className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {t('actions.discard')}
                    </button>
                    <Button
                        type="button"
                        onClick={onSave}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="bg-[#14b8a6] hover:bg-[#0f766e] text-white text-xs font-bold px-5 h-10 rounded-xl shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                    >
                        {t('actions.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SaveBar;
