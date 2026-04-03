import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileCheck,
    Users,
    MapPin,
    LayoutList,
    Wallet,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useTranslation } from 'react-i18next';

/**
 * Navigation items for the sidebar
 */
const navItems = [
    { icon: LayoutDashboard, label: 'sidebar.dashboard', path: ROUTES.DASHBOARD },
    { icon: FileCheck, label: 'sidebar.articles', path: '/admin/articles' },
    { icon: Users, label: 'sidebar.users', path: '/admin/users' },
    { icon: MapPin, label: 'sidebar.locations', path: '/admin/locations' },
    { icon: LayoutList, label: 'sidebar.categories', path: '/admin/categories' },
    { icon: Wallet, label: 'sidebar.finance', path: '/admin/finance' },
    { icon: BarChart3, label: 'sidebar.reports', path: '/admin/reports' },
    { icon: Settings, label: 'sidebar.settings', path: '/admin/settings' },
];

const Sidebar: React.FC = () => {
    const { t } = useTranslation('common');

    return (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 group overflow-hidden">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="text-white font-bold text-xl">D</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none tracking-tight">ADMIN ĐN TRIP</h1>
                        <p className="text-slate-400 text-xs mt-1 font-medium">{t('sidebar.system')}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group/nav
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                            `}
                        >
                            <item.icon size={20} className="shrink-0" />
                            <span className="font-medium text-[15px]">{t(item.label)}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Bottom Section / User Profile Summary */}
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-bold truncate">Admin Da Nang</p>
                        <p className="text-slate-500 text-xs truncate">admin@dntrip.vn</p>
                    </div>
                    <button className="text-slate-500 hover:text-red-400 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
