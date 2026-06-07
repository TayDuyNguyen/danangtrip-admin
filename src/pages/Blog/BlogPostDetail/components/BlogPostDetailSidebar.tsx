import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink, Edit, Copy, Trash2, Calendar, Clock, Eye, Folder } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { appEnv } from '@/config/env';
import type { BlogPostViewModel } from '@/types';

export interface BlogPostDetailSidebarProps {
    post: BlogPostViewModel;
    onStatusChange: (status: 'draft' | 'published' | 'archived') => void;
    onDeleteClick: () => void;
    onDuplicateClick: () => void;
    isAdmin?: boolean;
}

export const BlogPostDetailSidebar = ({
    post,
    onDeleteClick,
    onDuplicateClick,
    isAdmin = false,
}: BlogPostDetailSidebarProps) => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();

    const formatDate = (date: Date | null) => {
        if (!date) return '—';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handlePreview = () => {
        if (post.slug) {
            window.open(`${appEnv.publicWebUrl}/blog/${post.slug}`, '_blank', 'noopener,noreferrer');
        }
    };

    const statusBadges: Record<string, { bg: string; text: string; dot: string; labelKey: string }> = {
        published: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', labelKey: 'status.published' },
        draft: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', labelKey: 'status.draft' },
        archived: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', labelKey: 'status.archived' },
    };

    const activeBadge = statusBadges[post.status] || statusBadges.draft;

    return (
        <div className="space-y-6 font-sans select-none">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#14B8A6]" />
                    {t('quick_actions', { defaultValue: 'Thao tác nhanh' })}
                </h4>
                
                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={post.status !== 'published'}
                        title={post.status !== 'published' ? t('actions.preview_disabled_helper', { defaultValue: 'Chỉ có thể xem bài viết đã xuất bản' }) : ''}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-350 disabled:bg-slate-50/50"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('view_post', { defaultValue: 'Xem bài viết' })}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(post.id)))}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs"
                    >
                        <Edit className="w-4 h-4" />
                        {t('edit_title', { defaultValue: 'Chỉnh sửa bài viết' })}
                    </button>

                    <button
                        type="button"
                        onClick={onDuplicateClick}
                        className="w-full py-3 px-4 border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-4xs"
                    >
                        <Copy className="w-4 h-4" />
                        {t('duplicate_post', { defaultValue: 'Nhân bản bài viết' })}
                    </button>

                    {isAdmin ? (
                        <button
                            type="button"
                            onClick={onDeleteClick}
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

            {/* Publish Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#14B8A6]" />
                    {t('form.sections.publish', { defaultValue: 'Trạng thái Xuất bản' })}
                </h4>
                
                <div className="space-y-3">
                    <div className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-2xl text-xs font-black uppercase tracking-wider ${activeBadge.bg} ${activeBadge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeBadge.dot}`}></span>
                        <span>{t(activeBadge.labelKey)}</span>
                    </div>

                    {post.status === 'published' && post.publishedAt && (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 text-[11px] leading-relaxed text-slate-500 font-semibold">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                {t('table.col_published', { defaultValue: 'Ngày xuất bản' })}:
                            </span>
                            <span>{formatDate(post.publishedAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Author Profile Card */}
            {post.author && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#14B8A6]" />
                        {t('info_author', { defaultValue: 'Tác giả bài viết' })}
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
                            <h5 className="text-xs font-black text-slate-700 leading-snug truncate">
                                {post.author.fullName}
                            </h5>
                            <span className="text-[9px] uppercase font-black text-[#14B8A6] tracking-wider leading-none mt-0.5 block">
                                {t('role.author', { defaultValue: 'Tác giả' })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Metadata Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#14B8A6]" />
                    {t('info_section', { defaultValue: 'Thông tin bổ sung' })}
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
                            <span>{t('info_views_val', { count: post.viewCount, defaultValue: `${post.viewCount} lượt` })}</span>
                        </div>
                    </div>
                    {post.categories.length > 0 && (
                        <div className="py-2.5 space-y-2">
                            <span className="text-slate-400 block mb-1.5">{t('filters.category', { defaultValue: 'Danh mục' })}</span>
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
