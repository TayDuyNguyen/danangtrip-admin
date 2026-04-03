import React from 'react';
import {
    Search,
    Bell,
    User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

const Header: React.FC = () => {
    const { t } = useTranslation('common');

    return (
        <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex-1 flex items-center max-w-xl">
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('header.search')}
                        className="block w-full pl-11 pr-3 py-2.5 bg-slate-100/50 border border-transparent rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/40 focus:bg-white transition-all placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 ml-8">
                {/* Language Switcher */}
                <LanguageSwitcher />

                <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all relative">
                    <Bell className="h-5.5 w-5.5" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="h-8 w-px bg-slate-200/60 mx-1"></div>

                <button className="flex items-center gap-3 p-1.5 pl-3 border border-slate-200/60 rounded-2xl hover:border-slate-300 hover:bg-slate-50/50 transition-all group">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-sm font-bold text-slate-900 leading-tight">Admin Da Nang</span>
                        <span className="text-[11px] text-slate-500 font-medium leading-tight">Super Admin</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                        <User size={20} />
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
