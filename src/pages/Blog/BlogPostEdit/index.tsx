import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Trash2, Copy, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import { appEnv } from '@/config/env';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import BlogPostForm, { type BlogEditPreviewState } from './components/BlogPostForm';
import { useAdminBlogPostQuery, useBlogMutations } from '@/hooks/useBlogQueries';
import { useAuth } from '@/store/useUserStore';
import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';
import { cn } from '@/utils';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../BlogPostList/components/DeleteConfirmDialog';
import DuplicateConfirmDialog from './components/DuplicateConfirmDialog';

const BlogPostEdit = () => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const isScrolled = useMainScrollCollapse();

    const isAdmin = user?.role === 'admin';
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewState, setPreviewState] = useState<BlogEditPreviewState>({
        canPreview: false,
        previewSlug: '',
    });

    const { data: blogPost, isLoading, isError } = useAdminBlogPostQuery(id);
    const { deleteMutation } = useBlogMutations();

    const previewDisabledTitle = t('actions.preview_disabled_helper');

    const handlePreview = () => {
        if (previewState.canPreview && previewState.previewSlug) {
            window.open(
                `${appEnv.publicWebUrl}/blog/${previewState.previewSlug}`,
                '_blank',
                'noopener,noreferrer'
            );
        }
    };

    const handleDuplicate = () => setIsDuplicateDialogOpen(true);

    const handleConfirmDuplicate = () => {
        if (!blogPost) return;
        setIsDuplicateDialogOpen(false);
        navigate(ROUTES.BLOG_POSTS_CREATE, { state: { duplicateData: blogPost } });
        toast.success(t('toast.duplicate_success'));
    };

    const handleDelete = () => {
        if (!id) return;
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success(t('toast.delete_success'));
                setIsDeleteDialogOpen(false);
                navigate(ROUTES.BLOG_POSTS);
            },
            onError: () => {
                toast.error(t('toast.network_error'));
                setIsDeleteDialogOpen(false);
            },
        });
    };

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t('error_post_not_found')}</h2>
                    <p className="text-slate-500 mb-8 text-sm">{t('error_post_not_found_desc')}</p>
                    <Button
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        className="w-full rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold"
                    >
                        {t('form.back_to_list')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-32 md:pb-20 font-sans">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
                <div
                    className={cn(
                        'w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 transition-all duration-300',
                        isScrolled ? 'py-2' : 'min-h-20 py-3'
                    )}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 shrink-0 cursor-pointer"
                            aria-label={t('form.back_to_list')}
                            onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div
                                className={cn(
                                    'transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-1'
                                )}
                            >
                                <Breadcrumbs
                                    icon={FileText}
                                    items={[
                                        { label: 'sidebar.posts', path: ROUTES.BLOG_POSTS },
                                        { label: 'breadcrumb.edit' },
                                    ]}
                                />
                            </div>
                            <h1
                                className={cn(
                                    'font-bold text-slate-900 tracking-tight leading-tight transition-all duration-300',
                                    isScrolled ? 'text-base' : 'text-xl'
                                )}
                            >
                                {t('edit_title')}
                            </h1>
                            {blogPost && (
                                <p
                                    className={cn(
                                        'text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] select-all transition-all duration-300',
                                        isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                    )}
                                >
                                    {blogPost.title}
                                </p>
                            )}
                        </div>
                    </div>

                    {!isLoading && blogPost && (
                        <div className="hidden md:flex shrink-0 items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate(ROUTES.BLOG_POSTS)}
                                disabled={isSubmitting}
                                className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11"
                            >
                                {t('actions.cancel')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={!previewState.canPreview}
                                title={!previewState.canPreview ? previewDisabledTitle : undefined}
                                className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('view_post')}
                            </Button>
                            <Button
                                form="blog-post-form"
                                type="submit"
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold px-6 h-11 shadow-lg shadow-[#14B8A6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                {t('actions.save_changes')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
                {isLoading ? (
                    <BlogPostFormSkeleton />
                ) : (
                    blogPost && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-grow min-w-0">
                                <BlogPostForm
                                    initialData={blogPost}
                                    onSubmittingChange={setIsSubmitting}
                                    onPreviewStateChange={setPreviewState}
                                    onCancel={() => navigate(ROUTES.BLOG_POSTS)}
                                    onSuccess={() =>
                                        navigate(ROUTES.BLOG_POSTS_DETAIL.replace(':id', String(blogPost.id)))
                                    }
                                />
                            </div>

                            <div className="lg:w-80 shrink-0 hidden lg:block">
                                <div className="sticky top-28">
                                    <QuickActionsCard
                                        t={t}
                                        isAdmin={isAdmin}
                                        canPreview={previewState.canPreview}
                                        previewDisabledTitle={previewDisabledTitle}
                                        onPreview={handlePreview}
                                        onDuplicate={handleDuplicate}
                                        onDelete={() => setIsDeleteDialogOpen(true)}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {!isLoading && blogPost && (
                <>
                    <div className="md:hidden fixed bottom-[4.25rem] left-0 right-0 z-30 px-4">
                        <QuickActionsCard
                            t={t}
                            isAdmin={isAdmin}
                            canPreview={previewState.canPreview}
                            previewDisabledTitle={previewDisabledTitle}
                            onPreview={handlePreview}
                            onDuplicate={handleDuplicate}
                            onDelete={() => setIsDeleteDialogOpen(true)}
                            compact
                        />
                    </div>

                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 flex gap-3 shadow-lg">
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => navigate(ROUTES.BLOG_POSTS)}
                            className="flex-1 rounded-xl border-slate-200 text-slate-500 font-bold h-12"
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            form="blog-post-form"
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            className="flex-[2] rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold h-12 shadow-lg shadow-[#14B8A6]/20"
                        >
                            {t('actions.save_changes')}
                        </Button>
                    </div>
                </>
            )}

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                postTitle={blogPost?.title || ''}
                isMutating={deleteMutation.isPending}
            />

            <DuplicateConfirmDialog
                isOpen={isDuplicateDialogOpen}
                onClose={() => setIsDuplicateDialogOpen(false)}
                onConfirm={handleConfirmDuplicate}
            />
        </div>
    );
};

interface QuickActionsCardProps {
    t: ReturnType<typeof useTranslation<'blog'>>['t'];
    isAdmin: boolean;
    canPreview: boolean;
    previewDisabledTitle: string;
    onPreview: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    compact?: boolean;
}

const QuickActionsCard = ({
    t,
    isAdmin,
    canPreview,
    previewDisabledTitle,
    onPreview,
    onDuplicate,
    onDelete,
    compact = false,
}: QuickActionsCardProps) => (
    <div
        className={cn(
            'bg-white rounded-3xl border border-slate-200/60 shadow-xs space-y-4',
            compact ? 'p-4' : 'p-6'
        )}
    >
        {!compact && (
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                {t('quick_actions')}
            </h4>
        )}

        <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-2.5')}>
            <button
                type="button"
                onClick={onPreview}
                disabled={!canPreview}
                title={!canPreview ? previewDisabledTitle : undefined}
                className="w-full py-3 px-4 border border-slate-200 hover:border-[#0066CC] hover:text-[#0066CC] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50/50"
            >
                <ExternalLink className="w-4 h-4" />
                {t('view_post')}
            </button>

            <button
                type="button"
                onClick={onDuplicate}
                className="w-full py-3 px-4 border border-slate-200 hover:border-[#0066CC] hover:text-[#0066CC] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
                <Copy className="w-4 h-4" />
                {t('duplicate_post')}
            </button>

            {isAdmin ? (
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-full py-3 px-4 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                    <Trash2 className="w-4 h-4" />
                    {t('delete_post')}
                </button>
            ) : (
                <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 border border-slate-100 bg-slate-50 text-slate-350 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                    title={t('actions.delete_forbidden')}
                >
                    <Trash2 className="w-4 h-4" />
                    {t('delete_post')}
                </button>
            )}
        </div>
    </div>
);

const BlogPostFormSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
        <div className="flex-grow space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
                <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
                <div className="h-20 bg-slate-200 rounded-2xl w-full" />
                <div className="h-[400px] bg-slate-200 rounded-2xl w-full" />
            </div>
        </div>
        <div className="lg:w-80 shrink-0 hidden lg:block">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs h-48" />
        </div>
    </div>
);

export default BlogPostEdit;
