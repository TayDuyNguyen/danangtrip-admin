import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CreateTourInput } from '@/validations/tour.schema';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';

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

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 transition-all hover:border-blue-200 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-200">
                                {index + 1}
                            </div>
                            <span className="font-semibold text-slate-800">
                                {t('form.itinerary.day', { num: index + 1 })}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
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
                                className="bg-white py-2.5 font-medium focus:border-blue-500"
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
                                className="bg-white leading-relaxed focus:border-blue-500"
                            />
                            {errors.itinerary?.[index]?.content && (
                                <p className="mt-1 text-xs text-red-500">{errors.itinerary?.[index]?.content?.message as string}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={() => append({ day: fields.length + 1, title: '', content: '' })}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <Plus className="w-5 h-5" />
                {t('form.itinerary.add_day')}
            </button>
        </div>
    );
};

export default ItineraryBuilder;
