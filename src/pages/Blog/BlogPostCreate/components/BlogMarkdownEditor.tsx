import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { Info, Loader2 } from 'lucide-react';
import { useBlogUploadMutations } from '@/hooks/useBlogQueries';

const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

interface BlogMarkdownEditorProps {
    value: string;
    onChange: (text: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    height?: string;
}

const BlogMarkdownEditor = ({
    value,
    onChange,
    label,
    placeholder,
    error,
    height = '400px'
}: BlogMarkdownEditorProps) => {
    const { uploadImageMutation } = useBlogUploadMutations();

    const handleImageUpload = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            uploadImageMutation.mutate(file, {
                onSuccess: (res) => {
                    if (res && res.url) {
                        resolve(res.url);
                    } else {
                        reject(new Error('Invalid response'));
                    }
                },
                onError: (err) => {
                    reject(err);
                }
            });
        });
    };

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-700">
                        {label} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Info className="w-3.5 h-3.5" />
                        <span>Markdown support</span>
                    </div>
                </div>
            )}
            
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-[#14b8a6]/20 focus-within:border-[#14b8a6] transition-all relative">
                {uploadImageMutation.isPending && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-[#14b8a6] animate-spin" />
                        <span className="text-xs font-semibold text-slate-600">Uploading image...</span>
                    </div>
                )}
                <MdEditor
                    value={value}
                    style={{ height }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={({ text }) => onChange(text)}
                    placeholder={placeholder}
                    onImageUpload={handleImageUpload}
                    view={{ menu: true, md: true, html: false }}
                    canView={{ menu: true, md: true, html: true, both: false, fullScreen: true, hideMenu: false }}
                    config={{
                        view: {
                            menu: true,
                            md: true,
                            html: false,
                            both: false
                        }
                    }}
                />
            </div>
            
            {error && (
                <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};

export default BlogMarkdownEditor;
