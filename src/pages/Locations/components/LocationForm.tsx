import { useRef, useState, useEffect } from 'react';
import { useForm, Controller, useWatch, type FieldErrors, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import {
    Info,
    Layers,
    Phone,
    DollarSign,
    Map as MapIcon,
    Settings,
    Tag,
    Briefcase,
    Type,
    Link,
    MapPin,
    Smartphone,
    Mail,
    Globe,
    Clock
} from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import CustomSelect from '@/components/ui/CustomSelect';
import type { Option } from '@/components/ui/CustomSelect';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Button } from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import SectionHeader from '@/components/common/SectionHeader';
import { createLocationSchema } from '@/validations/location.schema';
import type { CreateLocationInput } from '@/validations/location.schema';
import {
    useLocationCategoriesQuery,
    useLocationTagsQuery,
    useLocationAmenitiesQuery,
    useLocationFilterDistrictsQuery,
    useCreateLocationMutation,
    useUpdateLocationMutation
} from '@/hooks/useLocationQueries';
import MapPicker from './MapPicker';
import MarkdownEditor from './MarkdownEditor';
import ImageUploader, { type ImageUploaderHandle } from './ImageUploader';
import TagSelector from './TagSelector';
import { slugifyVietnamese, extractCreatedLocationId } from '@/utils';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';

interface LocationFormProps {
    isEdit?: boolean;
    initialData?: CreateLocationInput & { id: number };
    onSubmittingChange?: (isSubmitting: boolean) => void;
    onSuccess?: (id?: number) => void;
    onCancel?: () => void;
    onDelete?: () => void;
}

const createDefaultValues = {
    name: '',
    slug: '',
    category_id: undefined as unknown as number,
    subcategory_id: null,
    description: '',
    short_description: '',
    address: '',
    district: '',
    latitude: undefined as unknown as number,
    longitude: undefined as unknown as number,
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    price_min: null,
    price_max: null,
    price_level: 1,
    status: 'active' as const,
    is_featured: false,
    tags: [],
    amenities: [],
    thumbnail: '',
    images: [],
    video_url: '',
};

