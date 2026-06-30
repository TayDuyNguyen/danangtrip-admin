import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import BlogPostForm from './components/BlogPostForm';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';
import { cn } from '@/utils';

const BlogPostCreate = () => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();
    const [publishOption, setPublishOption] = useState<'draft' | 'published' | 'scheduled'>('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isScrolled = useMainScrollCollapse();

    const submitLabel =
        publishOption === 'draft' ? t('form.publish.save_draft') : t('form.publish.publish_btn');

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-20">
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
                                        { label: 'breadcrumb.add' },
                                    ]}
                                />
                            </div>
                            <h1
                                className={cn(
                                    'font-bold text-slate-900 tracking-tight leading-tight transition-all duration-300',
                                    isScrolled ? 'text-base' : 'text-xl'
                                )}
                            >
                                {t('create_title')}
                            </h1>
                            <p
                                className={cn(
                                    'text-xs text-slate-400 font-medium transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                )}
                            >
                                {t('create_subtitle')}
                            </p>
                        </div>
                    </div>

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
                            form="blog-post-form"
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            className={cn(
                                'rounded-xl font-bold px-6 h-11 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5',
                                publishOption === 'draft'
                                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white'
                                    : 'bg-[#14B8A6] hover:bg-[#0f766e] shadow-[#14B8A6]/20 text-white'
                            )}
                        >
                            <Sparkles className="w-4 h-4" />
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
                <BlogPostForm
                    publishOption={publishOption}
                    onPublishOptionChange={setPublishOption}
                    onSubmittingChange={setIsSubmitting}
                    onCancel={() => navigate(ROUTES.BLOG_POSTS)}
                    onSuccess={(id) => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(id)))}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <Button
                    variant="outline"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => navigate(ROUTES.BLOG_POSTS)}
                    className="flex-1 rounded-xl h-12 font-bold border-slate-200 text-slate-500"
                >
                    {t('actions.cancel')}
                </Button>
                <Button
                    form="blog-post-form"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className={cn(
                        'flex-[2] rounded-xl h-12 font-bold shadow-lg',
                        publishOption === 'draft'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-[#14B8A6] hover:bg-[#0f766e] text-white'
                    )}
                >
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
};

export default BlogPostCreate;
