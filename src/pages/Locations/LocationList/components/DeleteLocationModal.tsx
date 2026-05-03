import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    locationName: string;
    isDeleting?: boolean;
}

const DeleteLocationModal = ({
    isOpen,
    onClose,
    onConfirm,
    locationName,
    isDeleting
}: DeleteLocationModalProps) => {
    const { t } = useTranslation('location');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                            <AlertTriangle size={26} />
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        {t('actions.confirm_delete')}
                    </h3>
                    
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
                        <span dangerouslySetInnerHTML={{ __html: t('messages.delete_confirm', { name: locationName }) }} />
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                        <p className="text-[12px] font-bold text-amber-700 leading-tight">
                            {t('messages.delete_warning')}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="rounded-xl px-6 font-bold"
                    >
                        {t('actions.cancel')}
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={onConfirm}
                        isLoading={isDeleting}
                        className="rounded-xl px-6 font-bold shadow-lg shadow-rose-500/20"
                    >
                        {t('actions.delete')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default memo(DeleteLocationModal);
