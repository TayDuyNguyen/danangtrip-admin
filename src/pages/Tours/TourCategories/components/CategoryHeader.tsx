import { Plus, ChevronRight, Home, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';

interface CategoryHeaderProps {
    onAdd: () => void;
}

const CategoryHeader = ({ onAdd }: CategoryHeaderProps) => {
    const { t } = useTranslation('tour');

    return (
        <div className="mb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                <Link to={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors flex items-center gap-1.5 shrink-0">
                    <Home size={14} />
                </Link>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                <span className="shrink-0">{t('title.breadcrumb_parent')}</span>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                <span className="text-slate-900 font-bold shrink-0">{t('categories.breadcrumb_list')}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                        <LayoutGrid size={28} className="text-white fill-white/10" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            {t('categories.title')}
                        </h1>
                        <p className="text-slate-500 text-sm md:text-base font-medium mt-1">
                            {t('categories.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 group"
                >
                    <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                    <span>{t('categories.add')}</span>
                </button>
            </div>
        </div>
    );
};

export default CategoryHeader;
