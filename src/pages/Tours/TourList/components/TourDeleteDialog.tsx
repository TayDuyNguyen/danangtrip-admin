import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    tourName: string;
    isDeleting?: boolean;
    isBulk?: boolean;
    count?: number;
}

const TourDeleteDialog = ({ isOpen, onClose, onConfirm, tourName, isDeleting, isBulk, count }: Props) => {
    const { t } = useTranslation('tour');

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-999" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-[32px] text-left align-middle shadow-2xl transition-all border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-[64px] h-[64px] rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="text-[#EF4444]" size={32} />
                                    </div>
                                    <button 
                                        onClick={onClose}
                                        className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-[#1E293B] hover:bg-slate-50 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-[20px] font-bold text-[#1E293B] leading-tight mb-3 font-sans">
                                    {isBulk ? t('dialog.bulk_delete_title') : t('dialog.delete_title')}
                                </Dialog.Title>

                                <div className="space-y-4">
                                    <p className="text-[14px] text-[#64748B] leading-relaxed font-sans">
                                        {isBulk 
                                            ? t('dialog.bulk_delete_confirm', { count })
                                            : t('dialog.delete_confirm', { name: tourName })}
                                    </p>
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <p className="text-[12px] font-bold text-[#DC2626] italic font-sans">
                                            {t('dialog.delete_warning')}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 h-[48px] bg-surface border border-[#E2E8F0] hover:bg-border text-[#64748B] text-[14px] font-bold rounded-2xl transition-all"
                                        onClick={onClose}
                                    >
                                        {t('dialog.button_cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        className="flex-1 px-4 h-[48px] bg-[#EF4444] hover:bg-[#DC2626] text-white text-[14px] font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                        onClick={onConfirm}
                                    >
                                        {isDeleting ? t('dialog.loading_delete') : (isBulk ? t('dialog.button_bulk_delete') : t('dialog.button_delete'))}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TourDeleteDialog;
