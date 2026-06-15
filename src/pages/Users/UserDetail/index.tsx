import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/routes/routes';
import { useAuth } from '@/store';
import {
    useAdminUserDetailQuery,
    useUserBookingsQuery,
    useUserRatingsQuery,
    useUserMutations
} from '@/hooks/useUserQueries';

import { UserDetailHeader } from './components/UserDetailHeader';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { UserBookingsTable } from './components/UserBookingsTable';
import { UserRatingsList } from './components/UserRatingsList';
import { UserStatsCards } from './components/UserStatsCards';
import { UserAccountSidebar } from './components/UserAccountSidebar';
import { UserActionsCard } from './components/UserActionsCard';
import { ChangeRoleDialog } from './components/ChangeRoleDialog';
import { ConfirmDeleteUserDialog } from './components/ConfirmDeleteUserDialog';
import { showMutationErrorToast } from '@/utils/mutationErrorToast';
import { Skeleton } from '@/components/ui/Skeleton';

const UserDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation('user');
    const { user: currentAdmin } = useAuth();

    // Dialog active states
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Self check
    const isSelf = currentAdmin?.id === Number(id);

    // Queries
    const {
        data: user,
        isLoading: isUserLoading,
        error: userError,
        refetch: refetchUser
    } = useAdminUserDetailQuery(id || '');

    const {
        data: bookingsResponse,
        isLoading: isBookingsLoading
    } = useUserBookingsQuery(id || '', 1, 5);

    const {
        data: ratingsResponse,
        isLoading: isRatingsLoading
    } = useUserRatingsQuery(id || '', 1, 3);

    // Mutations
    const {
        updateRoleMutation,
        updateStatusMutation,
        deleteMutation
    } = useUserMutations();

    // Data parsing
    const bookings = bookingsResponse?.data || [];
    const bookingsTotal = bookingsResponse?.meta?.total || 0;

    const ratings = ratingsResponse?.data || [];
    const ratingsTotal = ratingsResponse?.meta?.total || 0;

    // Handlers
    const handleStatusToggle = () => {
        if (!id || !user) return;

        const nextStatus = user.status === 'active' ? 'banned' : 'active';
        
        updateStatusMutation.mutate(
            { id, status: nextStatus },
            {
                onSuccess: () => {
                    toast.success(
                        nextStatus === 'banned'
                            ? t('detail.toast_blocked_success', 'Đã khóa tài khoản thành công.')
                            : t('detail.toast_unblocked_success', 'Đã mở khóa tài khoản thành công.')
                    );
                    refetchUser();
                },
                onError: (err) => {
                    showMutationErrorToast(t('detail.toast_status_error'), err);
                }
            }
        );
    };

    const handleRoleChangeSubmit = (newRole: 'admin' | 'user') => {
        if (!id) return;

        updateRoleMutation.mutate(
            { id, role: newRole },
            {
                onSuccess: () => {
                    toast.success(t('detail.toast_role_success', 'Cập nhật vai trò thành công.'));
                    setIsRoleDialogOpen(false);
                    refetchUser();
                },
                onError: (err) => {
                    showMutationErrorToast(t('detail.toast_role_error'), err);
                }
            }
        );
    };

    const handleDeleteSubmit = () => {
        if (!id) return;

        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success(t('detail.toast_delete_success', 'Đã xóa tài khoản vĩnh viễn khỏi hệ thống.'));
                setIsDeleteDialogOpen(false);
                setTimeout(() => {
                    navigate(ROUTES.USERS_LIST);
                }, 100);
            },
            onError: (err) => {
                showMutationErrorToast(t('detail.toast_delete_error'), err);
            }
        });
    };

    // Error states
    if (userError || (!isUserLoading && !user)) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/20 via-slate-200/25 to-slate-100/10 shadow-xs max-w-lg mx-auto mt-12 animate-in fade-in duration-300">
                <div className="bg-white rounded-[23px] p-8 text-center flex flex-col items-center justify-center font-sans">
                    <AlertCircle size={40} className="text-rose-500 mb-4" />
                    <h3 className="text-slate-900 text-lg font-bold">
                        {t('detail.not_found', 'Không tìm thấy tài khoản')}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1.5 mb-6">
                        {t('detail.not_found_desc', 'Tài khoản người dùng này không tồn tại hoặc đã bị xóa.')}
                    </p>
                    <button
                        onClick={() => navigate(ROUTES.USERS_LIST)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-[#14b8a6] text-white rounded-xl shadow-md hover:bg-[#0f766e] active:scale-97 transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>{t('detail.back_to_list', 'Quay lại danh sách')}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Sticky Header */}
            <UserDetailHeader
                user={user}
                isSelf={isSelf}
                onLockToggle={handleStatusToggle}
                onRoleChange={() => setIsRoleDialogOpen(true)}
                isLoading={isUserLoading}
            />

            {/* Main Content Area */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8 animate-in fade-in duration-300">
                {isUserLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Columns Skeletons */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Info Card Skeleton */}
                            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs space-y-6">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <Skeleton className="w-48 h-6 rounded-md" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                    <div className="flex flex-col items-center gap-3 shrink-0">
                                        <Skeleton className="w-24 h-24 rounded-full animate-pulse" />
                                        <Skeleton className="w-16 h-5 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                                                <Skeleton className="w-20 h-3 rounded-md" />
                                                <Skeleton className="w-32 h-5 rounded-md mt-1" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bookings Table Skeleton */}
                            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                        <Skeleton className="w-48 h-6 rounded-md" />
                                    </div>
                                    <Skeleton className="w-20 h-4 rounded-md" />
                                </div>
                                <div className="space-y-3 mt-4">
                                    <Skeleton className="w-full h-10 rounded-md" />
                                    <Skeleton className="w-full h-12 rounded-md" />
                                    <Skeleton className="w-full h-12 rounded-md" />
                                    <Skeleton className="w-full h-12 rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column Skeletons */}
                        <div className="space-y-6">
                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                        <Skeleton className="w-16 h-6 rounded-md" />
                                        <Skeleton className="w-20 h-3 rounded-md" />
                                    </div>
                                ))}
                            </div>

                            {/* Account Sidebar Skeleton */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                                <Skeleton className="w-32 h-5 rounded-md" />
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                            <Skeleton className="w-20 h-4 rounded-md" />
                                            <Skeleton className="w-24 h-4 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Card Skeleton */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                                <Skeleton className="w-32 h-5 rounded-md" />
                                <Skeleton className="w-full h-11 rounded-xl" />
                                <Skeleton className="w-full h-11 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : (
                    user && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Left Columns (Profile + Bookings Table + Ratings List) */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Personal Info Card */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-75">
                                    <PersonalInfoCard user={user} />
                                </div>

                                {/* Recent Bookings Table */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
                                    <UserBookingsTable
                                        bookings={bookings}
                                        totalCount={bookingsTotal}
                                        isLoading={isBookingsLoading}
                                        userId={user.id}
                                    />
                                </div>

                                {/* Recent Ratings List */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                                    <UserRatingsList
                                        ratings={ratings}
                                        totalCount={ratingsTotal}
                                        isLoading={isRatingsLoading}
                                        userId={user.id}
                                    />
                                </div>
                            </div>

                            {/* Right Columns (Stats + Metadata Card + Actions Card) */}
                            <div className="space-y-6 lg:sticky lg:top-24">
                                {/* Stats Card */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-100">
                                    <UserStatsCards
                                        bookingsCount={user.bookingsCount}
                                        ratingsCount={user.reviewsCount} // Note mapper maps raw.reviews_count to user.reviewsCount
                                        favoritesCount={user.favoritesCount}
                                        totalSpend={user.totalSpend}
                                    />
                                </div>

                                {/* Account Settings Status Card */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                                    <UserAccountSidebar user={user} />
                                </div>

                                {/* Quick actions panel */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                                    <UserActionsCard
                                        user={user}
                                        isSelf={isSelf}
                                        onLockToggle={handleStatusToggle}
                                        onRoleChange={() => setIsRoleDialogOpen(true)}
                                        onDelete={() => setIsDeleteDialogOpen(true)}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Change Role Dialog */}
            {user && (
                <>
                    <ChangeRoleDialog
                        key={`${user.id}-${user.role}`}
                        isOpen={isRoleDialogOpen}
                        onClose={() => setIsRoleDialogOpen(false)}
                        onConfirm={handleRoleChangeSubmit}
                        currentRole={user.role}
                        isUpdating={updateRoleMutation.isPending}
                    />

                    {/* Confirm Delete Dialog */}
                    <ConfirmDeleteUserDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        onConfirm={handleDeleteSubmit}
                        userName={user.fullName}
                        isDeleting={deleteMutation.isPending}
                    />
                </>
            )}
        </div>
    );
};

export default UserDetail;
