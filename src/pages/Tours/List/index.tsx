import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    Copy, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useToursQuery, useTourMutations } from '@/hooks';
import type { TourFilters } from '@/dataHelper/tour.dataHelper';
import LoadingReact from '@/components/loading';
import Input from '@/components/input';

const TourList = () => {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();
    
    const [filters, setFilters] = useState<TourFilters>({
        search: '',
        category: 'all',
        status: 'all',
        sortBy: 'newest'
    });
    const [page, setPage] = useState(1);

    const { data, isLoading } = useToursQuery(filters, page);
    const tours = data?.items || [];
    const total = data?.total || 0;

    const { deleteMutation } = useTourMutations();

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(t('common:confirm_delete', { name: title }))) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusStyle = (status: string) => {
        const variants: Record<string, string> = {
            active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            inactive: 'bg-slate-50 text-slate-500 border-slate-200',
            full: 'bg-orange-50 text-orange-600 border-orange-100',
        };
        return variants[status] || variants.active;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 size={14} />;
            case 'inactive': return <XCircle size={14} />;
            case 'full': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span>{t('common:sidebar.system')}</span>
                        <ChevronRight size={12} />
                        <span className="text-blue-600">{t('title.list')}</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1.5">{t('title.list')}</h1>
                    <p className="text-slate-500 font-bold tracking-tight">{t('title.subtitle')}</p>
                </div>

                <button
                    onClick={() => navigate(ROUTES.TOURS_CREATE)}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 active:scale-95 transition-all w-fit"
                >
                    <Plus size={20} />
                    {t('title.add')}
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                        type="text"
                        placeholder={t('filters.search')}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-400"
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        className="flex-1 md:flex-none px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                        value={filters.category}
                        onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                    >
                        <option value="all">{t('filters.all_categories')}</option>
                        <option value="Tour hằng ngày">Tour hằng ngày</option>
                        <option value="Tour biển đảo">Tour biển đảo</option>
                    </select>

                    <select 
                        className="flex-1 md:flex-none px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="all">{t('filters.all_status')}</option>
                        <option value="active">{t('status.active')}</option>
                        <option value="inactive">{t('status.inactive')}</option>
                        <option value="full">{t('status.full')}</option>
                    </select>

                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-600 transition-colors">
                                        {t('table.header_tour')}
                                        <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('table.header_category')}</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('table.header_price')}</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">{t('table.header_sales')}</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">{t('table.header_status')}</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">{t('table.header_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <LoadingReact />
                                    </td>
                                </tr>
                            ) : tours.length > 0 ? (
                                tours.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 min-w-[300px]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black text-slate-900 line-clamp-1">{item.title}</span>
                                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.duration}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-black rounded-lg uppercase tracking-wider border border-blue-100/50">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-slate-900">{item.price}</span>
                                                {item.originalPrice && (
                                                    <span className="text-[11px] text-slate-400 line-through font-bold">{item.originalPrice}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-[14px] font-black text-slate-700">{item.salesCount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                                                {getStatusIcon(item.status)}
                                                {t(`status.${item.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title="Duplicate">
                                                    <Copy size={18} />
                                                </button>
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                                                    title={t('common:actions.delete')}
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <p className="text-slate-400 font-bold italic">{t('common:no_data')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-400 italic">
                        {t('pagination.showing_summary', { 
                            start: total > 0 ? (page - 1) * 10 + 1 : 0, 
                            end: Math.min(page * 10, total), 
                            total 
                        })}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                                        i === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-slate-300 transition-all shadow-sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(total / 10)}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourList;
