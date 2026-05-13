import { Plus, ChevronRight, Home, MapPinned } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';

interface CategoryHeaderProps {
    onAdd: () => void;
}

const CategoryHeader = ({ onAdd }: CategoryHeaderProps) => {
    const { t } = useTranslation('location');

    return (
        <div className="mb-8">
            <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-[13px] font-medium text-slate-500 no-scrollbar">
                <Link to={ROUTES.DASHBOARD} className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-[#14b8a6]">
                    <Home size={14} />
                </Link>
                <ChevronRight size={14} className="shrink-0 text-slate-300" />
                <span className="shrink-0">{t('title')}</span>
                <ChevronRight size={14} className="shrink-0 text-slate-300" />
                <span className="shrink-0 font-bold text-slate-900">{t('categories.breadcrumb_list')}</span>
            </nav>

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#14b8a6] to-[#0f766e] shadow-xl shadow-[#14b8a6]/20">
                        <MapPinned size={28} className="fill-white/10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                            {t('categories.title')}
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                            {t('categories.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98]"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                    <span>{t('categories.add')}</span>
                </button>
            </div>
        </div>
    );
};

export default CategoryHeader;
