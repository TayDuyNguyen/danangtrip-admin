import { useEffect, useId, useRef, useState } from 'react';
import {
    Search,
    Bell,
    ClipboardList,
    Mail,
    Send,
    X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '@/store';
import { TextInput } from '@/components/ui/TextInput';
import { ROUTES } from '@/routes/routes';

const adminNotificationItems = [
    {
        key: 'contacts',
        title: 'Liên hệ mới',
        description: 'Kiểm tra yêu cầu hỗ trợ từ khách hàng',
        time: 'Hỗ trợ',
        icon: Mail,
        tone: 'teal',
        path: ROUTES.CONTACTS,
    },
    {
        key: 'bookings',
        title: 'Đơn hàng cần xử lý',
        description: 'Theo dõi booking chờ xác nhận hoặc thanh toán',
        time: 'Vận hành',
        icon: ClipboardList,
        tone: 'blue',
        path: ROUTES.BOOKINGS_LIST,
    },
    {
        key: 'sent-notifications',
        title: 'Thông báo gửi người dùng',
        description: 'Quản lý danh sách thông báo hệ thống đã gửi',
        time: 'Broadcast',
        icon: Send,
        tone: 'rose',
        path: ROUTES.NOTIFICATIONS,
    },
];

const Header = () => {
    const { user } = useAuth();
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const searchId = useId();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isNotificationOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!notificationRef.current?.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isNotificationOpen]);

    const goTo = (path: string) => {
        setIsNotificationOpen(false);
        navigate(path);
    };

    return (
        <header className="h-20 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 py-3 transition-all duration-150">
            {/* Search Bar */}
            <div className="flex-1 flex items-center max-w-xl">
                <div className="relative group w-full">
                    <label htmlFor={searchId} className="sr-only">
                        {t('header.search_label')}
                    </label>
                    <TextInput
                        id={searchId}
                        type="search"
                        name="admin-quick-search"
                        autoComplete="off"
                        placeholder={t('header.search')}
                        leftIcon={<Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#14b8a6] transition-colors duration-150" />}
                        containerClassName="group"
                        className="rounded-full border-slate-100 pl-12 py-3 text-sm font-medium shadow-sm focus:ring-4 focus:ring-[#14b8a6]/10 focus:border-[#14b8a6]/50"
                    />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-5 ml-8">
                {/* Language Switcher */}
                <LanguageSwitcher />

                <div className="relative" ref={notificationRef}>
                    <button
                        type="button"
                        onClick={() => setIsNotificationOpen((value) => !value)}
                        aria-haspopup="dialog"
                        aria-expanded={isNotificationOpen}
                        className={`relative p-3 rounded-full border transition-all duration-150 group ${
                            isNotificationOpen
                                ? 'bg-[#dff7f4] border-[#ccfbf1] text-[#0f766e] shadow-sm'
                                : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#14b8a6] border-2 border-white rounded-full" />
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-[calc(100%+12px)] w-[380px] max-w-[calc(100vw-32px)] rounded-3xl border border-[#F1F5F9] bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-5 border-b border-[#F1F5F9] bg-gradient-to-br from-white/40 via-white/10 to-transparent">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#14B8A6]">
                                            Trung tâm quản trị
                                        </p>
                                        <h2 className="mt-1 text-base font-black text-[#0F172A]">
                                            Thông báo nhanh
                                        </h2>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-[#94A3B8]">
                                            Lối tắt đến các luồng cần theo dõi trong hệ thống.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsNotificationOpen(false)}
                                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#F1F5F9] bg-white text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                        aria-label="Đóng thông báo nhanh"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-3">
                                {adminNotificationItems.map((item) => {
                                    const Icon = item.icon;
                                    const toneClass =
                                        item.tone === 'teal'
                                            ? 'bg-[#dff7f4] text-[#0f766e] border-[#ccfbf1]'
                                            : item.tone === 'rose'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-[#DBEAFE] text-[#0F172A] border-[#BFDBFE]';

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => goTo(item.path)}
                                            className="group/item flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-[#F8FAFC]"
                                        >
                                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border ${toneClass}`}>
                                                <Icon size={18} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-sm font-black text-[#0F172A]">
                                                        {item.title}
                                                    </span>
                                                    <span className="shrink-0 rounded-full bg-[#F8FAFC] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#94A3B8]">
                                                        {item.time}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block text-xs font-semibold leading-5 text-[#94A3B8]">
                                                    {item.description}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/80 px-5 py-4">
                                <span className="text-[11px] font-bold text-[#94A3B8]">
                                    Đây là hộp lối tắt quản trị, khác với thông báo gửi người dùng.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => goTo(ROUTES.NOTIFICATIONS)}
                                    className="shrink-0 rounded-full bg-[#14B8A6] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[#14B8A6]/15 transition hover:bg-[#0f766e]"
                                >
                                    Mở quản lý
                                </button>
                            </div>
                        </div>
                    )}
                </div>

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
