import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import type { Schedule } from '@/types/schedule';
import { formatAdminShortDate } from '@/utils/dateDisplay';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    schedule: Schedule | null;
    isDeleting?: boolean;
};

const ScheduleDeleteDialog = ({ isOpen, onClose, onConfirm, schedule, isDeleting }: Props) => {
    const { t, i18n } = useTranslation(['schedules', 'common']);

    if (!schedule) {
        return null;
    }

    const dateLabel = formatAdminShortDate(schedule.startDate, i18n.language);

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[20px] bg-white p-[32px] text-left align-middle shadow-2xl transition-all border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-[56px] h-[56px] rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
                                        <AlertTriangle className="text-[#EF4444]" size={28} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-[40px] h-[40px] flex items-center justify-center text-slate-400 hover:text-[#1E293B] hover:bg-slate-50 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-[18px] font-bold text-[#1E293B] leading-tight mb-3 font-inter">
                                    {t('schedules:delete.title')}
                                </Dialog.Title>

                                <div className="space-y-4">
                                    <p className="text-[14px] text-[#64748B] leading-relaxed font-inter">
                                        {t('schedules:delete.body', {
                                            date: dateLabel,
                                            tour: schedule.tourName || '—',
                                        })}
                                    </p>
                                    <div className="p-4 bg-[#FEF3C7] border border-amber-100 rounded-[12px]">
                                        <p className="text-[12px] font-semibold text-amber-900 font-inter">
                                            {t('schedules:delete.warning')}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 h-[48px] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] text-[14px] font-bold rounded-[12px] transition-all"
                                        onClick={onClose}
                                    >
                                        {t('common:actions.cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        className="flex-1 px-4 h-[48px] bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white text-[14px] font-bold rounded-[12px] transition-all"
                                        onClick={onConfirm}
                                    >
                                        {isDeleting ? t('common:actions.deleting') : t('schedules:delete.confirm')}
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

export default ScheduleDeleteDialog;
