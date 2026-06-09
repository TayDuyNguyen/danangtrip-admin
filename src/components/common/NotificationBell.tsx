import { useEffect, useRef, useState } from 'react';
import {
    Bell,
    ClipboardList,
    Mail,
    Star,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import { useNotificationCountsQuery } from '@/hooks/useDashboardQueries';

export const NotificationBell = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { data: notificationData } = useNotificationCountsQuery();
    
    // Shake animation when new notifications are received (API total count increases)
    const [isShaking, setIsShaking] = useState(false);
    const prevTotalUnread = useRef<number>(0);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (notificationData) {
            const currentUnread = notificationData.total_unread ?? 0;
            // Shake if total unread count on server strictly increases
            if (!isFirstLoad.current && currentUnread > prevTotalUnread.current) {
                setIsShaking(true);
                const timer = setTimeout(() => setIsShaking(false), 600);
                return () => clearTimeout(timer);
            }
            prevTotalUnread.current = currentUnread;
            isFirstLoad.current = false;
        }
    }, [notificationData]);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    const categories = notificationData?.categories;
    const totalUnread = notificationData?.total_unread ?? 0;

    const items = [
        {
            key: 'contacts',
            title: t('notification_bell.contacts_title'),
            description: t('notification_bell.contacts_desc'),
            icon: Mail,
            tone: 'teal',
            path: `${ROUTES.CONTACTS}?status=new`,
            count: categories?.contacts?.count ?? 0,
        },
        {
            key: 'bookings',
            title: t('notification_bell.bookings_title'),
            description: t('notification_bell.bookings_desc'),
            icon: ClipboardList,
            tone: 'blue',
            path: `${ROUTES.BOOKINGS_LIST}?status=pending`,
            count: categories?.bookings?.count ?? 0,
        },
        {
            key: 'ratings',
            title: t('notification_bell.ratings_title'),
            description: t('notification_bell.ratings_desc'),
            icon: Star,
            tone: 'amber',
            path: `${ROUTES.RATINGS}?is_new=1`,
            count: categories?.ratings?.count ?? 0,
        },
    ];

    // Button states: active, hovering, blinking, dim
    const buttonStyleClass = isOpen
        ? 'bg-[#dff7f4] border-[#ccfbf1] text-[#0f766e] shadow-sm'
        : totalUnread > 0
            ? 'bg-[#f0fdfa] border-[#ccfbf1] text-[#14b8a6] hover:bg-[#dff7f4] shadow-xs'
            : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900';

    // Pulsing/blinking class for the Bell icon when there are unhandled notifications
    const iconStyleClass = totalUnread > 0 && !isOpen
        ? 'bell-pulse text-[#14b8a6]'
        : '';

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={t('notification_bell.button_aria', { defaultValue: 'Thông báo' })}
                data-testid="notification-bell-button"
                className={`relative p-3 rounded-full border transition-all duration-150 group ${buttonStyleClass} ${isShaking ? 'bell-shake' : ''}`}
            >
                <Bell className={`h-5 w-5 group-hover:scale-110 transition-transform ${iconStyleClass}`} />
                {totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm animate-pulse">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label={t('notification_bell.quick_notifications')}
                    data-testid="notification-popover"
                    className="absolute right-0 top-[calc(100%+12px)] w-[380px] max-w-[calc(100vw-32px)] rounded-3xl border border-[#F1F5F9] bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                    <div className="p-5 border-b border-[#F1F5F9] bg-gradient-to-br from-white/40 via-white/10 to-transparent">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#14B8A6]">
                                    {t('notification_bell.admin_center')}
                                </p>
                                <h2 className="mt-1 text-base font-black text-[#0F172A]">
                                    {t('notification_bell.quick_notifications')}
                                </h2>
                                <p className="mt-1 text-xs font-semibold leading-5 text-[#94A3B8]">
                                    {t('notification_bell.shortcut_desc')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#F1F5F9] bg-white text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                aria-label={t('notification_bell.close_aria')}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="p-3">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const toneClass =
                                item.tone === 'teal'
                                    ? 'bg-[#dff7f4] text-[#0f766e] border-[#ccfbf1]'
                                    : item.tone === 'amber'
                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                        : 'bg-[#DBEAFE] text-[#0F172A] border-[#BFDBFE]';

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleNavigate(item.path)}
                                    data-testid={`notification-item-${item.key}`}
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
                                            {item.count > 0 ? (
                                                <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                                                    {item.count}
                                                </span>
                                            ) : (
                                                <span className="shrink-0 rounded-full bg-[#F8FAFC] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#94A3B8]">
                                                    {t('notification_bell.read_status')}
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1 block text-xs font-semibold leading-5 text-[#94A3B8]">
                                            {item.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/80 px-5 py-4">
                        <button
                            type="button"
                            onClick={() => handleNavigate(ROUTES.NOTIFICATIONS)}
                            className="shrink-0 rounded-full bg-[#14B8A6] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[#14B8A6]/15 transition hover:bg-[#0f766e]"
                        >
                            {t('notification_bell.open_management')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
