import { useBlocker } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
    isDirty: boolean;
}

export const UnsavedChangesGuard = ({ isDirty }: Props) => {
    const { t } = useTranslation(['common']);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    const handleConfirm = () => {
        if (blocker.proceed) {
            blocker.proceed();
        }
    };

    const handleCancel = () => {
        if (blocker.reset) {
            blocker.reset();
        }
    };

    return (
        <Transition appear show={blocker.state === 'blocked'} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={handleCancel}>
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
                                    <div className="w-[56px] h-[56px] rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="text-amber-600" size={28} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-[#1E293B] hover:bg-slate-50 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-[18px] font-bold text-[#1E293B] leading-tight mb-3 font-sans">
                                    {t('common:notices.unsaved_changes_title', 'Thay đổi chưa được lưu')}
                                </Dialog.Title>

                                <div className="space-y-4">
                                    <p className="text-[14px] text-[#64748B] leading-relaxed font-sans">
                                        {t('common:notices.unsaved_changes_body', 'Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?')}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 h-[48px] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] text-[14px] font-bold rounded-2xl transition-all"
                                        onClick={handleCancel}
                                    >
                                        {t('common:actions.stay')}
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 px-4 h-[48px] bg-amber-600 hover:bg-amber-700 text-white text-[14px] font-bold rounded-2xl transition-all"
                                        onClick={handleConfirm}
                                    >
                                        {t('common:actions.leave')}
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
