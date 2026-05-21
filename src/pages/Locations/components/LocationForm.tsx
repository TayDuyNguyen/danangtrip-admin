import { useForm, Controller, useWatch } from 'react-hook-form';
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
import ImageUploader from './ImageUploader';
import TagSelector from './TagSelector';
import { slugifyVietnamese } from '@/utils/slug';

interface LocationFormProps {
    isEdit?: boolean;
    initialData?: CreateLocationInput & { id: number };
}

const LocationForm = ({ isEdit = false, initialData }: LocationFormProps) => {
    const { t } = useTranslation('location');
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
        formState: { errors }
    } = useForm<CreateLocationInput>({
        resolver: yupResolver(createLocationSchema(t)),
        defaultValues: initialData || {
            status: 'active',
            is_featured: false,
            tags: [],
            amenities: [],
            images: [],
            price_level: 1
        }
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const onSubmit = (data: CreateLocationInput) => {
        if (isEdit && initialData?.id) {
            updateMutation.mutate({ id: initialData.id, data });
        } else {
            createMutation.mutate(data as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    };

    const watchName = useWatch({ control, name: 'name' });
    const watchAllFields = useWatch({ control });

    const handleAutoSlug = () => {
        if (watchName) {
            setValue('slug', slugifyVietnamese(watchName), { shouldValidate: true, shouldDirty: true });
        }
    };

    // Calculate form completion
    const requiredFields = [
        { key: 'name', label: t('form.basic.name') },
        { key: 'category_id', label: t('form.basic.category') },
        { key: 'district', label: t('form.contact.district') },
        { key: 'address', label: t('form.contact.address') },
        { key: 'description', label: t('form.basic.description') },
        { key: 'thumbnail', label: t('form.media.thumbnail') },
    ];
    const completedFields = requiredFields.filter(f => !!watchAllFields[f.key as keyof typeof watchAllFields]);
    const completionPercent = Math.round((completedFields.length / requiredFields.length) * 100);

    return (
        <form
            id="location-form"
            onSubmit={handleSubmit(onSubmit)}
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
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.basic.name')}</label>
                            <TextInput
                                placeholder={t('form.basic.name_placeholder')}
                                {...register('name')}
                                invalid={!!errors.name}
                                leftIcon={<Type className="w-4 h-4" />}
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        <div className="md:col-span-2 space-y-2">
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
                                <div className="space-y-2">
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

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.basic.short_description')}</label>
                            <TextareaField
                                placeholder={t('form.basic.short_description_placeholder')}
                                {...register('short_description')}
                                invalid={!!errors.short_description}
                                rows={3}
                            />
                            {errors.short_description && <p className="text-xs text-red-500 font-medium">{errors.short_description.message}</p>}
                        </div>

                        <div className="md:col-span-2">
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
                        <div className="md:col-span-2 space-y-2">
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
                                <div className="space-y-2">
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.phone')}</label>
                            <TextInput
                                placeholder={t('form.contact.phone_placeholder')}
                                {...register('phone')}
                                invalid={!!errors.phone}
                                leftIcon={<Smartphone className="w-4 h-4" />}
                            />
                            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.contact.email')}</label>
                            <TextInput
                                placeholder={t('form.contact.email_placeholder')}
                                {...register('email')}
                                invalid={!!errors.email}
                                leftIcon={<Mail className="w-4 h-4" />}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.price_min')}</label>
                            <TextInput
                                type="number"
                                {...register('price_min')}
                                invalid={!!errors.price_min}
                                leftIcon={<DollarSign className="w-4 h-4" />}
                            />
                            {errors.price_min && <p className="text-xs text-red-500 font-medium">{errors.price_min.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.price_max')}</label>
                            <TextInput
                                type="number"
                                {...register('price_max')}
                                invalid={!!errors.price_max}
                                leftIcon={<DollarSign className="w-4 h-4" />}
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
                                        options={[
                                            { value: 1, label: '$ (Free/Cheap)' },
                                            { value: 2, label: '$$ (Affordable)' },
                                            { value: 3, label: '$$$ (Expensive)' },
                                            { value: 4, label: '$$$$ (Very Expensive)' },
                                        ]}
                                        value={{ value: field.value || 1, label: `${'$'.repeat(field.value || 1)}` }}
                                        onChange={(opt: Option | null) => field.onChange(opt?.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block">{t('form.pricing.opening_hours')}</label>
                            <TextInput
                                placeholder={t('form.pricing.opening_hours_placeholder')}
                                {...register('opening_hours')}
                                leftIcon={<Clock className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </div>

                {/* Tag & Amenities */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                    <SectionHeader
                        icon={Tag}
                        title="Tags & Amenities"
                        subtitle="Mở rộng thông tin cho địa điểm"
                    />

                    <div className="space-y-6">
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <TagSelector
                                    label="Tags"
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
                                    label="Tiện ích (Amenities)"
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
                    <ImageUploader setValue={setValue} watch={watch} />
                    {errors.thumbnail && <p className="text-xs text-red-500 font-bold mt-2">{errors.thumbnail.message}</p>}
                </div>
            </div>

            {/* Right Column: Sidebar / Progress */}
            <div className="lg:w-80 space-y-6">
                {/* DEBUG: Show validation errors in dev mode if needed */}
                {Object.keys(errors).length > 0 && import.meta.env.DEV && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-[10px] font-mono text-red-600 overflow-auto max-h-40">
                        <pre>{JSON.stringify({
                            ...errors,
                            opening_hours: typeof watchAllFields.opening_hours === 'string' ? watchAllFields.opening_hours : (watchAllFields.opening_hours ? '' : null)
                        }, null, 2)}</pre>
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
                                    const isDone = !!watchAllFields[field.key as keyof typeof watchAllFields];
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
                            isLoading={isEdit ? updateMutation.isPending : createMutation.isPending}
                        >
                            {isEdit ? t('form.actions.update_location') : t('form.actions.create_location')}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 font-semibold"
                            onClick={() => window.history.back()}
                        >
                            {t('actions.cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default LocationForm;
