import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CreateTourInput } from '@/validations/tour.schema';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';
import { cn } from '@/utils';

interface ItineraryBuilderProps {
    control: Control<CreateTourInput>;
    register: UseFormRegister<CreateTourInput>;
    errors: FieldErrors<CreateTourInput>;
}

const ItineraryBuilder = ({ control, register, errors }: ItineraryBuilderProps) => {
    const { t } = useTranslation('tour');
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'itinerary'
    });

    const arrayError =
        errors.itinerary && !Array.isArray(errors.itinerary)
            ? (errors.itinerary.message as string | undefined)
            : undefined;

    return (
        <div className="space-y-4">
            {arrayError && (
                <p role="alert" className="text-xs text-red-500 font-medium">
                    {arrayError}
                </p>
            )}

            {fields.map((field, index) => {
                const isLastDay = fields.length <= 1;

                return (
                    <div key={field.id} className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 transition-all hover:border-[#ccfbf1] group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#14b8a6]/25">
                                    {index + 1}
                                </div>
                                <span className="font-semibold text-slate-800">
                                    {t('form.itinerary.day', { num: index + 1 })}
                                </span>
                                <input type="hidden" {...register(`itinerary.${index}.day`)} />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                disabled={isLastDay}
                                aria-label={t('form.itinerary.remove_day')}
                                className={cn(
                                    'p-2 transition-colors rounded-lg',
                                    isLastDay
                                        ? 'text-slate-200 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                )}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <TextInput
                                    {...register(`itinerary.${index}.title`)}
                                    placeholder={t('form.itinerary.title_placeholder')}
                                    invalid={!!errors.itinerary?.[index]?.title}
                                    className="bg-white py-2.5 font-medium focus:border-[#14b8a6]"
                                />
                                {errors.itinerary?.[index]?.title && (
                                    <p className="mt-1 text-xs text-red-500">{errors.itinerary?.[index]?.title?.message as string}</p>
                                )}
                            </div>

                            <div>
                                <TextareaField
                                    {...register(`itinerary.${index}.content`)}
                                    placeholder={t('form.itinerary.content_placeholder')}
                                    rows={4}
                                    invalid={!!errors.itinerary?.[index]?.content}
                                    className="bg-white leading-relaxed focus:border-[#14b8a6]"
                                />
                                {errors.itinerary?.[index]?.content && (
                                    <p className="mt-1 text-xs text-red-500">{errors.itinerary?.[index]?.content?.message as string}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={() => append({ day: fields.length + 1, title: '', content: '' })}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-[#99f6e4] hover:text-[#14b8a6] hover:bg-[#dff7f4]/50 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus className="w-5 h-5" />
                {t('form.itinerary.add_day')}
            </button>
        </div>
    );
};

export default ItineraryBuilder;
