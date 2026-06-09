import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/store';
import GlobalSearch from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

const Header = () => {
    const { user } = useAuth();
    const { t } = useTranslation('common');

    return (
        <header className="h-20 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 py-3 transition-all duration-150">
            {/* Search Bar */}
            <div className="flex-1 flex items-center max-w-xl">
                <GlobalSearch />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-5 ml-8">
                {/* Language Switcher */}
                <LanguageSwitcher />

                <NotificationBell />


                <div className="h-10 w-px bg-slate-100 mx-2"></div>

                <div className="flex items-center gap-3 group cursor-pointer pl-2">
                    <div className="flex flex-col items-end text-right">
                        <span className="text-sm font-black text-slate-900 leading-tight">{user?.full_name || t('labels.admin_fallback')}</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight mt-0.5">{t('header.admin_role')}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user?.full_name || t('labels.admin_fallback')}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-slate-500 text-sm font-black">
                                {(user?.full_name || t('labels.admin_fallback')).charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
