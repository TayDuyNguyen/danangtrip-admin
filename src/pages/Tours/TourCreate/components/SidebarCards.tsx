import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    Send,
    CheckCircle2,
    ArrowRight,
    Circle
} from 'lucide-react';
import type { CreateTourInput } from '@/validations/tour.schema';
import { splitLines } from '@/utils';

interface SidebarCardsProps {
    register: UseFormRegister<CreateTourInput>;
    watch: UseFormWatch<CreateTourInput>;
    onPublish: () => void;
    isSubmitting: boolean;
    submitLabel?: string;
}

const SidebarCards = ({ register, watch, onPublish, isSubmitting, submitLabel }: SidebarCardsProps) => {
    const { t } = useTranslation('tour');

    const formValues = watch();

    const itineraryOk = (formValues.itinerary || []).every(
        (d) => (d.title || '').trim().length > 0 && (d.content || '').trim().length > 0
    );

    const checklistItems = [
        {
            key: 'name',
            label: t('form.sidebar.checklist_name'),
            completed: !!(formValues.name && String(formValues.name).trim().length >= 3)
        },
        {
            key: 'category',
            label: t('form.sidebar.checklist_category'),
            completed: !!formValues.tour_category_id && formValues.tour_category_id !== ('' as unknown as number)
        },
        {
            key: 'short_desc',
            label: t('form.sidebar.checklist_short_desc'),
            completed: !!(formValues.short_desc && String(formValues.short_desc).trim().length > 0)
        },
        {
            key: 'description',
            label: t('form.sidebar.checklist_description'),
            completed: !!(formValues.description && String(formValues.description).trim().length > 0)
        },
        {
            key: 'price_adult',
            label: t('form.sidebar.checklist_price_adult'),
            completed: formValues.price_adult != null && Number(formValues.price_adult) >= 0
        },
        {
            key: 'duration',
            label: t('form.sidebar.checklist_duration'),
            completed: !!(formValues.duration && String(formValues.duration).trim().length > 0)
        },
        {
            key: 'thumbnail',
            label: t('form.sidebar.checklist_thumbnail'),
            completed: !!formValues.thumbnail
        },
        {
            key: 'itinerary',
            label: t('form.sidebar.checklist_itinerary'),
            completed: itineraryOk && (formValues.itinerary || []).length > 0
        },
        {
            key: 'inclusions',
            label: t('form.sidebar.checklist_inclusions'),
            completed:
                splitLines(formValues.inclusions).length > 0 && splitLines(formValues.exclusions).length > 0
        }
    ];

    const doneCount = checklistItems.filter((i) => i.completed).length;
    const completionPercent = Math.round((doneCount / checklistItems.length) * 100);

    const statusMeta: Record<string, { badge: string; badgeClass: string }> = {
        active: { badge: t('form.sidebar.status_public'), badgeClass: 'bg-[#dff7f4] text-[#0f766e]' },
        inactive: { badge: t('form.sidebar.status_hidden'), badgeClass: 'bg-red-100 text-red-700' },
        sold_out: { badge: t('form.sidebar.status_sold_out_hint'), badgeClass: 'bg-[#f4fce3] text-[#365314]' }
    };

    const tips = ['tip_1', 'tip_2', 'tip_3', 'tip_4'] as const;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-[#dff7f4] rounded-lg">
                        <Send className="w-4 h-4 text-[#14b8a6]" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{t('form.sidebar.publish_title')}</h3>
                </div>
                <div className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-3">{t('form.sidebar.status')}</label>
                        <div className="grid grid-cols-1 gap-2">
                            {(['active', 'inactive', 'sold_out'] as const).map((s) => {
                                const meta = statusMeta[s];
                                return (
                                    <label
                                        key={s}
                                        className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${
                                            watch('status') === s
                                                ? 'border-[#14b8a6] bg-[#dff7f4]/80'
                                                : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                value={s}
                                                {...register('status')}
                                                className="w-4 h-4 text-[#14b8a6] focus:ring-[#14b8a6] border-slate-300"
                                            />
                                            <span
                                                className={`text-sm font-medium ${
                                                    watch('status') === s ? 'text-[#14b8a6]' : 'text-slate-600'
                                                }`}
                                            >
                                                {t(`status.${s}`)}
                                            </span>
                                        </div>
                                        <span className={`ms-7 text-[11px] font-semibold rounded-full px-2 py-0.5 w-fit ${meta.badgeClass}`}>
                                            {meta.badge}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2 space-y-4 border-t border-slate-100">
                        <label className="flex items-start justify-between gap-3 cursor-pointer group">
                            <div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-[#14b8a6] transition-colors block">
                                    {t('form.sidebar.is_featured')}
                                </span>
                                <span className="text-xs text-slate-500 mt-0.5 block">{t('form.sidebar.featured_helper')}</span>
                            </div>
                            <div className="relative inline-flex shrink-0 items-center cursor-pointer">
                                <input type="checkbox" {...register('is_featured')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14b8a6]" />
                            </div>
                        </label>
                        <label className="flex items-start justify-between gap-3 cursor-pointer group">
                            <div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-[#14b8a6] transition-colors block">
                                    {t('form.sidebar.is_hot')}
                                </span>
                                <span className="text-xs text-slate-500 mt-0.5 block">{t('form.sidebar.hot_helper')}</span>
                            </div>
                            <div className="relative inline-flex shrink-0 items-center cursor-pointer">
                                <input type="checkbox" {...register('is_hot')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]" />
                            </div>
                        </label>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onPublish}
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-md bg-[#14b8a6] hover:bg-[#0f766e] disabled:bg-[#5dd4c7] disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            {isSubmitting ? t('form.actions.saving') : (submitLabel || t('form.actions.submit'))}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{t('form.sidebar.checklist_title')}</h3>
                    <span className="text-xs text-slate-500">{t('form.sidebar.completion_label', { percent: completionPercent })}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-4 overflow-hidden">
                    <div
                        className="bg-[#14b8a6] h-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
                <div className="space-y-2">
                    {checklistItems.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                            {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#14b8a6]" />
                            ) : (
                                <Circle className="w-4 h-4 shrink-0 text-slate-200" />
                            )}
                            <span
                                className={`text-sm ${
                                    item.completed ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'
                                }`}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#dff7f4] border border-[#ccfbf1] rounded-2xl p-5">
                <h3 className="text-[13px] font-semibold text-[#0f766e] mb-3">{t('form.sidebar.tips_title')}</h3>
                <ul className="space-y-2">
                    {tips.map((tipKey) => (
                        <li key={tipKey} className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed">
                            <ArrowRight className="w-3.5 h-3.5 text-[#14b8a6] shrink-0 mt-0.5" />
                            {t(`form.sidebar.${tipKey}`)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SidebarCards;
