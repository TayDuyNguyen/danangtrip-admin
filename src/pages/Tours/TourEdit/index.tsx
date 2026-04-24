import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    FileText,
    DollarSign,
    Calendar,
    Map,
    CheckSquare,
    Image as ImageIcon,
    Clock,
    Users,
    Navigation,
    Type,
    Info,
    AlertTriangle,
    Trash2
} from 'lucide-react';

import { createTourSchema, type CreateTourInput } from '@/validations/tour.schema';
import { useTourMutations, useTourCategoriesQuery, useTourDetailQuery } from '@/hooks/useTourQueries';
import { ROUTES } from '@/routes/routes';
import { computeDiscountedPrice, slugifyVietnamese, scrollToFirstError, cn } from '@/utils';
import CustomSelect from '@/components/ui/CustomSelect';
import { TextInput } from '@/components/ui/TextInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { TextareaField } from '@/components/ui/TextareaField';
import ErrorWidget from '@/components/common/ErrorWidget';
import SectionHeader from '../TourCreate/components/SectionHeader';
import ItineraryBuilder from '../TourCreate/components/ItineraryBuilder';
import ImageGallery from '../TourCreate/components/ImageGallery';
import { tourMapper } from '@/dataHelper/tour.mapper';
import SidebarCards from '../TourCreate/components/SidebarCards';
import TourDeleteDialog from '../TourList/components/TourDeleteDialog';

const SCROLL_FIELD_ORDER: string[] = [
    'name',
    'slug',
    'tour_category_id',
    'duration',
    'short_desc',
    'description',
    'price_adult',
    'price_child',
    'price_infant',
    'discount_percent',
    'min_people',
    'max_people',
    'start_time',
    'meeting_point',
    'available_from',
    'available_to',
    'itinerary',
    'inclusions',
    'exclusions',
    'thumbnail',
    'video_url'
];

