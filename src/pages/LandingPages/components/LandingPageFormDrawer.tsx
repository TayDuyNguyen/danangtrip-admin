import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { X, Upload, Plus, Trash2, HelpCircle, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';
import type { LandingPage, CreateLandingPageInput, LandingPageType, LandingPageStatus } from '@/types/landingPage.types';
import { getLandingPageSchema } from '@/validations/landingPage.schema';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { toast } from 'sonner';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { clsx } from 'clsx';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';
import { Button } from '@/components/ui/Button';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface LandingPageFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLanding: LandingPage | null;
    onSubmit: (data: CreateLandingPageInput) => Promise<void>;
    isSubmitting: boolean;
}

type TabType = 'content' | 'seo' | 'settings';

interface FormFields {
    title: string;
    slug: string;
    page_type: LandingPageType;
    status: LandingPageStatus;
    intro: string | null;
    hero_image: string | null;
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
    filters: string | null;
    content_blocks: Array<{
        type: 'faq' | 'cta' | 'description';
        title?: string;
        content?: string;
        question?: string;
        answer?: string;
    }>;
}

const LandingPageFormDrawer = ({
    isOpen,
    onClose,
    selectedLanding,
    onSubmit,
    isSubmitting
}: LandingPageFormDrawerProps) => {
    const { t } = useTranslation('landing_pages');
    const [activeTab, setActiveTab] = useState<TabType>('content');
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const [isUploadingOg, setIsUploadingOg] = useState(false);

    const pageTypeOptions: Option[] = [
        { value: 'destination', label: t('types.destination') },
        { value: 'tour_line', label: t('types.tour_line') },
        { value: 'promotion', label: t('types.promotion') }
    ];

    const statusOptions: Option[] = [
        { value: 'draft', label: t('status.draft') },
        { value: 'published', label: t('status.published') }
    ];

    const schema = getLandingPageSchema(t);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isDirty }
    } = useForm<FormFields>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema) as any,
        defaultValues: {
            title: '',
            slug: '',
            page_type: 'destination',
            status: 'draft',
            intro: '',
            hero_image: '',
            seo_title: '',
            seo_description: '',
            og_image: '',
            filters: '',
            content_blocks: []
        }
    });

    const { fields: blockFields, append: appendBlock, remove: removeBlock } = useFieldArray({
        control,
        name: 'content_blocks'
    });

    const titleValue = watch('title');
    const heroImageValue = watch('hero_image');
    const ogImageValue = watch('og_image');

    // Auto-generate slug from title (only when creating, not editing)
    useEffect(() => {
        if (!selectedLanding && titleValue) {
            const generatedSlug = titleValue
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[đĐ]/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setValue('slug', generatedSlug, { shouldDirty: true, shouldValidate: true });
        }
    }, [titleValue, selectedLanding, setValue]);

    // Hydrate form on edit
    useEffect(() => {
        if (selectedLanding) {
            reset({
                title: selectedLanding.title,
                slug: selectedLanding.slug,
                page_type: selectedLanding.page_type,
                status: selectedLanding.status,
                intro: selectedLanding.intro || '',
                hero_image: selectedLanding.hero_image || '',
                seo_title: selectedLanding.seo_title || '',
                seo_description: selectedLanding.seo_description || '',
                og_image: selectedLanding.og_image || '',
                filters: selectedLanding.filters ? JSON.stringify(selectedLanding.filters, null, 2) : '',
                content_blocks: (selectedLanding.content_blocks as unknown as FormFields['content_blocks']) || []
            });
        } else {
            reset({
                title: '',
                slug: '',
                page_type: 'destination',
                status: 'draft',
                intro: '',
                hero_image: '',
                seo_title: '',
                seo_description: '',
                og_image: '',
                filters: '',
                content_blocks: []
            });
        }
        setActiveTab('content');
    }, [selectedLanding, reset, isOpen]);

    const handleFormSubmit = async (values: FormFields) => {
        let parsedFilters: Record<string, unknown> | null = null;
        if (values.filters && values.filters.trim() !== '') {
            try {
                parsedFilters = JSON.parse(values.filters);
            } catch {
                toast.error(t('validation.invalid_json'));
                return;
            }
        }

        const payload: CreateLandingPageInput = {
            title: values.title,
            slug: values.slug,
            page_type: values.page_type,
            status: values.status,
            intro: values.intro || null,
            hero_image: values.hero_image || null,
            seo_title: values.seo_title || null,
            seo_description: values.seo_description || null,
            og_image: values.og_image || null,
            filters: parsedFilters,
            content_blocks: values.content_blocks || []
        };

        await onSubmit(payload);
    };

    const handleImageUpload = async (file: File, type: 'hero' | 'og') => {
        const formData = new FormData();
        formData.append('image', file);

        if (type === 'hero') setIsUploadingHero(true);
        else setIsUploadingOg(true);

        try {
            const res = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const imageUrl = res.data?.url || res.data?.data?.url;
            if (imageUrl) {
                setValue(type === 'hero' ? 'hero_image' : 'og_image', imageUrl, { shouldDirty: true });
                toast.success(t('common:success.create', { defaultValue: 'Uploaded successfully' }));
            } else {
                throw new Error('Upload failed');
            }
        } catch {
            toast.error(t('common:error.create', { defaultValue: 'Upload failed' }));
        } finally {
            if (type === 'hero') setIsUploadingHero(false);
            else setIsUploadingOg(false);
        }
    };

    const handleCloseAttempt = () => {
        if (isDirty) {
            const confirmClose = window.confirm(t('common:notices.unsaved_changes_body'));
            if (confirmClose) onClose();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Blocker Guard */}
            <UnsavedChangesGuard isDirty={isDirty} />

            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
                onClick={handleCloseAttempt}
            />

            {/* Content Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-white flex flex-col shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
                    
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div>
                            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                                {selectedLanding ? t('edit_landing') : t('add_new')}
                            </h2>
                        </div>
                        <button
                            onClick={handleCloseAttempt}
                            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-100 px-6 bg-slate-50">
                        <button
                            type="button"
                            onClick={() => setActiveTab('content')}
                            className={clsx(
                                "flex items-center gap-1.5 py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
                                activeTab === 'content'
                                    ? "border-[#14b8a6] text-[#0f766e]"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <FileText size={16} />
                            {t('tabs.content')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('seo')}
                            className={clsx(
                                "flex items-center gap-1.5 py-3.5 px-6 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
                                activeTab === 'seo'
                                    ? "border-[#14b8a6] text-[#0f766e]"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <ImageIcon size={16} />
                            {t('tabs.seo')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={clsx(
                                "flex items-center gap-1.5 py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
                                activeTab === 'settings'
                                    ? "border-[#14b8a6] text-[#0f766e]"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <HelpCircle size={16} />
                            {t('tabs.settings')}
                        </button>
                    </div>

                    {/* Form Container */}
                    <form 
                        onSubmit={handleSubmit(handleFormSubmit)} 
                        className="flex-1 flex flex-col min-h-0 bg-white"
                    >
                        {/* Scrollable Fields */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            
                            {/* TAB 1: Content */}
                            {activeTab === 'content' && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    {/* Title */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.title')} <span className="text-red-500">*</span>
                                        </label>
                                        <TextInput
                                            placeholder={t('form.title_placeholder')}
                                            {...register('title')}
                                            invalid={!!errors.title}
                                        />
                                        {errors.title && (
                                            <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>
                                        )}
                                    </div>

                                    {/* Slug */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.slug')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-[#14b8a6] transition-all">
                                            <span className="pl-4 pr-1 text-slate-400 text-sm font-medium">/landing/</span>
                                            <input
                                                type="text"
                                                {...register('slug')}
                                                placeholder={t('form.slug_placeholder')}
                                                className="flex-1 py-2.5 bg-transparent border-0 text-sm outline-hidden font-medium placeholder:text-slate-400"
                                            />
                                        </div>
                                        {errors.slug && (
                                            <span className="text-red-500 text-xs font-bold">{errors.slug.message}</span>
                                        )}
                                    </div>

                                    {/* Page Type & Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="page_type"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                        {t('form.page_type')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <CustomSelect
                                                        options={pageTypeOptions}
                                                        value={pageTypeOptions.find(o => o.value === field.value) || null}
                                                        onChange={(opt) => field.onChange(opt ? opt.value : 'destination')}
                                                        size="sm"
                                                    />
                                                    {errors.page_type && (
                                                        <span className="text-red-500 text-xs font-bold">{errors.page_type.message}</span>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                        {t('form.status')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <CustomSelect
                                                        options={statusOptions}
                                                        value={statusOptions.find(o => o.value === field.value) || null}
                                                        onChange={(opt) => field.onChange(opt ? opt.value : 'draft')}
                                                        size="sm"
                                                    />
                                                    {errors.status && (
                                                        <span className="text-red-500 text-xs font-bold">{errors.status.message}</span>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Intro */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.intro')}
                                        </label>
                                        <TextareaField
                                            rows={3}
                                            placeholder={t('form.intro_placeholder')}
                                            {...register('intro')}
                                            invalid={!!errors.intro}
                                        />
                                        {errors.intro && (
                                            <span className="text-red-500 text-xs font-bold">{errors.intro.message}</span>
                                        )}
                                    </div>

                                    {/* Hero Image */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.hero_image')}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <TextInput
                                                placeholder={t('form.hero_image_placeholder')}
                                                {...register('hero_image')}
                                                invalid={!!errors.hero_image}
                                                containerClassName="flex-1"
                                            />
                                            <label className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#14b8a6] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm">
                                                <Upload size={14} />
                                                {isUploadingHero ? t('common:labels.loading') : 'Tải lên'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) void handleImageUpload(file, 'hero');
                                                    }}
                                                    className="hidden"
                                                    disabled={isUploadingHero}
                                                />
                                            </label>
                                        </div>
                                        {heroImageValue && (
                                            <div className="relative w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden mt-1.5 flex items-center justify-center">
                                                <img 
                                                    src={heroImageValue} 
                                                    alt="Hero Banner Preview" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setValue('hero_image', '', { shouldDirty: true })}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-slate-900/60 hover:bg-slate-900 rounded-full flex items-center justify-center text-white transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SEO Settings */}
                            {activeTab === 'seo' && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    {/* SEO Title */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.seo_title')}
                                        </label>
                                        <TextInput
                                            placeholder={t('form.seo_title_placeholder')}
                                            {...register('seo_title')}
                                            invalid={!!errors.seo_title}
                                        />
                                        <span className="text-[10px] text-slate-400 font-semibold self-end">
                                            {(watch('seo_title') || '').length}/70 ký tự
                                        </span>
                                    </div>

                                    {/* SEO Description */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.seo_description')}
                                        </label>
                                        <TextareaField
                                            rows={4}
                                            placeholder={t('form.seo_description_placeholder')}
                                            {...register('seo_description')}
                                            invalid={!!errors.seo_description}
                                        />
                                        <span className="text-[10px] text-slate-400 font-semibold self-end">
                                            {(watch('seo_description') || '').length}/160 ký tự
                                        </span>
                                    </div>

                                    {/* OG Image */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.og_image')}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <TextInput
                                                placeholder={t('form.og_image_placeholder')}
                                                {...register('og_image')}
                                                invalid={!!errors.og_image}
                                                containerClassName="flex-1"
                                            />
                                            <label className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#14b8a6] hover:bg-[#0f766e] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm">
                                                <Upload size={14} />
                                                {isUploadingOg ? t('common:labels.loading') : 'Tải lên'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) void handleImageUpload(file, 'og');
                                                    }}
                                                    className="hidden"
                                                    disabled={isUploadingOg}
                                                />
                                            </label>
                                        </div>
                                        {ogImageValue && (
                                            <div className="relative w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden mt-1.5 flex items-center justify-center">
                                                <img 
                                                    src={ogImageValue} 
                                                    alt="OG Image Preview" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setValue('og_image', '', { shouldDirty: true })}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-slate-900/60 hover:bg-slate-900 rounded-full flex items-center justify-center text-white transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: Settings & Content Blocks */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    {/* Default Tour Filters (JSON) */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                            {t('form.filters')}
                                        </label>
                                        <TextareaField
                                            rows={4}
                                            placeholder={t('form.filters_placeholder')}
                                            {...register('filters')}
                                            invalid={!!errors.filters}
                                            className="font-mono text-[13px] leading-relaxed"
                                        />
                                        {errors.filters && (
                                            <span className="text-red-500 text-xs font-bold">{errors.filters.message}</span>
                                        )}
                                    </div>

                                    {/* Content Blocks Builder */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                {t('form.content_blocks')}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => appendBlock({ type: 'faq', question: '', answer: '' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1] hover:bg-[#ccfbf1] rounded-lg text-xs font-bold transition-all shadow-xs"
                                                >
                                                    <Plus size={12} />
                                                    + FAQ
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => appendBlock({ type: 'description', title: '', content: '' })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-xs"
                                                >
                                                    <Plus size={12} />
                                                    + Block
                                                </button>
                                            </div>
                                        </div>

                                        {/* Blocks List */}
                                        <div className="space-y-4">
                                            {blockFields.map((field, index) => {
                                                const type = watch(`content_blocks.${index}.type`);

                                                return (
                                                    <div 
                                                        key={field.id}
                                                        className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl relative space-y-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 font-sans">
                                                                Block #{index + 1}: {type === 'faq' ? 'FAQ' : 'Mô tả'}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBlock(index)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>

                                                        {type === 'faq' ? (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    {...register(`content_blocks.${index}.question`)}
                                                                    placeholder={t('form.faq_question')}
                                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:border-[#14b8a6] outline-hidden transition-all"
                                                                />
                                                                <textarea
                                                                    {...register(`content_blocks.${index}.answer`)}
                                                                    rows={3}
                                                                    placeholder={t('form.faq_answer')}
                                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:border-[#14b8a6] outline-hidden transition-all resize-none"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    {...register(`content_blocks.${index}.title`)}
                                                                    placeholder={t('form.block_title')}
                                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:border-[#14b8a6] outline-hidden transition-all"
                                                                />
                                                                <textarea
                                                                    {...register(`content_blocks.${index}.content`)}
                                                                    rows={3}
                                                                    placeholder={t('form.block_content')}
                                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:border-[#14b8a6] outline-hidden transition-all resize-none"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Controls */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            {/* Next Tab helper or info */}
                            <div>
                                {activeTab === 'content' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('seo')}
                                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors uppercase tracking-wider"
                                    >
                                        Thiết lập SEO
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                                {activeTab === 'seo' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('settings')}
                                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors uppercase tracking-wider"
                                    >
                                        Bộ lọc & blocks
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handleCloseAttempt}
                                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl h-10"
                                    disabled={isSubmitting}
                                >
                                    {t('common:actions.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl h-10 min-w-[100px]"
                                    isLoading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    {t('common:actions.saving')}
                                </Button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandingPageFormDrawer;
