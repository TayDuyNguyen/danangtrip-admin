import { useEffect, useCallback, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';
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
    Info
} from 'lucide-react';

import { createTourSchema, type CreateTourInput } from '@/validations/tour.schema';
import { useTourMutations, useTourCategoriesQuery } from '@/hooks/useTourQueries';
import { ROUTES } from '@/routes/routes';
import { extractCreatedTourId, computeDiscountedPrice, slugifyVietnamese, scrollToFirstError, cn } from '@/utils';
import CustomSelect from '@/components/ui/CustomSelect';
import { TextInput } from '@/components/ui/TextInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { TextareaField } from '@/components/ui/TextareaField';
import SectionHeader from './components/SectionHeader';
import ItineraryBuilder from './components/ItineraryBuilder';
import ImageGallery from './components/ImageGallery';
import SidebarCards from './components/SidebarCards';

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

function AddTour() {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            // MainLayout's scrollable container is <main>
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

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
        refetch: refetchCategories
    } = useTourCategoriesQuery();
    const { createTourMutation } = useTourMutations();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
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
        } as Partial<CreateTourInput>
    });

    const tourName = useWatch({ control, name: 'name' });
    const shortDesc = useWatch({ control, name: 'short_desc' }) || '';
    const priceAdult = useWatch({ control, name: 'price_adult' });
    const discountPercent = useWatch({ control, name: 'discount_percent' }) ?? 0;

    const priceAfterDiscount = computeDiscountedPrice(priceAdult, discountPercent);

    useEffect(() => {
        if (tourName) {
            const slug = slugifyVietnamese(tourName);
            setValue('slug', slug, { shouldValidate: true });
        }
    }, [tourName, setValue]);

    const submitWithStatus = useCallback(
        async (data: CreateTourInput, status: 'active' | 'inactive') => {
            createTourMutation.reset();
            try {
                const res = await createTourMutation.mutateAsync({
                    ...data,
                    status
                } as Record<string, unknown>);
                const id = extractCreatedTourId(res);
                if (id != null) {
                    navigate(ROUTES.TOURS_EDIT.replace(':id', String(id)));
                } else {
                    navigate(ROUTES.TOURS_LIST);
                }
            } catch (error) {
                console.error('Submit error:', error);
            }
        },
        [createTourMutation, navigate]
    );

    const onPublish = handleSubmit(
        (data) => submitWithStatus(data, 'active'),
        (errors) => scrollToFirstError(errors, SCROLL_FIELD_ORDER)
    );

    const busy = isSubmitting || createTourMutation.isPending;

    const createErrorDetail =
        createTourMutation.error instanceof AxiosError
            ? (createTourMutation.error as AxiosError<ErrorResponse>).response?.data?.message
            : undefined;

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name
    }));

    const durationSuggestions = t('form.basic.duration_suggestions', {
        returnObjects: true
    }) as string[];

    return (
        <form onSubmit={onPublish} className="min-h-screen bg-[#F8FAFC] pb-20 font-sans" noValidate>
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-sm rounded-b-2xl">
                <div
                    className={cn(
                        'w-full px-4 sm:px-6 lg:px-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-300',
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
                            <span className="text-slate-600">{t('title.breadcrumb_create')}</span>
                        </nav>
                        <div className="flex items-center gap-3">
                            <h1
                                className={cn(
                                    'font-bold text-[#1E293B] tracking-tight transition-all duration-300',
                                    isScrolled ? 'text-lg' : 'text-2xl'
                                )}
                            >
                                {t('title.add')}
                            </h1>
                            {isScrolled && (
                                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dff7f4] text-[#0f766e] animate-in fade-in slide-in-from-left-2 duration-300">
                                    {t('title.breadcrumb_create')}
                                </span>
                            )}
                        </div>
                        <p
                            className={cn(
                                'text-sm text-[#64748B] max-w-xl transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                            )}
                        >
                            {t('form.page_subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.TOURS_LIST)}
                            className="px-5 py-2.5 text-sm font-semibold rounded-md border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
                        >
                            {t('form.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#14b8a6] hover:bg-[#0f766e] disabled:bg-[#5dd4c7] text-white text-sm font-semibold shadow-sm transition-colors"
                        >
                            {busy ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {busy ? t('form.actions.creating') : t('form.actions.create_tour')}
                        </button>
                    </div>
                </div>
            </div>

            {createTourMutation.isError && (
                <div className="w-full px-4 sm:px-6 lg:px-10 pt-4" role="alert">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-800">
                        <div>
                            <p className="text-sm font-semibold">{t('messages.create_error_title')}</p>
                            <p className="text-sm mt-1 text-red-700">
                                {createErrorDetail || t('messages.create_error')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => createTourMutation.reset()}
                            className="shrink-0 text-sm font-semibold text-red-800 underline hover:no-underline"
                        >
                            {t('common:actions.dismiss')}
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full px-4 sm:px-6 lg:px-10 pt-8">
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
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <label className="text-sm font-semibold text-slate-700">{t('form.basic.slug')}</label>
                                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1]">
                                            {t('form.basic.slug_auto')}
                                        </span>
                                    </div>
                                    <TextInput
                                        {...register('slug')}
                                        placeholder={t('form.basic.slug_placeholder')}
                                        readOnly
                                        className="bg-slate-100 text-slate-500 text-sm italic"
                                    />
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
                                        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            {t('form.categories.loading')}
                                        </p>
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
                                    <div className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-[#14b8a6] text-base font-bold">
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
                                <div className="sm:col-span-2 flex gap-3 rounded-md border border-[#d9f99d] bg-[#f4fce3] p-3.5 text-[13px] text-[#365314]">
                                    <Info className="w-5 h-5 text-[#0f766e] shrink-0 mt-0.5" />
                                    <div>
                                        <p>{t('form.schedule.info_notice')}</p>
                                        <button
                                            type="button"
                                            className="mt-2 text-[13px] font-semibold text-[#14b8a6] hover:underline"
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
                    </div>

                    <aside className="w-full lg:w-[320px] lg:sticky lg:top-24">
                        <SidebarCards
                            register={register}
                            watch={watch}
                            onPublish={onPublish}
                            isSubmitting={busy}
                        />
                    </aside>
                </div>
            </div>
        </form>
    );
};

export default AddTour;
