import { useEffect, useState, type ComponentType } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import CustomSelect from '@/components/ui/CustomSelect';
import Drawer from '@/components/ui/Drawer';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { Save, AlertCircle, Plus, XCircle, Search } from 'lucide-react';
import { tourCategorySchema } from '@/validations/tourCategory.schema';
import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import { slugifyVietnamese } from '@/utils/slug';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const iconSuggestions = [
    'Map', 'Waves', 'Mountain', 'Landmark', 'Utensils', 'Camera', 
    'Bus', 'Plane', 'Tent', 'Umbrella', 'Sun', 'Ship',
    'Compass', 'Ticket', 'Bed', 'Car', 'Bike', 'Tram',
    'Trees', 'Palmtree', 'Cloud', 'Wind', 'Moon', 'Star',
    'Flag', 'Globe', 'Suitcase', 'Briefcase', 'MapPin',
    'Navigation', 'Activity', 'Award', 'Heart', 'Coffee', 'Music'
];

interface CategoryFormValues {
    name: string;
    slug: string;
    icon: string;
    description: string;
    sort_order: number;
    status: 'active' | 'inactive' | 'sold_out';
    icon_background: string;
}

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormValues) => void;
    initialData?: TourCategory | null;
    nextSortOrder?: number;
    isLoading?: boolean;
}

const colorOptions = [
    '#E0F2FE', // Light blue
    '#FFEDD5', // Orange
    '#DCFCE7', // Green
    '#FEF9C3', // Yellow
    '#FEE2E2', // Red
    '#E0E7FF', // Indigo
    '#CFFAFE', // Cyan
    '#FCE7F3', // Pink
    '#000000', // Black
];