function EditTour() {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isScrolled, setIsScrolled] = useState(false);
    const [autoSlug, setAutoSlug] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'MAIN' || target.classList.contains('overflow-y-auto'))) {
                setIsScrolled((prev) => {
                    const currentScroll = target.scrollTop;
                    if (!prev && currentScroll > 10) return true;
                    if (prev && currentScroll < 2) return false;
                    return prev;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    // Parallel fetching Rule §14
    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
        refetch: refetchCategories
    } = useTourCategoriesQuery('admin');

    const {
        data: tourData,
        isLoading: tourLoading,
        isError: tourError,
        refetch: refetchTour
    } = useTourDetailQuery(id);

    const { updateTourMutation, deleteMutation } = useTourMutations();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting, dirtyFields }
    } = useForm<CreateTourInput>({
        resolver: yupResolver(createTourSchema(t)) as Resolver<CreateTourInput>,
        defaultValues: {
            status: 'active',
            is_featured: false,
            is_hot: false,
            itinerary: [{ day: 1, title: '', content: '' }],
            images: [],
            location_ids: [],
            discount_percent: 0,
            min_people: 1,
            max_people: 10,
            short_desc: '',
            inclusions: '',
            exclusions: '',
            video_url: null
        }
    });

    // Populate form Rule §15 (data already mapped by useTourDetailQuery -> tourApi -> mapper)
    useEffect(() => {
        if (tourData) {
            // Cast to intermediate unknown to satisfy TS during form population
            reset(tourData as unknown as CreateTourInput);
        }
    }, [tourData, reset]);

    const tourName = useWatch({ control, name: 'name' });
    const shortDesc = useWatch({ control, name: 'short_desc' }) || '';
    const priceAdult = useWatch({ control, name: 'price_adult' });
    const discountPercent = useWatch({ control, name: 'discount_percent' }) ?? 0;

    const priceAfterDiscount = computeDiscountedPrice(priceAdult, discountPercent);

    useEffect(() => {
        if (tourName && autoSlug) {
            const slug = slugifyVietnamese(tourName);
            setValue('slug', slug, { shouldValidate: true });
        }
    }, [tourName, setValue, autoSlug]);

    const onSubmit = handleSubmit(
        async (data) => {
            if (!id) return;
            try {
                // Partial PUT optimization: Only send changed (dirty) fields
                const partialData: Record<string, unknown> = {};
                
                // Collect dirty fields correctly including nested ones
                (Object.keys(dirtyFields) as Array<keyof CreateTourInput>).forEach(key => {
                    // Optimized check: RHF sets dirtyFields[key] to true or an object/array if children are dirty
                    if (dirtyFields[key]) {
                        partialData[key] = data[key];
                    }
                });

                if (Object.keys(partialData).length === 0) {
                    navigate(ROUTES.TOURS_LIST);
                    return;
                }

                // Transform to API format using mapper (now handles partials strictly)
                const mappedData = tourMapper.mapToRaw(partialData);

                await updateTourMutation.mutateAsync({
                    id,
                    data: mappedData as Record<string, unknown>
                });
                navigate(ROUTES.TOURS_LIST);
            } catch {
                toast.error(t('common:error_occurred'));
            }
        },
        (errors) => {
            scrollToFirstError(errors, SCROLL_FIELD_ORDER);
        }
    );

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!id) return;
        try {
            await deleteMutation.mutateAsync(id);
            setIsDeleteDialogOpen(false);
            navigate(ROUTES.TOURS_LIST);
        } catch {
            // error handled in mutation
        }
    };

    const busy = isSubmitting || updateTourMutation.isPending;

    if (tourLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">{t('common:loading')}</p>
                </div>
            </div>
        );
    }

    if (tourError) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
                <ErrorWidget
                    title={t('messages.fetch_error')}
                    message={t('common:error_occurred')}
                    onRetry={() => refetchTour()}
                />
            </div>
        );
    }

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name
    }));

    const durationSuggestions = t('form.basic.duration_suggestions', {
        returnObjects: true
    }) as string[];

    return (
        <form onSubmit={onSubmit} className="min-h-screen bg-[#F8FAFC] pb-20 font-inter" noValidate>
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-sm rounded-b-2xl">
                <div
                    className={cn(
                        'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-300',
                        isScrolled ? 'py-3' : 'py-5 lg:py-6'
                    )}
                >
                    <div className="flex-1 min-w-0">
                        <nav
                            className={cn(
                                'flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-medium text-[#94A3B8] transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-2'
                            )}
                        >
                            <span>{t('title.breadcrumb_parent')}</span>
                            <span aria-hidden>/</span>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.TOURS_LIST)}
                                className="hover:text-slate-600 transition-colors"
                            >
                                {t('title.breadcrumb_list')}
                            </button>
                            <span aria-hidden>/</span>
                            <span className="text-slate-600">{t('title.breadcrumb_edit')}</span>
                        </nav>
                        <div className="flex items-center gap-3">
                            <h1
                                className={cn(
                                    'font-bold text-[#1E293B] tracking-tight transition-all duration-300',
                                    isScrolled ? 'text-lg' : 'text-2xl'
                                )}
                            >
                                {t('title.edit')}
                            </h1>
                            {isScrolled && (
                                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#0066CC] animate-in fade-in slide-in-from-left-2 duration-300">
                                    {t('title.breadcrumb_edit')}
                                </span>
                            )}
                        </div>
                        <p
                            className={cn(
                                'text-sm text-[#64748B] max-w-xl transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                            )}
                        >
                            {t('form.edit_subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.TOURS_LIST)}
                            className="px-5 py-2.5 text-sm font-semibold rounded-[10px] border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
                        >
                            {t('form.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#0066CC] hover:bg-[#004999] disabled:bg-[#3385D6] text-white text-sm font-semibold shadow-sm transition-colors"
                        >
                            {busy ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {busy ? t('common:actions.saving') : t('form.actions.save_changes')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:flex-1 space-y-6">
                        <div
                            data-tour-field="name"
                            className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm"
                        >
                            <SectionHeader
                                icon={FileText}
                                title={t('form.sections.basic')}
                                subtitle={t('form.section_descriptions.basic')}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.basic.name')}</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <TextInput
                                            {...register('name')}
                                            placeholder={t('form.basic.name_placeholder')}
                                            invalid={!!errors.name}
                                            className="pl-11"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2" data-tour-field="slug">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-semibold text-slate-700">{t('form.basic.slug')}</label>
                                            {autoSlug && (
                                                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0066CC] border border-[#B3D9FF]">
                                                    {t('form.basic.slug_auto')}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAutoSlug(!autoSlug)}
                                            className="text-xs font-semibold text-[#0066CC] hover:underline"
                                        >
                                            {autoSlug ? t('form.basic.slug_manual') : t('form.basic.slug_auto')}
                                        </button>
                                    </div>
                                    <TextInput
                                        {...register('slug')}
                                        placeholder={t('form.basic.slug_placeholder')}
                                        readOnly={autoSlug}
                                        className={cn(
                                            "transition-colors",
                                            autoSlug ? "bg-slate-100 text-slate-500 italic" : "bg-white"
                                        )}
                                    />
                                    {!autoSlug && (
                                        <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mt-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] leading-relaxed text-amber-800 italic">
                                                {t('form.basic.slug_warning')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2" data-tour-field="tour_category_id">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.basic.category')}</label>
                                    {categoriesError ? (
                                        <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-700">
                                            <span>{t('form.categories.error')}</span>
                                            <button
                                                type="button"
                                                onClick={() => refetchCategories()}
                                                className="self-start text-xs font-semibold text-red-800 underline hover:no-underline"
                                            >
                                                {t('form.categories.retry')}
                                            </button>
                                        </div>
                                    ) : categoriesLoading ? (
                                        <div className="h-[44px] w-full bg-slate-100 rounded-xl animate-pulse" />
                                    ) : (
                                        <Controller
                                            name="tour_category_id"
                                            control={control}
                                            render={({ field }) => (
                                                <CustomSelect
                                                    options={categoryOptions}
                                                    value={categoryOptions.find((o) => o.value === field.value)}
                                                    onChange={(val: { value: number | string } | null) =>
                                                        field.onChange(val?.value)
                                                    }
                                                    placeholder={t('form.basic.category_placeholder')}
                                                    isSearchable
                                                />
                                            )}
                                        />
                                    )}
                                    {errors.tour_category_id && (
                                        <p className="text-xs text-red-500 font-medium">
                                            {errors.tour_category_id.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2" data-tour-field="duration">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.basic.duration')}</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <TextInput
                                            {...register('duration')}
                                            placeholder={t('form.basic.duration_placeholder')}
                                            invalid={!!errors.duration}
                                            className="pl-11"
                                            list="tour-duration-options"
                                        />
                                        <datalist id="tour-duration-options">
                                            {Array.isArray(durationSuggestions) &&
                                                durationSuggestions.map((s) => (
                                                    <option key={s} value={s} />
                                                ))}
                                        </datalist>
                                    </div>
                                    {errors.duration && (
                                        <p className="text-xs text-red-500 font-medium">{errors.duration.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2" data-tour-field="short_desc">
                                    <div className="flex justify-between items-center gap-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            {t('form.basic.short_desc')}
                                        </label>
                                        <span className="text-xs text-slate-400">
                                            {t('form.basic.short_desc_counter', { current: shortDesc.length })}
                                        </span>
                                    </div>
                                    <TextareaField
                                        {...register('short_desc')}
                                        rows={3}
                                        placeholder={t('form.basic.short_desc_placeholder')}
                                        invalid={!!errors.short_desc}
                                    />
                                    {errors.short_desc && (
                                        <p className="text-xs text-red-500 font-medium">{errors.short_desc.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2" data-tour-field="description">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.basic.description')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.basic.description_helper')}</p>
                                    <TextareaField
                                        {...register('description')}
                                        rows={6}
                                        placeholder={t('form.basic.description_placeholder')}
                                        invalid={!!errors.description}
                                        className="leading-relaxed"
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
                            <SectionHeader
                                icon={DollarSign}
                                title={t('form.sections.pricing')}
                                subtitle={t('form.section_descriptions.pricing')}
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2" data-tour-field="price_adult">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.pricing.price_adult')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_price_adult')}</p>
                                    <div className="relative">
                                        <Controller
                                            name="price_adult"
                                            control={control}
                                            render={({ field }) => (
                                                <CurrencyInput
                                                    {...field}
                                                    invalid={!!errors.price_adult}
                                                    className="font-bold text-slate-800"
                                                />
                                            )}
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                                            {t('form.pricing.currency_suffix')}
                                        </span>
                                    </div>
                                    {errors.price_adult && (
                                        <p className="text-xs text-red-500 font-medium">{errors.price_adult.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2" data-tour-field="price_child">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.pricing.price_child')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_price_child')}</p>
                                    <div className="relative">
                                        <Controller
                                            name="price_child"
                                            control={control}
                                            render={({ field }) => (
                                                <CurrencyInput
                                                    {...field}
                                                    className="font-bold text-slate-800"
                                                />
                                            )}
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                                            {t('form.pricing.currency_suffix')}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2" data-tour-field="price_infant">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.pricing.price_infant')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_price_infant')}</p>
                                    <div className="relative">
                                        <Controller
                                            name="price_infant"
                                            control={control}
                                            render={({ field }) => (
                                                <CurrencyInput
                                                    {...field}
                                                    className="font-bold text-slate-800"
                                                />
                                            )}
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                                            {t('form.pricing.currency_suffix')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2" data-tour-field="discount_percent">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.pricing.discount')}</label>
                                    <div className="relative">
                                        <TextInput type="number" {...register('discount_percent')} />
                                        <span className="absolute right-4 top-3.5 text-slate-400">%</span>
                                    </div>
                                </div>

                                <div className="space-y-2 sm:col-span-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.pricing.price_after_discount')}
                                    </label>
                                    <div className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[#0066CC] text-base font-bold">
                                        {priceAfterDiscount.toLocaleString('vi-VN')} {t('form.pricing.currency_suffix')}
                                    </div>
                                </div>

                                <div className="space-y-2" data-tour-field="min_people">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.pricing.min_people')}</label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_min_people')}</p>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <TextInput
                                            type="number"
                                            min={1}
                                            {...register('min_people')}
                                            invalid={!!errors.min_people}
                                            className="pl-11"
                                        />
                                    </div>
                                    {errors.min_people && (
                                        <p className="text-xs text-red-500 font-medium">{errors.min_people.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2" data-tour-field="max_people">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.pricing.max_people')}</label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_max_people')}</p>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <TextInput
                                            type="number"
                                            {...register('max_people')}
                                            invalid={!!errors.max_people}
                                            className="pl-11"
                                        />
                                    </div>
                                    {errors.max_people && (
                                        <p className="text-xs text-red-500 font-medium">{errors.max_people.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2" data-tour-field="start_time">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.pricing.start_time')}</label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.pricing.helper_start_time')}</p>
                                    <TextInput
                                        type="time"
                                        {...register('start_time')}
                                        className="appearance-none"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-3" data-tour-field="meeting_point">
                                    <label className="text-sm font-semibold text-slate-700">{t('form.pricing.meeting_point')}</label>
                                    <div className="relative">
                                        <Navigation className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <TextInput
                                            {...register('meeting_point')}
                                            placeholder={t('form.pricing.meeting_point_placeholder')}
                                            className="pl-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
                            <SectionHeader
                                icon={Calendar}
                                title={t('form.sections.schedule')}
                                subtitle={t('form.section_descriptions.schedule')}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2" data-tour-field="available_from">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.schedule.available_from')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.schedule.helper_from')}</p>
                                    <TextInput
                                        type="date"
                                        {...register('available_from')}
                                        invalid={!!errors.available_from}
                                    />
                                    {errors.available_from && (
                                        <p className="text-xs text-red-500 font-medium">{errors.available_from.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2" data-tour-field="available_to">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {t('form.schedule.available_to')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.schedule.helper_to')}</p>
                                    <TextInput
                                        type="date"
                                        {...register('available_to')}
                                        invalid={!!errors.available_to}
                                    />
                                    {errors.available_to && (
                                        <p className="text-xs text-red-500 font-medium">{errors.available_to.message}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2 flex gap-3 rounded-[10px] border border-amber-200/80 bg-[#FEF3C7] p-3.5 text-[13px] text-[#92400E]">
                                    <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p>{t('form.schedule.info_notice')}</p>
                                        <button
                                            type="button"
                                            className="mt-2 text-[13px] font-semibold text-[#0066CC] hover:underline"
                                            onClick={() => navigate(ROUTES.TOURS_LIST)}
                                        >
                                            {t('form.schedule.info_link')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div data-tour-field="itinerary" className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
                            <SectionHeader
                                icon={Map}
                                title={t('form.sections.itinerary')}
                                subtitle={t('form.section_descriptions.itinerary')}
                                required
                            />
                            <ItineraryBuilder control={control} register={register} errors={errors} />
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
                            <SectionHeader
                                icon={CheckSquare}
                                title={t('form.sections.inclusions')}
                                subtitle={t('form.section_descriptions.inclusions')}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2" data-tour-field="inclusions">
                                    <label className="text-sm font-semibold text-green-700">
                                        {t('form.inclusions_fields.included_label')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.inclusions_fields.line_hint')}</p>
                                    <TextareaField
                                        {...register('inclusions')}
                                        rows={5}
                                        placeholder={t('form.inclusions_fields.included_placeholder')}
                                        className="bg-green-50/30 border-green-100 rounded-2xl focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-2" data-tour-field="exclusions">
                                    <label className="text-sm font-semibold text-red-700">
                                        {t('form.inclusions_fields.excluded_label')}
                                    </label>
                                    <p className="text-xs text-[#94A3B8]">{t('form.inclusions_fields.line_hint')}</p>
                                    <TextareaField
                                        {...register('exclusions')}
                                        rows={5}
                                        placeholder={t('form.inclusions_fields.excluded_placeholder')}
                                        className="bg-red-50/30 border-red-100 rounded-2xl focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div data-tour-field="thumbnail" className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
                            <SectionHeader
                                icon={ImageIcon}
                                title={t('form.sections.media')}
                                subtitle={t('form.section_descriptions.media')}
                            />
                            <ImageGallery setValue={setValue} watch={watch} />
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20">
                                <AlertTriangle className="w-24 h-24 text-red-500" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                        {t('form.danger_zone.title')}
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-lg">
                                        {t('form.danger_zone.description')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {t('form.danger_zone.delete_button')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside className="w-full lg:w-[320px] lg:sticky lg:top-24">
                        <SidebarCards
                            register={register}
                            watch={watch}
                            onPublish={onSubmit}
                            isSubmitting={busy}
                            submitLabel={t('form.actions.save_changes')}
                        />
                    </aside>
                </div>
            </div>
            <TourDeleteDialog
                isOpen={isDeleteDialogOpen}
                tourName={tourName || ''}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </form>
    );
}

export default EditTour;
