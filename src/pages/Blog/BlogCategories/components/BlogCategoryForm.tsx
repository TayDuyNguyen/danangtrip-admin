import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { X, Folder, Loader2 } from 'lucide-react';
import { blogCategorySchema, type BlogCategoryFormValues } from '@/validations/blogCategory.schema';
import { slugifyVietnamese } from '@/utils/slug';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import type { BlogCategoryViewModel } from '@/types';

interface BlogCategoryFormProps {
    initialData: BlogCategoryViewModel | null;
    isSubmitting: boolean;
    onSubmit: (values: BlogCategoryFormValues) => void;
    onReset: () => void;
    resetSignal?: number;
    onDirtyChange?: (dirty: boolean) => void;
}

type BlogCategoryFormFieldsProps = Omit<BlogCategoryFormProps, 'resetSignal'>;

const BlogCategoryFormFields = ({
    initialData,
    isSubmitting,
    onSubmit,
    onReset,
    onDirtyChange,
}: BlogCategoryFormFieldsProps) => {
    const { t } = useTranslation(['blog', 'common']);
    const [manualSlugTouched, setManualSlugTouched] = useState(false);

    const isEditMode = !!initialData;
    const slugTouched = isEditMode || manualSlugTouched;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm<BlogCategoryFormValues>({
        resolver: yupResolver(blogCategorySchema(t as never)) as never,
        defaultValues: {
            name: initialData?.name ?? '',
            slug: initialData?.slug ?? '',
            description: initialData?.description ?? '',
        },
    });

    const watchName = useWatch({ control, name: 'name' });
    const watchSlug = useWatch({ control, name: 'slug' });
    const watchDescription = useWatch({ control, name: 'description' });

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    useEffect(() => {
        if (!isEditMode && watchName && !slugTouched) {
            setValue('slug', slugifyVietnamese(watchName), { shouldValidate: true });
        }
    }, [watchName, isEditMode, slugTouched, setValue]);

    const handleFormSubmit = (data: BlogCategoryFormValues) => {
        const finalData: BlogCategoryFormValues = {
            ...data,
            slug: data.slug || slugifyVietnamese(data.name),
        };
        onSubmit(finalData);
    };

    const handleCancel = () => {
        setManualSlugTouched(false);
        reset({
            name: '',
            slug: '',
            description: '',
        });
        onReset();
    };

    return (
        <>
            <UnsavedChangesGuard isDirty={isDirty && !isSubmitting} />
            <form
                data-testid="blog-category-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col gap-5 sticky top-24"
            >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            {isEditMode ? t('category.form.edit_title') : t('category.form.add_title')}
                        </h3>
                        <span
                            className={`
                            text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide
                            ${isEditMode
                                ? 'bg-blue-50 text-[#0066CC]'
                                : 'bg-emerald-50 text-emerald-600'}
                        `}
                        >
                            {isEditMode ? t('category.form.badge_editing') : t('category.form.badge_new')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        aria-label={t('actions.cancel')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            {t('category.form.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            data-testid="blog-category-name-input"
                            placeholder={t('category.form.name_placeholder')}
                            {...register('name')}
                            className={`
                            w-full rounded-2xl border bg-slate-50/50 py-3.5 px-4 font-bold text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/10
                            ${errors.name ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80'}
                        `}
                        />
                        {errors.name && (
                            <p className="text-xs font-bold text-red-500 mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label htmlFor="slug" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                {t('category.form.slug')}
                            </label>
                            <span className="text-[10px] font-black text-[#0066CC] bg-blue-50 px-1.5 py-0.5 rounded-md">
                                {t('category.form.slug_auto')}
                            </span>
                        </div>
                        <input
                            id="slug"
                            type="text"
                            data-testid="blog-category-slug-input"
                            placeholder={t('category.form.slug_placeholder')}
                            {...register('slug', {
                                onChange: () => setManualSlugTouched(true),
                            })}
                            className={`
                            w-full rounded-2xl border bg-slate-50/50 py-3.5 px-4 font-mono text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/10
                            ${errors.slug ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80'}
                        `}
                        />
                        <p className="text-[10px] font-medium text-slate-400">
                            {t('category.form.slug_helper')}
                        </p>
                        {errors.slug && (
                            <p className="text-xs font-bold text-red-500 mt-1">
                                {errors.slug.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="description" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            {t('category.form.description')}
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            data-testid="blog-category-description-input"
                            placeholder={t('category.form.description_placeholder')}
                            {...register('description')}
                            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-3.5 px-4 font-bold text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/10 resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs font-bold text-red-500 mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mt-1">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider block mb-3 uppercase">
                        {t('category.form.preview')}
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC]">
                            <Folder size={20} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                                {watchName || t('category.form.name_placeholder')}
                            </h4>
                            <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                                {watchSlug || t('category.form.slug_placeholder')}
                            </p>
                            {watchDescription && (
                                <p className="text-xs text-slate-400 truncate mt-1">
                                    {watchDescription}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        data-testid="blog-category-form-cancel"
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:border-red-400 text-slate-500 hover:text-red-500 font-bold text-sm transition-all hover:bg-red-50/30 active:scale-95"
                    >
                        {t('category.form.btn_cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="blog-category-form-submit"
                        className="flex-1 py-3 px-4 rounded-xl bg-[#0066CC] hover:bg-[#004999] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : null}
                        <span>
                            {isEditMode ? t('category.form.btn_save') : t('category.form.btn_create')}
                        </span>
                    </button>
                </div>
            </form>
        </>
    );
};

export const BlogCategoryForm = ({
    initialData,
    resetSignal = 0,
    ...props
}: BlogCategoryFormProps) => (
    <BlogCategoryFormFields
        key={`${initialData?.id ?? 'new'}-${resetSignal}`}
        initialData={initialData}
        {...props}
    />
);
