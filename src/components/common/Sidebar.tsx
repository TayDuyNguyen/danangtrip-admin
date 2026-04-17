import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    Hotel,
    ShoppingCart,
    FileText,
    Users,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    MapPin,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store';

/**
 * Nested navigation items for the sidebar
 */
const navItems = [
    { icon: LayoutDashboard, label: 'sidebar.dashboard', path: ROUTES.DASHBOARD },
    {
        icon: Map, label: 'sidebar.tours', path: '/admin/tours',
        subItems: [
            { label: 'sidebar.tour_list', path: ROUTES.TOURS_LIST },
            { label: 'sidebar.tour_categories', path: '/admin/tours/categories' },
            { label: 'sidebar.tour_schedules', path: '/admin/tours/schedules' },
        ]
    },
    { icon: Hotel, label: 'sidebar.hotels', path: '/admin/hotels' },
    { icon: ShoppingCart, label: 'sidebar.orders', path: '/admin/orders' },
    { icon: FileText, label: 'sidebar.posts', path: '/admin/posts' },
    { icon: Users, label: 'sidebar.users', path: '/admin/users' },
    { icon: Bell, label: 'sidebar.notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'sidebar.settings', path: '/admin/settings' },
];

const Sidebar = () => {
    const { user } = useAuth();
    const { t } = useTranslation('common');
    const location = useLocation();
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // State to track which submenus are open
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        '/admin/tours': location.pathname.startsWith('/admin/tours')
    });

    const toggleMenu = (path: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    return (
        <aside className={`bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 group z-50 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-8 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo Section */}
            <div className={`p-6 border-b border-slate-800 flex items-center h-[88px] ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
                        <MapPin size={22} className="text-white fill-white/20" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 transition-opacity duration-200">
                            <h1 className="text-white font-black text-lg leading-none tracking-tight truncate">DaNangTrip</h1>
                            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest truncate">{t('sidebar.system')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="space-y-1.5">
                    {navItems.map((item) => {
                        const hasSub = !!item.subItems;
                        const isMainActive = location.pathname.startsWith(item.path) || (item.path === ROUTES.DASHBOARD && location.pathname === '/');
                        const isOpen = openMenus[item.path];

                        return (
                            <div key={item.path} className="flex flex-col relative group/item" title={isCollapsed ? t(item.label) : ''}>
                                {hasSub ? (
                                    <button
                                        onClick={() => !isCollapsed && toggleMenu(item.path)}
                                        className={`
                                            flex items-center w-full py-3 rounded-xl transition-all duration-200 group/nav relative overflow-hidden
                                            ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}
                                            ${isMainActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                                        `}
                                    >
                                        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                                            {isMainActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>}
                                            <item.icon size={20} className={isMainActive ? "text-white" : "shrink-0"} />
                                            {!isCollapsed && <span className="font-bold text-[14px] truncate">{t(item.label)}</span>}
                                        </div>
                                        {(!isCollapsed && hasSub) && (
                                            <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''} ${isMainActive ? 'text-white' : ''}`} />
                                        )}
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items-center py-3 rounded-xl transition-all duration-200 group/nav relative overflow-hidden
                                            ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}
                                            ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>}
                                                <item.icon size={20} className="shrink-0" />
                                                {!isCollapsed && <span className="font-bold text-[14px] truncate">{t(item.label)}</span>}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {/* Sub-items */}
                                {hasSub && isOpen && !isCollapsed && (
                                    <div className="mt-1 mb-1 ml-4 pl-4 border-l-2 border-slate-800 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {item.subItems?.map(sub => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                className={({ isActive }) => `
                                                    flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-blue-500/10 text-blue-400 font-black'
                                                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 font-bold'}
                                                    text-[13px]
                                                `}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                                {t(sub.label)}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Section / User Profile Summary */}
            <div className={`p-4 border-t border-slate-800 ${isCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
                {!isCollapsed ? (
                    <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-black shrink-0 shadow-sm relative overflow-hidden">
                                <img 
                                    src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} 
                                    alt={user?.full_name || "Admin"} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-black truncate">{user?.full_name || 'Admin'}</p>
                                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest truncate mt-0.5">{t('header.admin_role')}</p>
                            </div>
                        </div>
                        <button className="text-slate-500 hover:text-red-400 transition-colors shrink-0" title={t('sidebar.logout')}>
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-black shrink-0 shadow-sm relative overflow-hidden" title={user?.full_name || 'Admin'}>
                            <img 
                                src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} 
                                alt={user?.full_name || "Admin"} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <button className="text-slate-500 hover:text-red-400 transition-colors shrink-0 p-2 hover:bg-slate-800 rounded-lg" title={t('sidebar.logout')}>
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
