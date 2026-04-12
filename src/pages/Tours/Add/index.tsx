import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Save, 
    Image as ImageIcon, 
    Plus,
    Info,
    DollarSign,
    Calendar,
} from 'lucide-react';
import { ROUTES } from '@/routes/routes';

const AddTour = () => {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();

    const sections = [
        { id: 'basic', label: t('form.basic_info'), icon: Info },
        { id: 'pricing', label: t('form.pricing'), icon: DollarSign },
        { id: 'images', label: t('form.images'), icon: ImageIcon },
        { id: 'schedule', label: t('form.schedule'), icon: Calendar },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 sticky top-20 bg-slate-50/80 backdrop-blur-md z-20 pt-2">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(ROUTES.TOURS_LIST)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-90"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('title.add')}</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">{t('title.add_subtitle')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(ROUTES.TOURS_LIST)}
                        className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-900 transition-all uppercase tracking-widest"
                    >
                        {t('form.cancel')}
                    </button>
                    <button className="flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/30 active:scale-95 transition-all">
                        <Save size={20} />
                        {t('form.submit')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Fixed Navigation Side (Optional) */}
                <div className="lg:col-span-1 space-y-2 sticky top-48 h-fit hidden lg:block">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                                section.id === 'basic' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Form Sections */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Basic Info Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Info size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('form.basic_info')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.tour_name')}</label>
                                <input 
                                    type="text" 
                                    placeholder={t('form.tour_name_placeholder')}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.category')}</label>
                                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                                    <option>Tour hằng ngày</option>
                                    <option>Tour biển đảo</option>
                                    <option>Tour văn hóa</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.duration')}</label>
                                <input 
                                    type="text" 
                                    placeholder={t('form.duration_placeholder')}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.description')}</label>
                                <textarea 
                                    rows={5}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <DollarSign size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('form.pricing')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.price')}</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600">đ</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest ml-1">{t('form.sale_price')}</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600">đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                                <ImageIcon size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('form.images')}</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="aspect-4/3 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                                <Plus className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" size={32} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">{t('form.add_image')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTour;
