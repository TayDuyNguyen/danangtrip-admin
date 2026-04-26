import { Edit2, Trash2, ExternalLink, Hash, Power, PowerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import { cn } from '@/utils/cn';

interface CategoryTableProps {
    categories: TourCategory[];
    onEdit: (category: TourCategory) => void;
    onDelete: (category: TourCategory) => void;
    onStatusChange: (id: number, status: string) => void;
}

const CategoryTable = ({ categories, onEdit, onDelete, onStatusChange }: CategoryTableProps) => {
    const { t } = useTranslation('tour');

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName] || Icons.Map;
        return <IconComponent size={18} className="text-[#14b8a6]" />;
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-5 text-left">
                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Hash size={12} />
                                    <span>{t('categories.table.header_index')}</span>
                                </div>
                            </th>
                            <th className="px-6 py-5 text-left">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {t('categories.table.header_icon')}
                                </span>
                            </th>
                            <th className="px-6 py-5 text-left">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {t('categories.table.header_name')}
                                </span>
                            </th>
                            <th className="px-6 py-5 text-left">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {t('categories.table.header_tour_count')}
                                </span>
                            </th>
                            <th className="px-6 py-5 text-left">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {t('categories.table.header_status')}
                                </span>
                            </th>
                            <th className="px-6 py-5 text-right">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {t('table.header_actions')}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {categories.map((category, index) => (
                            <tr key={category.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-5">
                                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="w-10 h-10 bg-[#dff7f4] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {renderIcon(category.icon)}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-slate-900 group-hover:text-[#14b8a6] transition-colors">
                                            {category.name}
                                        </span>
                                        <span className="text-[12px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                            {category.slug}
                                            <ExternalLink size={10} />
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[13px] font-bold text-slate-600">
                                        {category.tour_count} {t('form.basic.people_unit')}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <button
                                        onClick={() => onStatusChange(category.id, category.status === 'active' ? 'inactive' : 'active')}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95",
                                            category.status === 'active' 
                                                ? "bg-[#dff7f4] text-[#0f766e] hover:bg-[#ccfbf1]" 
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            category.status === 'active' ? "bg-[#14b8a6] animate-pulse" : "bg-slate-400"
                                        )} />
                                        {t(`status.${category.status}`)}
                                    </button>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#14b8a6] hover:border-[#ccfbf1] hover:shadow-lg hover:shadow-[#14b8a6]/10 transition-all"
                                            title={t('categories.edit')}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(category)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                                            title={t('dialog.button_delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => onStatusChange(category.id, category.status === 'active' ? 'inactive' : 'active')}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            {category.status === 'active' ? <PowerOff size={16} /> : <Power size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {categories.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-4">
                        <Icons.FolderOpen size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t('messages.no_data')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('messages.no_data_subtitle')}</p>
                </div>
            )}
        </div>
    );
};

export default CategoryTable;
