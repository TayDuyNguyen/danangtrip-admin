import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { X, Folder, Loader2 } from 'lucide-react';
import { blogCategorySchema, type BlogCategoryFormValues } from '@/validations/blogCategory.schema';
import { slugifyVietnamese } from '@/utils/slug';
import type { BlogCategoryViewModel } from '@/types';

interface BlogCategoryFormProps {
    initialData: BlogCategoryViewModel | null;
    isSubmitting: boolean;
    onSubmit: (values: BlogCategoryFormValues) => void;
    onReset: () => void;
}

export const BlogCategoryForm = ({
    initialData,
    isSubmitting,
    onSubmit,
    onReset,
}: BlogCategoryFormProps) => {
    const { t } = useTranslation('blog');

    const isEditMode = !!initialData;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<BlogCategoryFormValues>({
        resolver: yupResolver(blogCategorySchema(t as never)) as never,
        defaultValues: {
            name: '',
            slug: '',
            description: '',
        },
    });

    const watchName = watch('name');
    const watchSlug = watch('slug');
    const watchDescription = watch('description');

    // Load initial data when editing
    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                slug: initialData.slug,
                description: initialData.description || '',
            });
        } else {
            reset({
                name: '',
                slug: '',
                description: '',
            });
        }
    }, [initialData, reset]);

    // Auto-generate slug from name in Create mode (if not manually edited)
    useEffect(() => {
        if (!isEditMode && watchName) {
            setValue('slug', slugifyVietnamese(watchName), { shouldValidate: true });
        }
    }, [watchName, isEditMode, setValue]);

    const handleFormSubmit = (data: BlogCategoryFormValues) => {
        // Fallback slug if empty
        const finalData: BlogCategoryFormValues = {
            ...data,
            slug: data.slug || slugifyVietnamese(data.name),
        };
        onSubmit(finalData);
    };

    const handleCancel = () => {
        reset({
            name: '',
            slug: '',
            description: '',
        });
        onReset();
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col gap-5 sticky top-24"
        >
            {/* Form Header */}
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {t('category.form.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
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

                {/* Slug */}
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
                        placeholder={t('category.form.slug_placeholder')}
                        {...register('slug')}
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

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {t('category.form.description')}
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        placeholder={t('category.form.description_placeholder')}
                        {...register('description')}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-3.5 px-4 font-bold text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary/10 resize-none"
                    />
                </div>
            </div>

            {/* Preview Box */}
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

            {/* Footer buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:border-red-400 text-slate-500 hover:text-red-500 font-bold text-sm transition-all hover:bg-red-50/30 active:scale-95"
                >
                    {t('category.form.btn_cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
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
    );
};
