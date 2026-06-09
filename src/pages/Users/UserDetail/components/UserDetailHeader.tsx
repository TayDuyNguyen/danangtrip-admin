import { ArrowLeft, Edit2, Ban, LockOpen, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Users } from 'lucide-react';
import type { UserItem } from '@/dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';

interface UserDetailHeaderProps {
    user?: UserItem;
    isSelf?: boolean;
    onLockToggle?: () => void;
    onRoleChange?: () => void;
    isLoading?: boolean;
}

export const UserDetailHeader = ({
    user,
    isSelf = false,
    onLockToggle = () => {},
    onRoleChange = () => {},
    isLoading = false,
}: UserDetailHeaderProps) => {
    const { t } = useTranslation('user');
    const navigate = useNavigate();

    const roleBadgeColors: Record<string, string> = {
        admin: "bg-indigo-50 border-indigo-200/50 text-indigo-700",
        user: "bg-slate-50 border-slate-200/50 text-slate-600",
    };

    const statusBadgeColors: Record<string, string> = {
        active: "bg-emerald-50 border-emerald-200/50 text-emerald-700",
        banned: "bg-rose-50 border-rose-200/50 text-rose-700",
        pending: "bg-amber-50 border-amber-200/50 text-amber-700",
    };

    const handleBack = () => {
        navigate(ROUTES.USERS_LIST);
    };

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                {/* Header Left: Breadcrumbs + Title + Badges */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer flex items-center justify-center border-0 bg-transparent text-slate-600 shrink-0"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <div className="mb-0.5">
                            <Breadcrumbs
                                icon={Users}
                                items={[
                                    { label: t('detail.breadcrumb_users', 'Người dùng'), path: ROUTES.USERS_LIST },
                                    { 
                                        label: user?.fullName || '...',
                                        isRaw: true
                                    },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                {isLoading || !user ? (
                                    <div className="flex items-center gap-2 h-6">
                                        <Skeleton className="w-40 h-5 rounded-md" />
                                        <Skeleton className="w-12 h-4 rounded-full" />
                                        <Skeleton className="w-16 h-4 rounded-full" />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                            {user.fullName}
                                            {isSelf && (
                                                <span className="text-[9px] bg-[#14b8a6]/10 text-[#14b8a6] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                    {t("table.you_badge")}
                                                </span>
                                            )}
                                        </h1>
                                        <div className="flex items-center gap-1">
                                            {/* Role Badge */}
                                            <button
                                                disabled={isSelf}
                                                onClick={onRoleChange}
                                                className={`
                                                    inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase
                                                    ${roleBadgeColors[user.role] || roleBadgeColors.user}
                                                    ${isSelf ? '' : 'cursor-pointer hover:scale-105 active:scale-95'}
                                                `}
                                                title={isSelf ? '' : t('actions.change_role')}
                                            >
                                                {user.role === 'admin' && <ShieldAlert size={9} />}
                                                {t(`roles.${user.role}`)}
                                            </button>

                                            {/* Status Badge */}
                                            <button
                                                disabled={isSelf}
                                                onClick={onLockToggle}
                                                className={`
                                                    inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase
                                                    ${statusBadgeColors[user.status] || statusBadgeColors.active}
                                                    ${isSelf ? '' : 'cursor-pointer hover:scale-105 active:scale-95'}
                                                `}
                                                title={isSelf ? '' : user.status === 'active' ? t('actions.block') : t('actions.unblock')}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    user.status === 'active' ? 'bg-emerald-500'
                                                    : user.status === 'pending' ? 'bg-amber-400'
                                                    : 'bg-rose-500'
                                                }`}></span>
                                                {t(`status.${user.status}`)}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Subtitle username & joined date */}
                            {isLoading || !user ? (
                                <Skeleton className="w-32 h-3 rounded-md mt-0.5" />
                            ) : (
                                <p className="text-slate-400 text-[11px] font-semibold leading-none mt-0.5">
                                    {user.username} &middot; {t('detail.joined', 'Tham gia')} {user.joinedDate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Right: Action Buttons */}
                <div className="flex items-center gap-2">
                    {isLoading || !user ? (
                        <>
                            <Skeleton className="w-24 h-9 rounded-xl" />
                            <Skeleton className="w-28 h-9 rounded-xl" />
                        </>
                    ) : (
                        <>
                            <Link
                                to={ROUTES.USERS_EDIT.replace(':id', String(user.id))}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer h-9"
                            >
                                <Edit2 size={12} />
                                <span>{t('actions.edit', 'Chỉnh sửa')}</span>
                            </Link>

                            {user.status === 'active' ? (
                                <button
                                    disabled={isSelf}
                                    onClick={onLockToggle}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer h-9"
                                >
                                    <Ban size={12} />
                                    <span>{t('actions.block', 'Khóa')}</span>
                                </button>
                            ) : (
                                <button
                                    disabled={isSelf}
                                    onClick={onLockToggle}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer h-9"
                                >
                                    <LockOpen size={12} />
                                    <span>{t('actions.unblock', 'Mở khóa')}</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
