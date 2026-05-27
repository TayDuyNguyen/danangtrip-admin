import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import BlogPostForm from './components/BlogPostForm';
import Breadcrumbs from '@/components/common/Breadcrumbs';

const BlogPostCreate = () => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();
    const [publishOption, setPublishOption] = useState<'draft' | 'published' | 'scheduled'>('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveDraft = () => {
        document.getElementById('blog-form-submit-draft')?.click();
    };

    const handlePublish = () => {
        document.getElementById('blog-form-submit-publish')?.click();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
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
                                        { label: 'breadcrumb.add' }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t('create_title')}
                            </h1>
                        </div>
                    </div>

                    {/* Header Right: Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate(ROUTES.BLOG_POSTS)}
                            disabled={isSubmitting}
                            className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11"
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            onClick={publishOption === 'draft' ? handleSaveDraft : handlePublish}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            className={`rounded-xl font-bold px-6 h-11 shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                                publishOption === 'draft'
                                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white'
                                    : 'bg-[#14B8A6] hover:bg-[#0f766e] shadow-[#14B8A6]/20 text-white'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {publishOption === 'draft' ? t('form.publish.save_draft') : t('form.publish.publish_btn')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <BlogPostForm
                    publishOption={publishOption}
                    onPublishOptionChange={setPublishOption}
                    onSubmittingChange={setIsSubmitting}
                />
            </div>
        </div>
    );
};

export default BlogPostCreate;
