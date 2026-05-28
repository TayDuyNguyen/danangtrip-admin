import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/routes/routes';
import { useAuth } from '@/store/useUserStore';
import { useAdminBlogPostQuery, useBlogMutations } from '@/hooks/useBlogQueries';
import { Button } from '@/components/ui/Button';

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

    const isAdmin = user?.role === 'admin';
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

    // Queries
    const { data: blogPost, isLoading, isError, refetch } = useAdminBlogPostQuery(id);
    const { deleteMutation, updateStatusMutation } = useBlogMutations();

    // Handlers
    const handleStatusChange = (newStatus: 'draft' | 'published' | 'archived') => {
        if (!id) return;
        updateStatusMutation.mutate(
            { id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(t('toast.status_success', { defaultValue: 'Cập nhật trạng thái bài viết thành công!' }));
                    refetch();
                },
                onError: () => {
                    toast.error(t('toast.network_error'));
                }
            }
        );
    };

    const handleConfirmDuplicate = () => {
        if (!blogPost) return;
        setIsDuplicateDialogOpen(false);
        // Redirect to create page with current data in location state
        navigate('/admin/blog-posts/create', { state: { duplicateData: blogPost } });
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
            }
        });
    };

    // Error State
    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-sans select-none">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {t('error_post_not_found', { defaultValue: 'Không tìm thấy bài viết' })}
                    </h2>
                    <p className="text-slate-500 mb-8 text-sm">
                        {t('error_post_not_found_desc', { defaultValue: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.' })}
                    </p>
                    <Button
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        className="w-full rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold h-11"
                    >
                        {t('actions.cancel')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Sticky Header */}
            <BlogPostDetailHeader
                post={blogPost}
                onStatusChange={handleStatusChange}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
                isMutating={isLoading || updateStatusMutation.isPending || deleteMutation.isPending}
                isAdmin={isAdmin}
            />

            {isLoading ? (
                <BlogPostDetailSkeleton />
            ) : (
                blogPost && (
                    <>
                        {/* Layout grid */}
                        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Column: Content preview */}
                                <div className="flex-grow w-full lg:max-w-[calc(100%-352px)]">
                                    <BlogPostDetailContent post={blogPost} />
                                </div>

                                {/* Right Column: Sidebar metadata & actions */}
                                <div className="lg:w-80 shrink-0 w-full lg:sticky lg:top-24">
                                    <BlogPostDetailSidebar
                                        post={blogPost}
                                        onStatusChange={handleStatusChange}
                                        onDeleteClick={() => setIsDeleteDialogOpen(true)}
                                        onDuplicateClick={() => setIsDuplicateDialogOpen(true)}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Confirmations modals */}
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

// High-fidelity above-the-fold loader skeleton
const BlogPostDetailSkeleton = () => (
    <div className="animate-pulse space-y-8 select-none">
        {/* Content Skeleton Grid */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Content Skeleton */}
                <div className="flex-grow space-y-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
                        {/* Cover Image Skeleton */}
                        <div className="w-full h-[320px] bg-slate-200 rounded-[24px]" />
                        {/* Title skeleton */}
                        <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                        {/* Details skeleton */}
                        <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                        <div className="h-10 bg-slate-200 rounded-xl w-full" />
                        {/* Excerpt skeleton */}
                        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
                        {/* Content text lines */}
                        <div className="space-y-3 pt-6 border-t border-slate-100">
                            <div className="h-4 bg-slate-200 rounded w-1/5" />
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-4/5" />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Skeleton */}
                <div className="lg:w-80 shrink-0 w-full space-y-6">
                    {/* Actions Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="space-y-3">
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                        </div>
                    </div>

                    {/* Metadata Card */}
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
