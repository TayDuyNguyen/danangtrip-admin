import { useEffect, useState, createElement } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle, Plus, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Drawer from '@/components/ui/Drawer';
import CustomSelect from '@/components/ui/CustomSelect';
import { categorySchema, type CategoryFormValues } from '@/validations/category.schema';
import type { Category } from '@/dataHelper/category.dataHelper';
import { getCategoryIconComponent, resolveCategoryIconName } from '@/utils/categoryIcon';
import { slugifyVietnamese } from '@/utils/slug';
import { cn } from '@/utils/cn';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Category | null;
    onSubmit: (data: CategoryFormValues) => void;
    isSubmitting: boolean;
}

const iconSuggestions = [
    'Map', 'MapPinned', 'Utensils', 'Hotel', 'Building2', 'Landmark', 'Trees', 'Waves',
    'Mountain', 'Coffee', 'Music', 'ShoppingBag', 'Bus', 'Bike', 'Camera', 'Compass',
    'Ship', 'Tent', 'Sun', 'Moon', 'Star', 'Heart', 'Navigation', 'Flag',
];

const colorOptions = ['#E0F2FE', '#FFEDD5', '#DCFCE7', '#FEF9C3', '#FEE2E2', '#E0E7FF', '#CFFAFE', '#FCE7F3', '#1E293B'];

