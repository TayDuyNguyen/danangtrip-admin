import {
    Search,
    Bell
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/store';

const Header = () => {
    const { user } = useAuth();
    const { t } = useTranslation('common');

    return (
        <header className="h-20 border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 py-3 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex-1 flex items-center max-w-xl">
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('header.search')}
                        className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                    />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-5 ml-8">
                {/* Language Switcher */}
                <LanguageSwitcher />

                <button className="p-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all relative group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
                </button>

                <div className="h-10 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3 group cursor-pointer pl-2">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-sm font-black text-slate-900 leading-tight">{user?.full_name || 'Admin'}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-tight mt-0.5">{t('header.admin_role')}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-white shadow-lg shadow-slate-200/50 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                        <img 
                            src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} 
                            alt={user?.full_name || "Admin"} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
