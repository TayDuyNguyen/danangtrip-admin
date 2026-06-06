import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Trash2, Copy, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import BlogPostForm from './components/BlogPostForm';
import { useAdminBlogPostQuery, useBlogMutations } from '@/hooks/useBlogQueries';
import { useAuth } from '@/store/useUserStore';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../BlogPostList/components/DeleteConfirmDialog';
import DuplicateConfirmDialog from './components/DuplicateConfirmDialog';

const BlogPostEdit = () => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    
    const isAdmin = user?.role === 'admin';
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch post details
    const { data: blogPost, isLoading, isError } = useAdminBlogPostQuery(id);
    const { deleteMutation } = useBlogMutations();

    const handleSave = () => {
        (document.getElementById('blog-post-form') as HTMLFormElement | null)?.requestSubmit();
    };

    const handlePreview = () => {
        if (blogPost?.slug) {
            window.open(`http://localhost:3000/blog/${blogPost.slug}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDuplicate = () => {
        setIsDuplicateDialogOpen(true);
    };

    const handleConfirmDuplicate = () => {
        if (!blogPost) return;
        setIsDuplicateDialogOpen(false);
        // Redirect to create page with current data in location state
        navigate('/admin/blog-posts/create', { state: { duplicateData: blogPost } });
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
            }
        });
    };

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {t('error_post_not_found', { defaultValue: 'Không tìm thấy bài viết' })}
                    </h2>
                    <p className="text-slate-500 mb-8 text-sm">
                        {t('error_post_not_found_desc', { defaultValue: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.' })}
                    </p>
                    <Button 
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        className="w-full rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white"
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
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    {/* Header Left: Breadcrumb + Title */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer"
                            onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div>
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={FileText}
                                    items={[
                                        { label: 'sidebar.posts', path: ROUTES.BLOG_POSTS },
                                        { label: 'breadcrumb.edit' }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t('edit_title', { defaultValue: 'Chỉnh sửa Bài viết' })}
                            </h1>
                            {blogPost && (
                                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] mt-1 select-all">
                                    {blogPost.title}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Header Right: Buttons */}
                    {!isLoading && blogPost && (
                        <div className="hidden md:flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate(ROUTES.BLOG_POSTS)}
                                className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11"
                            >
                                {t('actions.cancel')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={blogPost.status !== 'published'}
                                title={blogPost.status !== 'published' ? t('actions.preview_disabled_helper', { defaultValue: 'Chỉ có thể xem bài viết đã xuất bản' }) : ''}
                                className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-350"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t('view_post', { defaultValue: 'Xem bài viết' })}
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold px-6 h-11 shadow-lg shadow-[#14B8A6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('actions.save_changes', { defaultValue: 'Lưu thay đổi' })}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form Content */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {isLoading ? (
                    <BlogPostFormSkeleton />
                ) : (
                    blogPost && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Main Form Body */}
                            <div className="flex-grow">
                                <BlogPostForm initialData={blogPost} onSubmittingChange={setIsSubmitting} />
                            </div>

                            {/* Sidebar Quick Actions Card */}
                            <div className="lg:w-80 shrink-0">
                                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                                        {t('quick_actions', { defaultValue: 'Thao tác nhanh' })}
                                    </h4>
                                    
                                    <div className="flex flex-col gap-2.5">
                                        <button
                                            type="button"
                                            onClick={handlePreview}
                                            disabled={blogPost.status !== 'published'}
                                            title={blogPost.status !== 'published' ? t('actions.preview_disabled_helper', { defaultValue: 'Chỉ có thể xem bài viết đã xuất bản' }) : ''}
                                            className="w-full py-3 px-4 border border-slate-200 hover:border-[#0066CC] hover:text-[#0066CC] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-350 disabled:bg-slate-50/50 disabled:hover:border-slate-100 disabled:hover:text-slate-350"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {t('view_post', { defaultValue: 'Xem bài viết' })}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDuplicate}
                                            className="w-full py-3 px-4 border border-slate-200 hover:border-[#0066CC] hover:text-[#0066CC] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs"
                                        >
                                            <Copy className="w-4 h-4" />
                                            {t('duplicate_post', { defaultValue: 'Nhân bản bài viết' })}
                                        </button>

                                        {isAdmin ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="w-full py-3 px-4 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-4xs active:scale-[0.98]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {t('delete_post', { defaultValue: 'Xóa bài viết' })}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full py-3 px-4 border border-slate-100 bg-slate-50 text-slate-350 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-50"
                                                title={t('actions.delete_forbidden', { defaultValue: 'Bạn không có quyền xóa bài viết' })}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {t('delete_post', { defaultValue: 'Xóa bài viết' })}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Mobile Actions Bar */}
            {!isLoading && blogPost && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 p-4 flex gap-3 shadow-lg">
                    <Button
                        variant="outline"
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                        className="flex-1 rounded-xl border-slate-200 text-slate-500 font-bold h-12"
                    >
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold h-12 shadow-lg shadow-[#14B8A6]/20"
                    >
                        {t('actions.save_changes', { defaultValue: 'Lưu thay đổi' })}
                    </Button>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                postTitle={blogPost?.title || ''}
                isMutating={deleteMutation.isPending}
            />

            {/* Duplicate Confirm Modal */}
            <DuplicateConfirmDialog
                isOpen={isDuplicateDialogOpen}
                onClose={() => setIsDuplicateDialogOpen(false)}
                onConfirm={handleConfirmDuplicate}
            />
        </div>
    );
};

// Skeleton loading component for better visual transition
const BlogPostFormSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
        {/* Left Column Skeleton */}
        <div className="flex-grow space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>
                {/* Title skeleton */}
                <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                {/* Slug skeleton */}
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
                {/* Excerpt skeleton */}
                <div className="space-y-2.5">
                    <div className="h-4 bg-slate-200 rounded w-1/6" />
                    <div className="h-20 bg-slate-200 rounded-2xl w-full" />
                </div>
                {/* Editor skeleton */}
                <div className="space-y-2.5">
                    <div className="h-4 bg-slate-200 rounded w-1/6" />
                    <div className="h-[400px] bg-slate-200 rounded-2xl w-full" />
                </div>
            </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:w-80 shrink-0 space-y-6">
            {/* Card 1 Skeleton */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="space-y-3">
                    <div className="h-8 bg-slate-200 rounded-xl w-full" />
                    <div className="h-8 bg-slate-200 rounded-xl w-full" />
                    <div className="h-8 bg-slate-200 rounded-xl w-full" />
                </div>
            </div>
            {/* Card 2 Skeleton */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-24 bg-slate-200 rounded-xl w-full" />
            </div>
        </div>
    </div>
);

export default BlogPostEdit;
