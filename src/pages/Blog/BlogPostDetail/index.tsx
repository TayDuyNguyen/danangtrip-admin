import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Edit, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/routes/routes';
import { useAuth } from '@/store/useUserStore';
import { useAdminBlogPostQuery, useBlogMutations } from '@/hooks/useBlogQueries';
import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';
import { Button } from '@/components/ui/Button';
import { canPreviewBlogPost, isBlogPostScheduled } from '@/utils/blogPostStatus';
import { appEnv } from '@/config/env';

import { BlogPostDetailHeader } from './components/BlogPostDetailHeader';
import { BlogPostDetailContent } from './components/BlogPostDetailContent';
import { BlogPostDetailSidebar } from './components/BlogPostDetailSidebar';
import DeleteConfirmDialog from '../BlogPostList/components/DeleteConfirmDialog';
import DuplicateConfirmDialog from '../BlogPostEdit/components/DuplicateConfirmDialog';

const BlogPostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation('blog');
    const { user } = useAuth();
    const isScrolled = useMainScrollCollapse();

    const isAdmin = user?.role === 'admin';
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

    const { data: blogPost, isLoading, isError, refetch } = useAdminBlogPostQuery(id);
    const { deleteMutation, updateStatusMutation } = useBlogMutations();

    const isMutating = isLoading || updateStatusMutation.isPending || deleteMutation.isPending;

    const handleStatusChange = (newStatus: 'draft' | 'published' | 'archived') => {
        if (!id || !blogPost || newStatus === blogPost.status) return;
        updateStatusMutation.mutate(
            { id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(t('toast.status_success'));
                    refetch();
                },
                onError: () => {
                    toast.error(t('toast.network_error'));
                },
            }
        );
    };

    const handleConfirmDuplicate = () => {
        if (!blogPost) return;
        setIsDuplicateDialogOpen(false);
        navigate(ROUTES.BLOG_POSTS_CREATE, { state: { duplicateData: blogPost } });
        toast.success(t('toast.duplicate_success'));
    };

    const handleDeleteSubmit = () => {
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

    const handlePreview = () => {
        if (blogPost?.slug && canPreviewBlogPost(blogPost)) {
            window.open(`${appEnv.publicWebUrl}/blog/${blogPost.slug}`, '_blank', 'noopener,noreferrer');
        }
    };

    const previewDisabledTitle =
        blogPost && !canPreviewBlogPost(blogPost)
            ? isBlogPostScheduled(blogPost.publishedAt, blogPost.status)
                ? t('actions.preview_scheduled_helper')
                : t('actions.preview_disabled_helper')
            : undefined;

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-sans select-none">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t('error_post_not_found')}</h2>
                    <p className="text-slate-500 mb-8 text-sm">{t('error_post_not_found_desc')}</p>
                    <Button
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        className="w-full rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold h-11"
                    >
                        {t('form.back_to_list')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-28 md:pb-20 font-sans">
            <BlogPostDetailHeader
                post={blogPost}
                onStatusChange={handleStatusChange}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
                isMutating={isMutating}
                isAdmin={isAdmin}
                isScrolled={isScrolled}
            />

            {isLoading ? (
                <BlogPostDetailSkeleton />
            ) : (
                blogPost && (
                    <>
                        <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="flex-grow w-full min-w-0 lg:max-w-[calc(100%-352px)]">
                                    <BlogPostDetailContent post={blogPost} />
                                </div>

                                <div className="lg:w-80 shrink-0 w-full lg:sticky lg:top-24">
                                    <BlogPostDetailSidebar
                                        post={blogPost}
                                        onDeleteClick={() => setIsDeleteDialogOpen(true)}
                                        onDuplicateClick={() => setIsDuplicateDialogOpen(true)}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 flex gap-2 shadow-lg">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handlePreview}
                                disabled={!canPreviewBlogPost(blogPost)}
                                title={previewDisabledTitle}
                                className="flex-1 rounded-xl border-slate-200 text-slate-500 font-bold h-12 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs px-2"
                            >
                                <ExternalLink className="w-4 h-4 shrink-0" />
                                <span className="truncate">{t('view_post')}</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(blogPost.id)))}
                                disabled={isMutating}
                                className="flex-1 rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold h-12 flex items-center justify-center gap-1.5 text-xs px-2"
                            >
                                <Edit className="w-4 h-4 shrink-0" />
                                <span className="truncate">{t('actions.edit')}</span>
                            </Button>
                            {isAdmin && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={isMutating}
                                    className="flex-1 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 font-bold h-12 flex items-center justify-center gap-1.5 text-xs px-2"
                                >
                                    <Trash2 className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{t('actions.delete')}</span>
                                </Button>
                            )}
                        </div>

                        <DeleteConfirmDialog
                            isOpen={isDeleteDialogOpen}
                            onClose={() => setIsDeleteDialogOpen(false)}
                            onConfirm={handleDeleteSubmit}
                            postTitle={blogPost.title}
                            isMutating={deleteMutation.isPending}
                        />

                        <DuplicateConfirmDialog
                            isOpen={isDuplicateDialogOpen}
                            onClose={() => setIsDuplicateDialogOpen(false)}
                            onConfirm={handleConfirmDuplicate}
                        />
                    </>
                )
            )}
        </div>
    );
};

const BlogPostDetailSkeleton = () => (
    <div className="animate-pulse space-y-8 select-none">
        <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow space-y-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
                        <div className="w-full h-[320px] bg-slate-200 rounded-[24px]" />
                        <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                        <div className="h-10 bg-slate-200 rounded-xl w-full" />
                        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
                        <div className="space-y-3 pt-6 border-t border-slate-100">
                            <div className="h-4 bg-slate-200 rounded w-1/5" />
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-4/5" />
                        </div>
                    </div>
                </div>

                <div className="lg:w-80 shrink-0 w-full space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="space-y-3">
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-4/5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default BlogPostDetail;
