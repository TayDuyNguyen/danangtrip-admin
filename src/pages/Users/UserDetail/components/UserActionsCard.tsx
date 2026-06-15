import { Edit2, ShieldAlert, ShoppingBag, MessageSquare, Ban, LockOpen, Trash2, ShieldQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import type { UserItem } from '@/dataHelper';

interface UserActionsCardProps {
    user: UserItem;
    isSelf: boolean;
    onLockToggle: () => void;
    onRoleChange: () => void;
    onDelete: () => void;
}

export const UserActionsCard = ({
    user,
    isSelf,
    onLockToggle,
    onRoleChange,
    onDelete,
}: UserActionsCardProps) => {
    const { t } = useTranslation('user');

    const ghostBtnStyle = `
        w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#0F172A]/80 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-97
    `;

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
            <div className="bg-white rounded-[23px] p-6">
                <h3 className="text-[16px] font-black text-[#0F172A] mb-6 flex items-center gap-2">
                    <span className="p-1.5 bg-[#14b8a6]/10 text-[#14b8a6] rounded-lg">
                        <ShieldQuestion size={18} />
                    </span>
                    {t('detail.section_actions', 'Thao tác')}
                </h3>

                <div className="space-y-3 font-sans">
                    <Link
                        to={ROUTES.USERS_EDIT.replace(':id', String(user.id))}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#0F172A]/80 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-97 text-center"
                    >
                        <Edit2 size={13} />
                        <span>{t('actions.edit_info', 'Chỉnh sửa thông tin')}</span>
                    </Link>

                    {/* Change Role Button (Ghost style) */}
                    <button
                        disabled={isSelf}
                        onClick={onRoleChange}
                        className={`${ghostBtnStyle} disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                        <ShieldAlert size={14} />
                        <span>{t('actions.change_role_label', 'Đổi vai trò')}</span>
                    </button>

                    {/* View bookings link */}
                    <Link
                        to={`${ROUTES.BOOKINGS_LIST}?user_id=${user.id}`}
                        className={ghostBtnStyle}
                    >
                        <ShoppingBag size={14} />
                        <span>{t('actions.view_bookings_label', 'Xem đơn đặt tour')}</span>
                    </Link>

                    {/* View reviews link */}
                    <Link
                        to={`${ROUTES.REPORTS_RATINGS}?user_id=${user.id}`}
                        className={ghostBtnStyle}
                    >
                        <MessageSquare size={14} />
                        <span>{t('actions.view_ratings_label', 'Xem đánh giá')}</span>
                    </Link>

                    {/* Status Toggle Block/Unblock */}
                    {user.status === 'active' ? (
                        <button
                            disabled={isSelf}
                            onClick={onLockToggle}
                            className={`
                                w-full inline-flex items-center gap-2.5 px-4 py-2.5 border border-rose-200 bg-white text-rose-600 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none hover:bg-rose-50/70 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-97
                            `}
                        >
                            <Ban size={14} />
                            <span>{t('actions.block', 'Khóa tài khoản')}</span>
                        </button>
                    ) : (
                        <button
                            disabled={isSelf}
                            onClick={onLockToggle}
                            className={`
                                w-full inline-flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-97
                            `}
                        >
                            <LockOpen size={14} />
                            <span>{t('actions.unblock', 'Mở khóa')}</span>
                        </button>
                    )}

                    {/* Delete button */}
                    <button
                        disabled={isSelf}
                        onClick={onDelete}
                        className={`
                            w-full inline-flex items-center gap-2.5 px-4 py-2.5 border border-rose-200 bg-white text-rose-600 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none hover:bg-rose-50/70 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-97
                        `}
                    >
                        <Trash2 size={14} />
                        <span>{t('actions.delete', 'Xóa tài khoản')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
