import { useState } from 'react';
import { Shield, ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChangeRoleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (role: 'admin' | 'user') => void;
    currentRole: 'admin' | 'user';
    isUpdating: boolean;
}

export const ChangeRoleDialog = ({
    isOpen,
    onClose,
    onConfirm,
    currentRole,
    isUpdating,
}: ChangeRoleDialogProps) => {
    const { t } = useTranslation('user');
    const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(currentRole);

    const handleClose = () => {
        setSelectedRole(currentRole);
        onClose();
    };

    if (!isOpen) return null;

    const roleDetails = [
        {
            role: 'user' as const,
            title: t('roles.user', 'Khách du lịch'),
            desc: t('detail.role_user_desc', 'Tài khoản người dùng thông thường, chỉ có thể xem địa điểm, đặt tour, gửi bình luận đánh giá.'),
            icon: Shield,
            color: 'text-slate-500 bg-slate-50 border-slate-200',
        },
        {
            role: 'admin' as const,
            title: t('roles.admin', 'Quản trị viên'),
            desc: t('detail.role_admin_desc', 'Quyền hạn tối cao. Có khả năng quản lý toàn bộ hệ thống, thêm/sửa/xóa địa điểm, quản lý người dùng, xem báo cáo doanh thu.'),
            icon: ShieldAlert,
            color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-[460px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col font-sans">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center gap-3.5 border-b border-slate-50">
                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Shield size={20} />
                    </span>
                    <div>
                        <h4 className="text-[16px] font-black text-slate-950 leading-tight">
                            {t('actions.change_role_label', 'Thay đổi vai trò')}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1 leading-none font-semibold">
                            {t('detail.role_dialog_subtitle', 'Chọn vai trò tài khoản cho người dùng')}
                        </p>
                    </div>
                </div>

                {/* Body - Choices */}
                <div className="p-6 space-y-4">
                    {roleDetails.map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = selectedRole === item.role;
                        return (
                            <button
                                key={item.role}
                                onClick={() => setSelectedRole(item.role)}
                                className={`
                                    w-full p-4 border rounded-2xl flex items-start gap-4 text-left transition-all duration-200 cursor-pointer select-none
                                    ${isSelected 
                                        ? 'border-[#14B8A6] bg-[#14B8A6]/3 shadow-xs' 
                                        : 'border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-200'}
                                `}
                            >
                                <span className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                                    <IconComponent size={16} />
                                </span>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-black text-slate-900 leading-snug">
                                            {item.title}
                                        </h5>
                                        {isSelected && (
                                            <span className="w-5 h-5 rounded-full bg-[#14B8A6] text-white flex items-center justify-center">
                                                <Check size={10} strokeWidth={3} />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    {/* Alert Warning if elevating to admin */}
                    {selectedRole === 'admin' && currentRole !== 'admin' && (
                        <div className="p-3.5 bg-amber-50/80 border border-amber-100/80 text-amber-800 rounded-xl flex gap-3 text-[11px] leading-relaxed font-semibold">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <div>
                                {t('detail.role_elevate_warning', 'Chú ý: Việc nâng cấp người dùng lên làm Quản trị viên (Admin) sẽ trao cho họ đầy đủ mọi quyền hạn sửa đổi dữ liệu hệ thống. Hãy cân nhắc kỹ trước khi xác nhận.')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="p-6 pt-2 flex items-center justify-end gap-3 border-t border-slate-50">
                    <button
                        onClick={handleClose}
                        disabled={isUpdating}
                        className="px-4.5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 select-none active:scale-97"
                    >
                        {t('common:cancel', 'Hủy')}
                    </button>
                    <button
                        onClick={() => onConfirm(selectedRole)}
                        disabled={isUpdating || selectedRole === currentRole}
                        className="px-4.5 py-2.5 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-100 hover:shadow-teal-300 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer select-none active:scale-97 flex items-center gap-1.5"
                    >
                        {isUpdating && <div className="w-3.5 h-3.5 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>}
                        <span>{t('common:save', 'Lưu thay đổi')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
