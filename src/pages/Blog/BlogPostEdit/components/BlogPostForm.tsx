import { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import {
    BookOpen,
    Link as LinkIcon,
    Settings,
    Layers,
    Image as ImageIcon,
    Plus,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';
import SectionHeader from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/Button';
import { createBlogPostSchema } from '@/validations/blog.schema';
import type { CreateBlogPostInput } from '@/validations/blog.schema';
import {
    useBlogCategoriesQuery,
    useUpdateBlogPostMutation,
    useCreateBlogCategoryMutation
} from '@/hooks/useBlogQueries';
import { slugifyVietnamese } from '@/utils/slug';
import BlogMarkdownEditor from '@/pages/Blog/BlogPostCreate/components/BlogMarkdownEditor';
import FeaturedImageUploader from './FeaturedImageUploader';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import type { BlogPostViewModel } from '@/types';

interface BlogPostFormProps {
    initialData: BlogPostViewModel;
    onSubmittingChange?: (submitting: boolean) => void;
}

const BlogPostForm = ({ initialData, onSubmittingChange }: BlogPostFormProps) => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();

    // 1. Data queries & mutations
    const { data: categories = [], isLoading: categoriesLoading } = useBlogCategoriesQuery();
    const updatePostMutation = useUpdateBlogPostMutation();
    const createCategoryMutation = useCreateBlogCategoryMutation();

    // 2. State for inline category creation
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // 3. Setup initial publish state from initialData
    const getInitialPublishOption = () => {
        if (initialData.status === 'draft') return 'draft';
        if (initialData.status === 'archived') return 'archived';
        if (initialData.publishedAt) {
            const isFuture = initialData.publishedAt.getTime() > Date.now();
            return isFuture ? 'scheduled' : 'published';
        }
        return 'published';
    };

    const getInitialScheduleDate = () => {
        if (initialData.publishedAt) {
            const pad = (n: number) => String(n).padStart(2, '0');
            const d = initialData.publishedAt;
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        }
        return '';
    };

    const getInitialScheduleTime = () => {
        if (initialData.publishedAt) {
            const pad = (n: number) => String(n).padStart(2, '0');
            const d = initialData.publishedAt;
            return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
        return '09:00';
    };

    const [publishOption, setPublishOption] = useState<'draft' | 'published' | 'scheduled' | 'archived'>(getInitialPublishOption);
    const [scheduleDate, setScheduleDate] = useState(getInitialScheduleDate);
    const [scheduleTime, setScheduleTime] = useState(getInitialScheduleTime);
    const [bypassGuard, setBypassGuard] = useState(false);

    // 4. Form setup
    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<CreateBlogPostInput>({
        resolver: yupResolver(createBlogPostSchema(t)),
        defaultValues: {
            title: initialData.title,
            content: initialData.content,
            excerpt: initialData.excerpt,
            featured_image: initialData.featuredImage,
            category_ids: initialData.categories.map(c => c.id),
            status: initialData.status,
            published_at: initialData.publishedAt ? initialData.publishedAt.toISOString() : ''
        }
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const watchTitle = useWatch({ control, name: 'title' });
    const watchExcerpt = useWatch({ control, name: 'excerpt' }) || '';
    const watchCategoryIds = useWatch({ control, name: 'category_ids' }) || [];

    // Auto set slug when title changes
    const slugVal = slugifyVietnamese(watchTitle);
    const showSlugWarning = slugVal && slugVal !== initialData.slug;

    // Sync isSubmitting with parent
    const isPendingSubmitting = updatePostMutation.isPending || isSubmitting;
    useEffect(() => {
        onSubmittingChange?.(isPendingSubmitting);
    }, [isPendingSubmitting, onSubmittingChange]);

    // Format Dates for Info Section
    const formatDateTime = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // Handle submit
    const onSubmit = async (data: CreateBlogPostInput) => {
        // Construct published_at payload based on status and selection
        let publishedAtValue = null;
        let finalStatus = data.status || 'draft';

        if (publishOption === 'scheduled' && scheduleDate) {
            finalStatus = 'published';
            publishedAtValue = `${scheduleDate} ${scheduleTime}:00`;
        } else if (publishOption === 'published') {
            finalStatus = 'published';
        } else if (publishOption === 'archived') {
            finalStatus = 'archived';
        } else {
            finalStatus = 'draft';
        }

        try {
            await updatePostMutation.mutateAsync({
                id: initialData.id,
                payload: {
                    title: data.title,
                    content: data.content,
                    excerpt: data.excerpt || null,
                    featured_image: data.featured_image || null,
                    category_ids: data.category_ids,
                    status: finalStatus as 'draft' | 'published',
                    published_at: publishedAtValue
                }
            });
            // Reset react-hook-form to match new values and clear dirty flag
            reset(data);
            setBypassGuard(true);
            setTimeout(() => {
                navigate(ROUTES.BLOG_POSTS);
            }, 0);
        } catch {
            // Error handled by mutation toast
        }
    };

    // Category selection toggle
    const handleCategoryToggle = (id: number, checked: boolean) => {
        const currentIds = [...watchCategoryIds];
        if (checked) {
            if (!currentIds.includes(id)) {
                setValue('category_ids', [...currentIds, id], { shouldValidate: true, shouldDirty: true });
            }
        } else {
            setValue('category_ids', currentIds.filter(x => x !== id), { shouldValidate: true, shouldDirty: true });
        }
    };

    // Inline category submit
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const res = await createCategoryMutation.mutateAsync({
                name: newCategoryName.trim(),
                slug: slugifyVietnamese(newCategoryName)
            });
            if (res.data?.id) {
                // Select newly created category automatically
                setValue('category_ids', [...watchCategoryIds, res.data.id], { shouldValidate: true, shouldDirty: true });
            }
            setNewCategoryName('');
            setShowNewCategoryForm(false);
        } catch {
            // Handled by category mutation
        }
    };

    return (
        <form
            id="blog-post-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col lg:flex-row gap-8"
        >
            <UnsavedChangesGuard isDirty={isDirty && !bypassGuard} />

            {/* Hidden buttons for header actions */}
            <button
                id="blog-form-submit-draft"
                type="submit"
                className="hidden"
                onClick={() => {
                    setValue('status', 'draft');
                    setPublishOption('draft');
                }}
            />
            <button
                id="blog-form-submit-publish"
                type="submit"
                className="hidden"
                onClick={() => {
                    if (publishOption === 'draft') {
                        setPublishOption('published');
                        setValue('status', 'published');
                    }
                }}
            />

            {/* Left Column: Form Fields */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
                    <SectionHeader
                        icon={BookOpen}
                        title={t('form.sections.content')}
                        subtitle={t('edit_subtitle')}
                        required
                    />

                    <div className="space-y-6 mt-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <TextInput
                                placeholder={t('form.title_placeholder')}
                                {...register('title')}
                                invalid={!!errors.title}
                                className="text-xl font-bold border-none border-b border-slate-200/60 focus:border-b-2 focus:border-[#14B8A6] rounded-none px-0 py-3 shadow-none focus:ring-0 focus-within:ring-0 placeholder-slate-300"
                            />
                            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                                <span>{(errors.title?.message) && <span className="text-red-500 font-medium">{errors.title.message}</span>}</span>
                                <span>{watchTitle?.length || 0}/255</span>
                            </div>
                        </div>

                        {/* Slug Link Preview */}
                        <div>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 text-xs">
                                <span className="font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider shrink-0 select-none">
                                    <LinkIcon size={12} className="text-slate-400" />
                                    {t('form.slug')}:
                                </span>
                                <span className="text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                    danangtrip.vn/blog/
                                    <span className="font-semibold text-slate-700">{slugVal || t('form.slug_placeholder')}</span>
                                </span>
                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[#14B8A6]/10 text-[#0f766e] px-2 py-0.5 rounded-md select-none shrink-0">
                                    {t('form.slug_auto')}
                                </span>
                            </div>
                            
                            {/* Slug Warning Box */}
                            {showSlugWarning && (
                                <div className="flex gap-2 bg-[#FEF3C7] border border-[rgba(245,158,11,0.3)] rounded-xl p-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-[#92400E] font-semibold leading-normal">
                                        {t('form.slug_warning')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Excerpt Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">
                                {t('form.excerpt')}
                            </label>
                            <TextareaField
                                placeholder={t('form.excerpt_placeholder')}
                                {...register('excerpt')}
                                invalid={!!errors.excerpt}
                                rows={3}
                                className="rounded-2xl border-slate-200 text-sm leading-relaxed"
                            />
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>{(errors.excerpt?.message) && <span className="text-red-500 font-medium">{errors.excerpt.message}</span>}</span>
                                <span>{watchExcerpt.length}/500</span>
                            </div>
                        </div>

                        {/* Content Markdown Editor */}
                        <div className="pt-2">
                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <BlogMarkdownEditor
                                        label={t('form.content')}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder={t('form.content_placeholder')}
                                        error={errors.content?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:w-80 space-y-6 shrink-0">
                <div className="sticky top-28 space-y-6">
                    {/* Card 1: Publish Settings */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Settings className="w-4 h-4 text-[#14B8A6]" />
                            {t('form.sections.publish')}
                        </h4>

                        <div className="space-y-5">
                            {/* Status options radio group */}
                            <div className="flex flex-col gap-3.5">
                                {/* Option Draft */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="publish_option"
                                        checked={publishOption === 'draft'}
                                        onChange={() => {
                                            setPublishOption('draft');
                                            setValue('status', 'draft');
                                        }}
                                        className="mt-1 w-4 h-4 text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md inline-block mb-1">
                                            {t('form.publish.draft')}
                                        </span>
                                        <p className="text-[10px] text-slate-400">{t('form.publish.draft_helper')}</p>
                                    </div>
                                </label>

                                {/* Option Published */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="publish_option"
                                        checked={publishOption === 'published'}
                                        onChange={() => {
                                            setPublishOption('published');
                                            setValue('status', 'published');
                                        }}
                                        className="mt-1 w-4 h-4 text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                                            {t('form.publish.published')}
                                        </span>
                                        <p className="text-[10px] text-slate-400">{t('form.publish.published_helper')}</p>
                                    </div>
                                </label>

                                {/* Option Scheduled */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="publish_option"
                                        checked={publishOption === 'scheduled'}
                                        onChange={() => {
                                            setPublishOption('scheduled');
                                            setValue('status', 'published');
                                        }}
                                        className="mt-1 w-4 h-4 text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-[#0066CC] bg-[#EFF6FF] border border-[#B3D9FF] px-2 py-0.5 rounded-md inline-block mb-1">
                                            {t('form.publish.scheduled')}
                                        </span>
                                        <p className="text-[10px] text-slate-400">{t('form.publish.scheduled_helper')}</p>
                                    </div>
                                </label>

                                {/* Option Archived */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="publish_option"
                                        checked={publishOption === 'archived'}
                                        onChange={() => {
                                            setPublishOption('archived');
                                            setValue('status', 'archived');
                                        }}
                                        className="mt-1 w-4 h-4 text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md inline-block mb-1">
                                            {t('form.publish.archived', { defaultValue: 'Lưu trữ' })}
                                        </span>
                                        <p className="text-[10px] text-slate-400">{t('form.publish.archived_helper', { defaultValue: 'Ẩn bài viết và đưa vào lưu trữ' })}</p>
                                    </div>
                                </label>
                            </div>

                            {/* Scheduled Inputs */}
                            {publishOption === 'scheduled' && (
                                <div className="space-y-2.5 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        {t('form.publish.date')}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] outline-none"
                                        />
                                        <input
                                            type="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            required
                                            className="w-[85px] text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Info Block for Edit */}
                            <div className="border-t border-slate-100 pt-4 mt-2">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {t('info_section', { defaultValue: 'THÔNG TIN' })}
                                </h5>
                                <div className="space-y-2 text-xs font-semibold text-slate-600">
                                    <div className="flex justify-between">
                                        <span>{t('info_created')}:</span>
                                        <span className="text-slate-500">{formatDateTime(initialData.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('info_updated')}:</span>
                                        <span className="text-slate-500">{formatDateTime(initialData.updatedAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('info_author')}:</span>
                                        <span className="text-slate-500">{initialData.author?.fullName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('info_views')}:</span>
                                        <span className="text-[#0066CC]">{t('info_views_val', { count: initialData.viewCount.toLocaleString() })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form submit actions */}
                            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    onClick={() => setValue('status', publishOption === 'draft' ? 'draft' : 'published')}
                                    className="w-full rounded-2xl h-12 font-bold bg-[#14B8A6] hover:bg-[#0f766e] shadow-lg shadow-[#14B8A6]/20 text-white transition-all"
                                    isLoading={updatePostMutation.isPending || isSubmitting}
                                >
                                    {t('actions.save_changes', { defaultValue: 'Lưu thay đổi' })}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={updatePostMutation.isPending || isSubmitting}
                                    onClick={() => navigate('/admin/blog-posts')}
                                    className="w-full rounded-2xl h-12 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold"
                                >
                                    {t('actions.cancel')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Categories */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Layers className="w-4 h-4 text-[#14B8A6]" />
                            {t('form.sections.categories')}
                        </h4>

                        <div className="space-y-4">
                            {/* Checkbox List */}
                            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                                {categoriesLoading ? (
                                    <div className="flex items-center gap-2 text-slate-400 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-xs font-semibold">Loading...</span>
                                    </div>
                               ) : categories.length === 0 ? (
                                    <div className="text-xs text-slate-400 py-2 font-medium">No categories found</div>
                                ) : (
                                    categories.map((cat) => {
                                        const isChecked = watchCategoryIds.includes(cat.id);
                                        return (
                                            <label
                                                key={cat.id}
                                                className="flex items-center gap-2.5 cursor-pointer select-none group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => handleCategoryToggle(cat.id, e.target.checked)}
                                                    className="w-4.5 h-4.5 text-[#14B8A6] border-slate-300 rounded-sm focus:ring-[#14B8A6]"
                                                />
                                                <span
                                                    className={`text-xs transition-colors duration-200 ${
                                                        isChecked
                                                            ? 'text-[#0f766e] font-bold'
                                                            : 'text-slate-600 font-semibold group-hover:text-slate-900'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                            {errors.category_ids && (
                                <p className="text-xs text-red-500 font-medium">
                                    {errors.category_ids.message}
                                </p>
                            )}

                            {/* Inline Mini Add Category Form */}
                            <div className="pt-3 border-t border-slate-100">
                                {showNewCategoryForm ? (
                                    <div className="space-y-2 animate-in fade-in duration-200">
                                        <input
                                            type="text"
                                            placeholder={t('form.categories.input_placeholder')}
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] outline-none font-semibold text-slate-800"
                                            autoFocus
                                            disabled={createCategoryMutation.isPending}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowNewCategoryForm(false);
                                                    setNewCategoryName('');
                                                }}
                                                className="text-[10px] font-bold text-slate-500 rounded-lg py-1 px-2.5 h-7"
                                                disabled={createCategoryMutation.isPending}
                                            >
                                                {t('actions.cancel')}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleAddCategory}
                                                className="text-[10px] font-bold bg-[#14B8A6] hover:bg-[#0f766e] text-white rounded-lg py-1 px-3.5 h-7"
                                                isLoading={createCategoryMutation.isPending}
                                            >
                                                {t('form.categories.add_btn')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryForm(true)}
                                        className="w-full py-2 border border-dashed border-[#14B8A6]/50 bg-[#14B8A6]/5 hover:bg-[#14B8A6]/10 text-[#0f766e] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                    >
                                        <Plus size={14} />
                                        {t('form.categories.add_new')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Featured Image */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <ImageIcon className="w-4 h-4 text-[#14B8A6]" />
                            {t('form.sections.featured_image')}
                        </h4>

                        <Controller
                            name="featured_image"
                            control={control}
                            render={({ field }) => (
                                <FeaturedImageUploader
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default BlogPostForm;
