import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink, Edit, Copy, Trash2, Calendar, Clock, Eye, Folder } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { appEnv } from '@/config/env';
import { canPreviewBlogPost, getBlogPostDisplayStatus, isBlogPostScheduled } from '@/utils/blogPostStatus';
import { cn } from '@/utils';
import type { BlogPostViewModel } from '@/types';

export interface BlogPostDetailSidebarProps {
    post: BlogPostViewModel;
    onDeleteClick: () => void;
    onDuplicateClick: () => void;
    isAdmin?: boolean;
}

const statusBadges: Record<string, { bg: string; text: string; dot: string; labelKey: string }> = {
    published: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', labelKey: 'status.published' },
    draft: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', labelKey: 'status.draft' },
    archived: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', labelKey: 'status.archived' },
    scheduled: { bg: 'bg-violet-50 border-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', labelKey: 'status.scheduled' },
};

export const BlogPostDetailSidebar = ({
    post,
    onDeleteClick,
    onDuplicateClick,
    isAdmin = false,
}: BlogPostDetailSidebarProps) => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();

    const displayStatus = getBlogPostDisplayStatus(post);
    const activeBadge = statusBadges[displayStatus] || statusBadges.draft;
    const canPreview = canPreviewBlogPost(post);
    const isScheduled = isBlogPostScheduled(post.publishedAt, post.status);

    const previewDisabledTitle = !canPreview
        ? isScheduled
            ? t('actions.preview_scheduled_helper')
            : t('actions.preview_disabled_helper')
        : undefined;

    const formatDate = (date: Date | null) => {
        if (!date) return '—';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handlePreview = () => {
        if (post.slug && canPreview) {
            window.open(`${appEnv.publicWebUrl}/blog/${post.slug}`, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="space-y-6 font-sans select-none">
            <div className="hidden lg:block bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                    {t('quick_actions')}
                </h4>

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={!canPreview}
                        title={previewDisabledTitle}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50/50"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('view_post')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(post.id)))}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs"
                    >
                        <Edit className="w-4 h-4" />
                        {t('edit_title')}
                    </button>

                    <button
                        type="button"
                        onClick={onDuplicateClick}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs"
                    >
                        <Copy className="w-4 h-4" />
                        {t('duplicate_post')}
                    </button>

                    {isAdmin ? (
                        <button
                            type="button"
                            onClick={onDeleteClick}
                            className="w-full py-3 px-4 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-4xs active:scale-[0.98]"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('delete_post')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="w-full py-3 px-4 border border-slate-100 bg-slate-50 text-slate-350 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-50"
                            title={t('actions.delete_forbidden')}
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('delete_post')}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#14B8A6]" />
                    {t('form.sections.publish')}
                </h4>

                <div className="space-y-3">
                    <div
                        className={cn(
                            'flex items-center gap-2 px-3.5 py-2.5 border rounded-2xl text-xs font-black uppercase tracking-wider',
                            activeBadge.bg,
                            activeBadge.text
                        )}
                    >
                        <span className={cn('w-1.5 h-1.5 rounded-full', activeBadge.dot)} />
                        <span>{t(activeBadge.labelKey)}</span>
                    </div>

                    {post.status === 'published' && post.publishedAt && (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 text-[11px] leading-relaxed text-slate-500 font-semibold">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                {isScheduled ? t('form.publish.scheduled') : t('table.col_published')}:
                            </span>
                            <span>{formatDate(post.publishedAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            {post.author && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#14B8A6]" />
                        {t('info_author')}
                    </h4>

                    <div className="flex items-center gap-3 p-1.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-100 flex items-center justify-center text-slate-600 font-extrabold shrink-0 shadow-3xs overflow-hidden">
                            {post.author.avatar ? (
                                <img src={post.author.avatar} alt={post.author.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm">{post.author.fullName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h5 className="text-xs font-black text-slate-700 leading-snug truncate">{post.author.fullName}</h5>
                            <span className="text-[9px] uppercase font-black text-[#14B8A6] tracking-wider leading-none mt-0.5 block">
                                {t('role.author')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#14B8A6]" />
                    {t('info_section')}
                </h4>

                <div className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                    <div className="flex justify-between py-2.5">
                        <span className="text-slate-400">{t('info_created')}</span>
                        <span className="text-slate-700">{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                        <span className="text-slate-400">{t('info_updated')}</span>
                        <span className="text-slate-700">{formatDate(post.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                        <span className="text-slate-400">{t('info_views')}</span>
                        <div className="flex items-center gap-1 text-[#14B8A6]">
                            <Eye size={12} />
                            <span>{t('info_views_val', { count: post.viewCount })}</span>
                        </div>
                    </div>
                    {post.categories.length > 0 && (
                        <div className="py-2.5 space-y-2">
                            <span className="text-slate-400 block mb-1.5">{t('filters.category')}</span>
                            <div className="flex flex-wrap gap-1">
                                {post.categories.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex px-2.5 py-1 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-full text-[10px] font-bold"
                                    >
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