const LocationForm = ({ isEdit = false, initialData, onSubmittingChange, onSuccess, onCancel, onDelete }: LocationFormProps) => {
    const { t } = useTranslation('location');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageUploaderRef = useRef<ImageUploaderHandle>(null);
    const { data: categories = [], isLoading: categoriesLoading } = useLocationCategoriesQuery();
    const { data: tags = [], isLoading: tagsLoading } = useLocationTagsQuery();
    const { data: amenities = [], isLoading: amenitiesLoading } = useLocationAmenitiesQuery();
    const { data: districts = [] } = useLocationFilterDistrictsQuery();
    
    const createMutation = useCreateLocationMutation();
    const updateMutation = useUpdateLocationMutation();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<CreateLocationInput>({
        resolver: yupResolver(createLocationSchema(t)) as Resolver<CreateLocationInput>,
        defaultValues: initialData || createDefaultValues
    });

    const normalizeOpeningHours = (value: CreateLocationInput['opening_hours']) => {
        if (Array.isArray(value)) {
            const items = value.map((item) => String(item).trim()).filter(Boolean);
            return items.length > 0 ? items : null;
        }

        if (typeof value !== 'string') return null;

        const items = value
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);

        return items.length > 0 ? items : null;
    };

    const setSubmittingState = (nextValue: boolean) => {
        setIsSubmitting(nextValue);
        onSubmittingChange?.(nextValue);
    };

    const onSubmit = async (data: CreateLocationInput) => {
        setSubmittingState(true);
        try {
            const dataWithUploadedImages = await imageUploaderRef.current?.uploadPendingImages(data) ?? data;
            const payload = {
                ...dataWithUploadedImages,
                opening_hours: normalizeOpeningHours(dataWithUploadedImages.opening_hours),
            } as CreateLocationInput;

            if (isEdit && initialData?.id) {
                await updateMutation.mutateAsync({ id: initialData.id, data: payload });
                onSuccess?.();
            } else {
                const res = await createMutation.mutateAsync(payload);
                const createdId = extractCreatedLocationId(res);
                imageUploaderRef.current?.clearPendingImages();
                onSuccess?.(createdId ?? undefined);
            }
        } finally {
            setSubmittingState(false);
        }
    };

    const focusFirstInvalidField = (formErrors: FieldErrors<CreateLocationInput>) => {
        const fieldOrder: Array<keyof CreateLocationInput> = [
            'name',
            'slug',
            'category_id',
            'short_description',
            'description',
            'address',
            'district',
            'phone',
            'email',
            'website',
            'latitude',
            'longitude',
            'price_min',
            'price_max',
            'thumbnail',
        ];
        const firstField = fieldOrder.find((field) => formErrors[field]) || (Object.keys(formErrors)[0] as keyof CreateLocationInput | undefined);
        if (!firstField) return;

        const fieldContainer = document.querySelector<HTMLElement>(`[data-location-field="${String(firstField)}"]`);
        const focusTarget = fieldContainer?.querySelector<HTMLElement>(
            'input:not([type="hidden"]), textarea, button, [tabindex]:not([tabindex="-1"])'
        );

        fieldContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => focusTarget?.focus(), 220);
    };

    const watchName = useWatch({ control, name: 'name' });
    const watchAllFields = useWatch({ control });

    useEffect(() => {
        if (isEdit || !watchName) return;
        setValue('slug', slugifyVietnamese(watchName), { shouldValidate: true, shouldDirty: false });
    }, [watchName, isEdit, setValue]);

    const debugErrors = Object.fromEntries(
        Object.entries(errors).map(([key, value]) => [
            key,
            {
                type: value?.type,
                message: value?.message,
            },
        ])
    );

    const handleAutoSlug = () => {
        if (watchName) {
            setValue('slug', slugifyVietnamese(watchName), { shouldValidate: true, shouldDirty: true });
        }
    };

    const priceLevelOptions = (['free', 'low', 'medium', 'high'] as const).map((key, index) => ({
        value: index + 1,
        label: t(`priceLevels.${key}`),
    }));

    type CompletionField = {
        key: keyof CreateLocationInput;
        label: string;
        isDone?: (fields: Partial<CreateLocationInput>) => boolean;
    };

    const requiredFields: CompletionField[] = [
        { key: 'name', label: t('form.basic.name') },
        { key: 'slug', label: t('form.basic.slug') },
        {
            key: 'category_id',
            label: t('form.basic.category'),
            isDone: (fields) => typeof fields.category_id === 'number' && fields.category_id > 0,
        },
        { key: 'short_description', label: t('form.basic.short_description') },
        { key: 'description', label: t('form.basic.description') },
        { key: 'address', label: t('form.contact.address') },
        { key: 'district', label: t('form.contact.district') },
        {
            key: 'latitude',
            label: t('form.sections.map'),
            isDone: (fields) =>
                typeof fields.latitude === 'number' &&
                !Number.isNaN(fields.latitude) &&
                typeof fields.longitude === 'number' &&
                !Number.isNaN(fields.longitude),
        },
        { key: 'thumbnail', label: t('form.media.thumbnail') },
    ];

    const isFieldComplete = (field: CompletionField) => {
        if (field.isDone) return field.isDone(watchAllFields);
        const value = watchAllFields[field.key];
        return !!value;
    };

    const completedFields = requiredFields.filter(isFieldComplete);
    const completionPercent = Math.round((completedFields.length / requiredFields.length) * 100);

    const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

    return (
        <>
            <UnsavedChangesGuard isDirty={isDirty && !busy} />
            <form
            id="location-form"
            onSubmit={handleSubmit(onSubmit, focusFirstInvalidField)}
            className="flex flex-col lg:flex-row gap-8"
        >
            {/* Left Column: Form Fields */}
            <div className="flex-1 space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={Layers}
                        title={t('form.sections.basic')}
                        subtitle={t('form.section_descriptions.basic')}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2" data-location-field="name">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.basic.name')}</label>
                            <TextInput
                                placeholder={t('form.basic.name_placeholder')}
                                {...register('name')}
                                invalid={!!errors.name}
                                leftIcon={<Type className="w-4 h-4" />}
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        <div className="md:col-span-2 space-y-2" data-location-field="slug">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.basic.slug')}</label>
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <TextInput
                                        placeholder={t('form.basic.slug_placeholder')}
                                        {...register('slug')}
                                        invalid={!!errors.slug}
                                        leftIcon={<Link className="w-4 h-4" />}
                                    />
                                    {errors.slug && <p className="text-xs text-red-500 font-medium mt-1">{errors.slug.message}</p>}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAutoSlug}
                                    className="h-[52px] rounded-xl border-slate-200 text-[#14b8a6] hover:bg-[#dff7f4] font-semibold shrink-0"
                                >
                                    {t('form.basic.slug_auto')}
                                </Button>
                            </div>
                        </div>

                        <Controller
                            name="category_id"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2" data-location-field="category_id">
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        {t('form.basic.category')} <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
                                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                                        value={categories.find(c => c.id === field.value) ? { value: field.value, label: categories.find(c => c.id === field.value)?.name } : null}
                                        onChange={(opt: Option | null) => field.onChange(opt?.value)}
                                        placeholder={t('form.basic.category_placeholder')}
                                        isLoading={categoriesLoading}
                                    />
                                    {errors.category_id && <p className="text-xs text-red-500 font-medium">{errors.category_id.message}</p>}
                                </div>
                            )}
                        />

                        <div className="md:col-span-2 space-y-2" data-location-field="short_description">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.basic.short_description')}</label>
                            <TextareaField
                                placeholder={t('form.basic.short_description_placeholder')}
                                {...register('short_description')}
                                invalid={!!errors.short_description}
                                rows={3}
                            />
                            {errors.short_description && <p className="text-xs text-red-500 font-medium">{errors.short_description.message}</p>}
                        </div>

                        <div className="md:col-span-2" data-location-field="description">
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <MarkdownEditor
                                        label={t('form.basic.description')}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder={t('form.basic.description_placeholder')}
                                        error={errors.description?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={Phone}
                        title={t('form.sections.contact')}
                        subtitle={t('form.section_descriptions.contact')}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2" data-location-field="address">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.address')}</label>
                            <TextInput
                                placeholder={t('form.contact.address_placeholder')}
                                {...register('address')}
                                invalid={!!errors.address}
                                leftIcon={<MapPin className="w-4 h-4" />}
                            />
                            {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
                        </div>

                        <Controller
                            name="district"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2" data-location-field="district">
                                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                                        {t('form.contact.district')} <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
                                        options={districts.map(d => ({ value: d, label: d }))}
                                        value={field.value ? { value: field.value, label: field.value } : null}
                                        onChange={(opt: Option | null) => field.onChange(opt?.value)}
                                        placeholder={t('form.contact.district_placeholder')}
                                    />
                                    {errors.district && <p className="text-xs text-red-500 font-medium">{errors.district.message}</p>}
                                </div>
                            )}
                        />

                        <div className="space-y-2" data-location-field="phone">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.phone')}</label>
                            <TextInput
                                placeholder={t('form.contact.phone_placeholder')}
                                {...register('phone')}
                                invalid={!!errors.phone}
                                leftIcon={<Smartphone className="w-4 h-4" />}
                            />
                            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2" data-location-field="email">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.email')}</label>
                            <TextInput
                                placeholder={t('form.contact.email_placeholder')}
                                {...register('email')}
                                invalid={!!errors.email}
                                leftIcon={<Mail className="w-4 h-4" />}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2" data-location-field="website">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.website')}</label>
                            <TextInput
                                placeholder={t('form.contact.website_placeholder')}
                                {...register('website')}
                                invalid={!!errors.website}
                                leftIcon={<Globe className="w-4 h-4" />}
                            />
                            {errors.website && <p className="text-xs text-red-500 font-medium">{errors.website.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Map Selection */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={MapIcon}
                        title={t('form.sections.map')}
                        subtitle={t('form.section_descriptions.map')}
                        required
                    />

                    <div data-location-field={errors.latitude ? 'latitude' : errors.longitude ? 'longitude' : 'map'}>
                        <Controller
                            name="latitude"
                            control={control}
                            render={({ field: latField }) => (
                                <Controller
                                    name="longitude"
                                    control={control}
                                    render={({ field: lngField }) => (
                                        <MapPicker
                                            lat={latField.value}
                                            lng={lngField.value}
                                            onChange={(lat, lng) => {
                                                latField.onChange(lat);
                                                lngField.onChange(lng);
                                            }}
                                            address={watchAllFields.address}
                                        />
                                    )}
                                />
                            )}
                        />
                    </div>
                    {(errors.latitude || errors.longitude) && (
                        <p className="text-xs text-red-500 font-medium mt-2">
                            {t('location:validation.required', { field: t('form.sections.map') })}
                        </p>
                    )}
                </div>

                {/* Pricing & Hours */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={DollarSign}
                        title={t('form.sections.pricing')}
                        subtitle={t('form.section_descriptions.pricing')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2" data-location-field="price_min">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.price_min')}</label>
                            <Controller
                                name="price_min"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <CurrencyInput
                                            value={field.value ?? null}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            invalid={!!errors.price_min}
                                            placeholder="0"
                                            className="h-[52px] pr-16 rounded-2xl"
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {t('form.pricing.currency_suffix')}
                                        </span>
                                    </div>
                                )}
                            />
                            {errors.price_min && <p className="text-xs text-red-500 font-medium">{errors.price_min.message}</p>}
                        </div>

                        <div className="space-y-2" data-location-field="price_max">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.price_max')}</label>
                            <Controller
                                name="price_max"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <CurrencyInput
                                            value={field.value ?? null}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            invalid={!!errors.price_max}
                                            placeholder="0"
                                            className="h-[52px] pr-16 rounded-2xl"
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {t('form.pricing.currency_suffix')}
                                        </span>
                                    </div>
                                )}
                            />
                            {errors.price_max && <p className="text-xs text-red-500 font-medium">{errors.price_max.message}</p>}
                        </div>

                        <Controller
                            name="price_level"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 block">
                                        {t('form.pricing.price_level')}
                                    </label>
                                    <CustomSelect
                                        options={priceLevelOptions}
                                        value={
                                            priceLevelOptions.find((opt) => opt.value === (field.value || 1)) ?? priceLevelOptions[0]
                                        }
                                        onChange={(opt: Option | null) => field.onChange(opt?.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.opening_hours')}</label>
                            <TextareaField
                                placeholder={t('form.pricing.opening_hours_placeholder')}
                                {...register('opening_hours')}
                                rows={3}
                                className="min-h-[92px] rounded-2xl"
                            />
                            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                {t('form.pricing.opening_hours_helper')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tag & Amenities */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={Tag}
                        title={t('form.sections.tags_amenities')}
                        subtitle={t('form.section_descriptions.tags_amenities')}
                    />

                    <div className="space-y-6">
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <TagSelector
                                    label={t('form.tags_amenities.tags')}
                                    options={tags}
                                    value={(field.value as number[]) || []}
                                    onChange={field.onChange}
                                    isLoading={tagsLoading}
                                />
                            )}
                        />

                        <Controller
                            name="amenities"
                            control={control}
                            render={({ field }) => (
                                <TagSelector
                                    label={t('form.tags_amenities.amenities')}
                                    options={amenities}
                                    value={(field.value as number[]) || []}
                                    onChange={field.onChange}
                                    isLoading={amenitiesLoading}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={Briefcase}
                        title={t('form.sections.media')}
                        subtitle={t('form.section_descriptions.media')}
                        required
                    />
                    <div data-location-field="thumbnail">
                        <ImageUploader
                            ref={imageUploaderRef}
                            setValue={setValue}
                            watch={watch}
                            thumbnailError={errors.thumbnail?.message}
                            videoUrlError={errors.video_url?.message}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar / Progress */}
            <div className="lg:w-80 space-y-6">
                {/* DEBUG: Show validation errors in dev mode if needed */}
                {Object.keys(errors).length > 0 && import.meta.env.DEV && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-[10px] font-mono text-red-600 overflow-auto max-h-40">
                        <pre>{JSON.stringify(debugErrors, null, 2)}</pre>
                    </div>
                )}
                <div className="sticky top-28 space-y-6">
                    {/* Completion Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Settings className="w-20 h-20 rotate-12" />
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#14b8a6]" />
                            {t('form.settings.completion')}
                        </h4>

                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-[#14b8a6]">{completionPercent}%</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {completedFields.length}/{requiredFields.length} Fields
                                </span>
                            </div>
                            <ProgressBar 
                                value={completedFields.length} 
                                max={requiredFields.length} 
                                color="blue" 
                                className="h-2.5 rounded-full bg-slate-100"
                            />

                            <div className="pt-2 space-y-2">
                                {requiredFields.map(field => {
                                    const isDone = isFieldComplete(field);
                                    return (
                                        <div key={field.key} className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-[#14b8a6]' : 'bg-slate-200'}`} />
                                            <span className={`text-[11px] font-medium ${isDone ? 'text-slate-500 line-through opacity-50' : 'text-slate-600'}`}>
                                                {field.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-5">{t('form.settings.status')}</h4>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">{t('form.settings.status')}</span>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <ToggleSwitch
                                            enabled={field.value === 'active'}
                                            onChange={(enabled: boolean) => field.onChange(enabled ? 'active' : 'inactive')}
                                        />
                                    )}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-600">{t('form.settings.is_featured')}</span>
                                        <div className="group relative">
                                            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {t('form.settings.featured_helper')}
                                            </div>
                                        </div>
                                    </div>
                                    <Controller
                                        name="is_featured"
                                        control={control}
                                        render={({ field }) => (
                                            <ToggleSwitch
                                                enabled={!!field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex flex-col gap-3">
                        <Button
                            form="location-form"
                            type="submit"
                            className="w-full rounded-2xl bg-[#14b8a6] hover:bg-[#0d9488] text-white h-14 font-bold shadow-lg shadow-[#14b8a6]/20"
                            isLoading={isSubmitting}
                        >
                            {isEdit ? t('form.actions.update_location') : t('form.actions.create_location')}
                        </Button>
                        {isEdit && onDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-red-500 font-semibold"
                                onClick={onDelete}
                            >
                                {t('actions.delete')}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-slate-500 font-semibold"
                            onClick={onCancel ?? (() => window.history.back())}
                        >
                            {t('actions.cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
        </>
    );
};

export default LocationForm;
