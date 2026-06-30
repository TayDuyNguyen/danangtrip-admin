import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, ExternalLink, Trash2, ChevronDown, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import { appEnv } from '@/config/env';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { cn } from '@/utils';
import { canPreviewBlogPost, getBlogPostDisplayStatus } from '@/utils/blogPostStatus';
import type { BlogPostViewModel } from '@/types';

export interface BlogPostDetailHeaderProps {
    post?: BlogPostViewModel;
    onStatusChange: (status: 'draft' | 'published' | 'archived') => void;
    onDeleteClick: () => void;
    isMutating?: boolean;
    isAdmin?: boolean;
    isScrolled?: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; dot: string; labelKey: string }> = {
    published: {
        bg: 'bg-emerald-50 border-emerald-100/50 hover:bg-emerald-100/50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        labelKey: 'status.published',
    },
    draft: {
        bg: 'bg-amber-50 border-amber-100/50 hover:bg-amber-100/50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        labelKey: 'status.draft',
    },
    archived: {
        bg: 'bg-slate-100 border-slate-200/50 hover:bg-slate-200/50',
        text: 'text-slate-700',
        dot: 'bg-slate-500',
        labelKey: 'status.archived',
    },
    scheduled: {
        bg: 'bg-violet-50 border-violet-100/50 hover:bg-violet-100/50',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
        labelKey: 'status.scheduled',
    },
};

export const BlogPostDetailHeader = ({
    post,
    onStatusChange,
    onDeleteClick,
    isMutating = false,
    isAdmin = false,
    isScrolled = false,
}: BlogPostDetailHeaderProps) => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayStatus = post ? getBlogPostDisplayStatus(post) : null;
    const statusColors = displayStatus ? statusStyles[displayStatus] || statusStyles.draft : null;
    const canPreview = post ? canPreviewBlogPost(post) : false;

    const previewDisabledTitle = post
        ? !canPreview
            ? getBlogPostDisplayStatus(post) === 'scheduled'
                ? t('actions.preview_scheduled_helper')
                : t('actions.preview_disabled_helper')
            : undefined
        : undefined;

    const handlePreview = () => {
        if (post?.slug && canPreview) {
            window.open(`${appEnv.publicWebUrl}/blog/${post.slug}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleStatusSelect = (status: 'draft' | 'published' | 'archived') => {
        if (!post || status === post.status) {
            setIsDropdownOpen(false);
            return;
        }
        onStatusChange(status);
        setIsDropdownOpen(false);
    };

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-all duration-300">
            <div
                className={cn(
                    'w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 font-sans transition-all duration-300',
                    isScrolled ? 'py-2' : 'min-h-20 py-3'
                )}
            >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <Button
                        variant="ghost"
                        className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer shrink-0"
                        aria-label={t('form.back_to_list')}
                        onClick={() => navigate(ROUTES.BLOG_POSTS)}
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div
                            className={cn(
                                'select-none transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-1'
                            )}
                        >
                            <Breadcrumbs
                                icon={FileText}
                                items={[
                                    { label: 'sidebar.posts', path: ROUTES.BLOG_POSTS },
                                    { label: 'breadcrumb.view' },
                                ]}
                            />
                        </div>
                        <h1
                            className={cn(
                                'font-bold text-slate-900 tracking-tight leading-tight truncate pr-4 transition-all duration-300',
                                isScrolled ? 'text-base' : 'text-xl'
                            )}
                        >
                            {t('detail_title')}
                        </h1>
                        {post && (
                            <p
                                className={cn(
                                    'text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] select-all transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                )}
                            >
                                {post.title}
                            </p>
                        )}
                    </div>
                </div>

                {post ? (
                    <div className="flex shrink-0 items-center gap-3 animate-in fade-in duration-200">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                disabled={isMutating}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black border uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50',
                                    statusColors?.bg,
                                    statusColors?.text
                                )}
                            >
                                <span className={cn('w-1.5 h-1.5 rounded-full', statusColors?.dot)} />
                                <span>{t(statusColors?.labelKey || 'status.draft')}</span>
                                <ChevronDown size={12} className="opacity-60" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 top-11 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {(['draft', 'published', 'archived'] as const).map((status) => {
                                        const isActive = post.status === status;
                                        return (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => handleStatusSelect(status)}
                                                className={cn(
                                                    'flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-bold cursor-pointer transition-colors',
                                                    isActive
                                                        ? 'bg-[#14B8A6]/10 text-[#0f766e]'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                )}
                                            >
                                                <span>{t(`actions.status_${status}`)}</span>
                                                {isActive && <Check size={12} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            disabled={!canPreview}
                            title={previewDisabledTitle}
                            className="hidden md:flex rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-4 h-11 items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 shrink-0"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t('view_post')}
                        </Button>

                        <Button
                            onClick={() => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(post.id)))}
                            disabled={isMutating}
                            className="rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold px-4 h-11 shadow-lg shadow-[#14B8A6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('actions.edit')}</span>
                        </Button>

                        {isAdmin && (
                            <Button
                                variant="ghost"
                                onClick={onDeleteClick}
                                disabled={isMutating}
                                className="hidden md:flex rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-500 font-bold px-4 h-11 items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{t('actions.delete')}</span>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-[100px] h-8 bg-slate-150 rounded-full animate-pulse" />
                        <div className="w-[80px] h-11 bg-slate-150 rounded-xl animate-pulse" />
                    </div>
                )}
            </div>
        </div>
    );
};
