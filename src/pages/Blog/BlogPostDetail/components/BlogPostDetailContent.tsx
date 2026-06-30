import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Copy, Check, Eye, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogPostViewModel } from '@/types';

export interface BlogPostDetailContentProps {
    post: BlogPostViewModel;
}

export const BlogPostDetailContent = ({ post }: BlogPostDetailContentProps) => {
    const { t } = useTranslation('blog');
    const [copied, setCopied] = useState(false);

    const handleCopySlug = () => {
        if (!post.slug) return;
        navigator.clipboard.writeText(post.slug);
        setCopied(true);
        toast.success(t('toast.copy_success'));
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '—';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6 font-sans">
            {/* Featured Hero Banner */}
            <div className="relative w-full h-[320px] md:h-[400px] rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm group select-none">
                {post.featuredImage ? (
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 text-slate-400 gap-2">
                        <FileText size={48} className="text-teal-500/60" />
                        <span className="text-xs font-bold text-slate-400">{t('form.media.no_featured_image')}</span>
                    </div>
                )}
                {/* Visual Category Tags Overlay */}
                {post.categories.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-10">
                        {post.categories.map((cat) => (
                            <span
                                key={cat.id}
                                className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded-full text-xs font-bold shadow-sm"
                            >
                                {cat.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Title Section */}
            <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight">
                    {post.title}
                </h1>
                
                {/* Meta details below title for smaller screens */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 select-none pb-2 border-b border-slate-100">
                    {post.author && (
                        <div className="flex items-center gap-1.5">
                            <User size={13} />
                            <span>{post.author.fullName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye size={13} />
                        <span>{post.viewCount.toLocaleString()} {t('table.views')}</span>
                    </div>
                </div>
            </div>

            {/* Slug URL Info Block */}
            {post.slug && (
                <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/50 rounded-2xl px-4 py-3 select-all">
                    <div className="min-w-0 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider shrink-0">{t('form.slug')}:</span>
                        <code className="text-xs text-slate-600 font-mono font-bold truncate leading-none">
                            {post.slug}
                        </code>
                    </div>
                    <button
                        type="button"
                        onClick={handleCopySlug}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-[#14B8A6] hover:text-[#14B8A6] bg-white cursor-pointer transition-colors shadow-3xs shrink-0 active:scale-95"
                        title={t('actions.copy')}
                    >
                        {copied ? <Check size={14} className="text-emerald-500 animate-in zoom-in-50" /> : <Copy size={14} />}
                    </button>
                </div>
            )}

            {/* Excerpt Box */}
            {post.excerpt && (
                <div className="bg-[#14b8a6]/5 border-l-4 border-l-[#14B8A6] rounded-r-2xl p-5 leading-relaxed">
                    <h5 className="text-[10px] uppercase font-black text-[#0f766e] tracking-widest mb-1.5 select-none">{t('form.excerpt')}:</h5>
                    <p className="text-sm text-slate-600 font-semibold italic">
                        {post.excerpt}
                    </p>
                </div>
            )}

            {/* Main Rich Text Content */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 select-none">{t('form.content')}:</h5>
                {post.content ? (
                    <div
                        className="prose max-w-none prose-slate text-sm leading-relaxed text-slate-700 font-medium font-sans
                            [&_p]:mb-4 [&_p:last-child]:mb-0
                            [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-slate-800 [&_h1]:mt-6 [&_h1]:mb-3
                            [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-slate-800 [&_h2]:mt-5 [&_h2]:mb-2.5
                            [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-4 [&_h3]:mb-2
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                            [&_li]:mb-1 [&_li:last-child]:mb-0
                            [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-4
                            [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-100 [&_img]:shadow-4xs [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto
                            [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
                            [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2.5 [&_th]:text-xs [&_th]:font-bold [&_th]:text-slate-600
                            [&_td]:border [&_td]:border-slate-100 [&_td]:p-2.5 [&_td]:text-xs [&_td]:text-slate-600"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <p className="text-sm text-slate-400 italic text-center py-8">
                        {t('empty.no_content')}
                    </p>
                )}
            </div>
        </div>
    );
};
