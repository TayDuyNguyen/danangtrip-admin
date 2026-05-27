import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import BlogPostForm from './components/BlogPostForm';

const BlogPostCreate = () => {
    const { t } = useTranslation('blog');
    const navigate = useNavigate();

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
                            <div className="flex items-center gap-2 mb-0.5 select-none">
                                <BookOpen className="w-4 h-4 text-[#14B8A6]" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#14B8A6]">
                                    {t('breadcrumb')}
                                </span>
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
                            className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11"
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold px-5 h-11"
                        >
                            {t('form.publish.save_draft')}
                        </Button>
                        <Button
                            onClick={handlePublish}
                            className="rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold px-6 h-11 shadow-lg shadow-[#14B8A6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('form.publish.publish_btn')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <BlogPostForm />
            </div>
        </div>
    );
};

export default BlogPostCreate;