const CategoryDialog = ({ isOpen, onClose, onSubmit, initialData, nextSortOrder = 1, isLoading }: CategoryDialogProps) => {
    const { t } = useTranslation('tour');
    
    const [isIconBrowserOpen, setIsIconBrowserOpen] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors }
    } = useForm<CategoryFormValues>({
        resolver: yupResolver(tourCategorySchema(t)) as never,
        defaultValues: {
            name: '',
            slug: '',
            icon: 'Map',
            description: '',
            sort_order: nextSortOrder,
            status: 'active',
            icon_background: '#E0F2FE'
        }
    });

    const categoryName = useWatch({ control, name: 'name' });
    const selectedColor = useWatch({ control, name: 'icon_background' });
    const selectedIcon = useWatch({ control, name: 'icon' });

    // Auto-generate slug from name
    useEffect(() => {
        if (!initialData && categoryName) {
            setValue('slug', slugifyVietnamese(categoryName), { shouldValidate: true });
        }
    }, [categoryName, initialData, setValue]);

    // Adjust state during render to avoid cascading renders in useEffect (React Best Practice)
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) setIsIconBrowserOpen(false);
    }

    // Reset form when initialData changes or drawer opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    slug: initialData.slug,
                    icon: initialData.icon,
                    description: initialData.description || '',
                    sort_order: initialData.sort_order,
                    status: initialData.status,
                    icon_background: initialData.icon_background || '#E0F2FE'
                });
            } else {
                reset({
                    name: '',
                    slug: '',
                    icon: 'Map',
                    description: '',
                    sort_order: nextSortOrder,
                    status: 'active',
                    icon_background: '#E0F2FE'
                });
            }
        }
    }, [isOpen, initialData, reset, nextSortOrder]);

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? t('categories.edit') : t('categories.add')}
            subtitle={initialData ? t('form.edit_subtitle') : t('form.page_subtitle')}
            badge={!initialData ? t('categories.badge_new') : undefined}
            width="max-w-md"
        >
            <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6 pb-20">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                        {t('categories.form.name')} *
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder={t('categories.form.name_placeholder')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#14b8a6] focus:ring-4 focus:ring-[#14b8a6]/10 outline-hidden transition-all font-bold text-slate-900 placeholder:text-slate-400"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1.5 ml-1">
                            <AlertCircle size={12} />
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                            {t('categories.form.slug')}
                        </label>
                        <span className="px-2 py-0.5 bg-[#dff7f4] text-[#0f766e] text-[10px] font-black rounded-md uppercase tracking-wider">
                            {t('form.basic.slug_auto')}
                        </span>
                    </div>
                    <input
                        {...register('slug')}
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#14b8a6] transition-all font-bold text-slate-900"
                    />
                    <p className="text-[11px] font-medium text-slate-400 ml-1 italic">{t('form.basic.slug_auto_helper')}</p>
                </div>

                {/* Icon Selection */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                        {t('categories.table.header_icon')}
                    </label>
                    
                    <div className="flex gap-4">
                        {/* Interactive Icon Preview / Trigger */}
                        <button
                            type="button"
                            className={cn(
                                "w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border-2 transition-all group relative overflow-hidden",
                                isIconBrowserOpen ? "border-[#14b8a6] bg-white ring-4 ring-[#14b8a6]/10" : "border-slate-200 bg-slate-50/50 hover:border-[#14b8a6] hover:bg-white"
                            )}
                            style={{ backgroundColor: selectedColor + (isIconBrowserOpen ? '10' : '20'), color: selectedColor === '#000000' ? '#000000' : selectedColor }}
                            onClick={() => setIsIconBrowserOpen(!isIconBrowserOpen)}
                        >
                            {(() => {
                                const IconComp = (Icons as unknown as Record<string, ComponentType<{ size?: number; className?: string }>>)[selectedIcon] || Icons.Map;
                                return <IconComp size={32} className={cn("transition-transform", isIconBrowserOpen ? "scale-110" : "group-hover:scale-110")} />;
                            })()}
                            {!isIconBrowserOpen && (
                                <div className="absolute inset-0 bg-[#14b8a6]/0 group-hover:bg-[#14b8a6]/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <Plus size={16} className="text-[#14b8a6]" />
                                </div>
                            )}
                        </button>
                        
                        <div className="flex-1">
                            <input
                                {...register('icon')}
                                type="text"
                                placeholder={t('categories.form.icon_placeholder')}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#14b8a6] transition-all font-bold text-slate-900 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Advanced Icon Browser */}
                    <AnimatePresence>
                        {isIconBrowserOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-5 bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-900/5 z-20"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('categories.icon_browser.title')}</p>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsIconBrowserOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>
                                
                                {/* Search input inside browser */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        type="text"
                                        placeholder={t('categories.icon_browser.search_placeholder')}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-hidden focus:bg-white focus:border-[#14b8a6] transition-all"
                                        onChange={(e) => setIconSearch(e.target.value)}
                                    />
                                </div>

                                {/* Icon Grid with Filter */}
                                <div className="grid grid-cols-6 gap-2 max-h-[240px] overflow-y-auto pr-2 no-scrollbar">
                                    {iconSuggestions
                                        .filter(name => name.toLowerCase().includes(iconSearch.toLowerCase()))
                                        .map((name) => {
                                            const IconComp = (Icons as unknown as Record<string, ComponentType<{ size?: number; className?: string }>>)[name] || Icons.HelpCircle;
                                            const isSelected = selectedIcon === name;
                                            return (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('icon', name, { shouldValidate: true });
                                                        setIsIconBrowserOpen(false);
                                                    }}
                                                    className={cn(
                                                        "aspect-square flex items-center justify-center rounded-xl transition-all border",
                                                        isSelected
                                                            ? "bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/20 scale-110 z-10"
                                                            : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600"
                                                    )}
                                                    title={name}
                                                >
                                                    <IconComp size={20} />
                                                </button>
                                            );
                                        })}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-medium text-slate-400 text-center">
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

                {/* Color Palette */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                        {t('categories.form.icon_background')}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setValue('icon_background', color)}
                                className={cn(
                                    "w-8 h-8 rounded-full transition-all border-2",
                                    selectedColor === color ? "border-[#14b8a6] scale-110 shadow-lg shadow-[#14b8a6]/20" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                        {t('categories.form.description')}
                    </label>
                    <textarea
                        {...register('description')}
                        placeholder={t('categories.form.description_placeholder')}
                        rows={4}
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#14b8a6] transition-all font-bold text-slate-900 placeholder:text-slate-400 resize-none"
                    />
                </div>

                {/* Order & Status Row */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2 h-9 flex items-center">
                            {t('categories.form.order')}
                        </label>
                        <div className="relative group">
                            <input
                                {...register('sort_order')}
                                type="number"
                                disabled
                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-slate-400 cursor-not-allowed opacity-70"
                                placeholder={initialData ? '' : t('categories.form.order_placeholder_auto')}
                            />
                            {initialData && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                        {t('categories.form.order_drag_hint')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-2 h-9 flex items-center">
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
                                    ].find(opt => opt.value === field.value)}
                                    onChange={(opt) => field.onChange((opt as { value: string })?.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Fixed Footer in Drawer */}
                <div className="fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
                    >
                        {t('dialog.button_cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#14b8a6] text-white px-10 py-3.5 rounded-2xl font-black hover:bg-[#0f766e] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#14b8a6]/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

export default CategoryDialog;
