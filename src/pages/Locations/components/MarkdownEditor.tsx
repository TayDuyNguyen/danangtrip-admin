import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

interface MarkdownEditorProps {
    value: string;
    onChange: (text: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    height?: string;
}

const MarkdownEditor = ({
    value,
    onChange,
    label,
    placeholder,
    error,
    height = '400px'
}: MarkdownEditorProps) => {
    const { t } = useTranslation('location');

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-700">{label}</label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Info className="w-3.5 h-3.5" />
                        <span>{t('form.basic.description_helper')}</span>
                    </div>
                </div>
            )}
            
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-[#14b8a6]/20 focus-within:border-[#14b8a6] transition-all">
                <MdEditor
                    value={value}
                    style={{ height }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={({ text }) => onChange(text)}
                    placeholder={placeholder}
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

export default MarkdownEditor;