const CategoryFormModal = ({ isOpen, onClose, initialData, onSubmit, isSubmitting }: Props) => {
    const { t } = useTranslation('location');
    const [isIconBrowserOpen, setIsIconBrowserOpen] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CategoryFormValues>({
        resolver: yupResolver(categorySchema(t as never)) as never,
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            status: 'active',
            sort_order: 1,
            image: '',
            icon: 'Map',
            icon_background: '#E0F2FE',
        }
    });

    const categoryName = useWatch({ control, name: 'name' });
    const selectedIcon = useWatch({ control, name: 'icon' });
    const selectedColor = useWatch({ control, name: 'icon_background' });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    slug: initialData.slug,
                    description: initialData.description || '',
                    status: initialData.status,
                    sort_order: initialData.sortOrder,
                    image: initialData.image || '',
                    icon: resolveCategoryIconName(initialData.icon, 'Map'),
                    icon_background: initialData.iconBackground || '#E0F2FE',
                });
            } else {
                reset({
                    name: '',
                    slug: '',
                    description: '',
                    status: 'active',
                    sort_order: 1,
                    image: '',
                    icon: 'Map',
                    icon_background: '#E0F2FE',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    useEffect(() => {
        if (!initialData && categoryName) {
            setValue('slug', slugifyVietnamese(categoryName), { shouldValidate: true });
        }
    }, [categoryName, initialData, setValue]);

    const handleClose = () => {
        setIsIconBrowserOpen(false);
        setIconSearch('');
        onClose();
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            title={initialData ? t('categories.edit') : t('categories.add')}
            subtitle={initialData ? t('form.edit_subtitle') : t('form.page_subtitle')}
            badge={!initialData ? t('categories.badge_new') : undefined}
            width="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
                <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {t('categories.form.name')} *
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder={t('categories.form.name_placeholder')}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-bold text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/10"
                    />
                    {errors.name && (
                        <p className="ml-1 mt-1.5 flex items-center gap-1 text-xs font-bold text-red-500">
                            <AlertCircle size={12} />
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                            {t('categories.form.slug')}
                        </label>
                        <span className="rounded-md bg-[#dff7f4] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0f766e]">
                            {t('form.basic.slug_auto')}
                        </span>
                    </div>
                    <input
                        {...register('slug')}
                        type="text"
                        placeholder={t('categories.form.slug_placeholder')}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-bold text-slate-900 outline-hidden transition-all focus:border-[#14b8a6] focus:bg-white"
                    />
                    <p className="ml-1 text-[11px] font-medium italic text-slate-400">{t('form.basic.slug_auto_helper')}</p>
                    {errors.slug && (
                        <p className="ml-1 mt-1.5 flex items-center gap-1 text-xs font-bold text-red-500">
                            <AlertCircle size={12} />
                            {errors.slug.message}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {t('categories.table.header_icon')}
                    </label>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            className={cn(
                                'group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 transition-all',
                                isIconBrowserOpen ? 'border-[#14b8a6] bg-white ring-4 ring-[#14b8a6]/10' : 'border-slate-200 bg-slate-50/50 hover:border-[#14b8a6] hover:bg-white',
                            )}
                            style={{ backgroundColor: selectedColor || '#E0F2FE' }}
                            onClick={() => setIsIconBrowserOpen((value) => !value)}
                        >
                            {createElement(getCategoryIconComponent(selectedIcon, 'Map'), {
                                size: 32,
                                className: cn('text-slate-700 transition-transform', isIconBrowserOpen ? 'scale-110' : 'group-hover:scale-110')
                            })}
                            {!isIconBrowserOpen && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#14b8a6]/0 opacity-0 transition-all group-hover:bg-[#14b8a6]/5 group-hover:opacity-100">
                                    <Plus size={16} className="text-[#14b8a6]" />
                                </div>
                            )}
                        </button>

                        <div className="flex-1">
                            <input
                                {...register('icon')}
                                type="text"
                                placeholder={t('categories.form.icon_placeholder')}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-900 shadow-sm transition-all focus:border-[#14b8a6] focus:bg-white"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isIconBrowserOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="z-20 rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/5"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{t('categories.icon_browser.title')}</p>
                                    <button type="button" onClick={() => setIsIconBrowserOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                        <XCircle size={18} />
                                    </button>
                                </div>

                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        value={iconSearch}
                                        placeholder={t('categories.icon_browser.search_placeholder')}
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-9 pr-4 text-xs font-bold outline-hidden transition-all focus:border-[#14b8a6] focus:bg-white"
                                        onChange={(event) => setIconSearch(event.target.value)}
                                    />
                                </div>

                                <div className="grid max-h-[240px] grid-cols-6 gap-2 overflow-y-auto pr-2 no-scrollbar">
                                    {iconSuggestions
                                        .filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase()))
                                        .map((name) => {
                                            const IconComp = getCategoryIconComponent(name, 'HelpCircle');
                                            const isSelected = (selectedIcon || 'Map') === name;

                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('icon', name, { shouldValidate: true });
                                                        setIsIconBrowserOpen(false);
                                                    }}
                                                    className={cn(
                                                        'aspect-square rounded-xl border transition-all',
                                                        isSelected
                                                            ? 'z-10 scale-110 border-[#14b8a6] bg-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/20'
                                                            : 'border-transparent bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600',
                                                    )}
                                                    title={name}
                                                >
                                                    <span className="flex h-full items-center justify-center">
                                                        <IconComp size={20} />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <p className="text-center text-[10px] font-medium text-slate-400">
                                        {t('categories.icon_browser.more_prefix')}{' '}
                                        <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-[#14b8a6] hover:underline">
                                            {t('categories.icon_browser.more_link_label')}
                                        </a>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {t('categories.form.icon_background')}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setValue('icon_background', color)}
                                className={cn(
                                    'h-8 w-8 rounded-full border-2 transition-all',
                                    selectedColor === color ? 'scale-110 border-[#14b8a6] shadow-lg shadow-[#14b8a6]/20' : 'border-transparent hover:scale-105',
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {t('categories.form.description')}
                    </label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        placeholder={t('categories.form.description_placeholder')}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-bold text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col">
                        <label className="mb-2 ml-1 flex h-9 items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                            {t('categories.form.order')}
                        </label>
                        <div className="group relative">
                            <input
                                {...register('sort_order')}
                                type="number"
                                disabled
                                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3.5 font-bold text-slate-400 opacity-70"
                                placeholder={initialData ? '' : t('categories.form.order_placeholder_auto')}
                            />
                            {initialData && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="rounded-md border border-slate-100 bg-white px-2 py-1 text-[10px] font-bold text-slate-400 shadow-sm">
                                        {t('categories.form.order_drag_hint')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 ml-1 flex h-9 items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                            {t('categories.form.status')}
                        </label>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    options={[
                                        { value: 'active', label: t('status.active') },
                                        { value: 'inactive', label: t('status.inactive') },
                                    ]}
                                    value={[
                                        { value: 'active', label: t('status.active') },
                                        { value: 'inactive', label: t('status.inactive') },
                                    ].find((option) => option.value === field.value)}
                                    onChange={(option) => field.onChange((option as { value: string })?.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {t('categories.form.image')}
                    </label>
                    <input
                        {...register('image')}
                        type="text"
                        placeholder={t('categories.form.image_placeholder')}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-bold text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl px-8 py-3.5 font-black text-slate-500 transition-all hover:bg-slate-100"
                    >
                        {t('actions.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-2xl bg-[#14b8a6] px-10 py-3.5 font-black text-white shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 hover:bg-[#0f766e] active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{t('form.actions.save_changes')}</span>
                    </button>
                </div>
            </form>
        </Drawer>
    );
};

export default CategoryFormModal;
