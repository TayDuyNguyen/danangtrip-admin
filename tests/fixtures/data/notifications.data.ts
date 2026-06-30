import type { RawNotificationItem } from '@/types/notification';
import type { RawUserItem } from './users.data';

const baseDate = '2026-06-01T10:00:00.000Z';

export const notificationRecipientUser = {
  id: 42,
  full_name: 'Test User',
  email: 'user@test.com',
  username: 'test_user',
};

export const notificationRecipientUserRaw: RawUserItem = {
  id: notificationRecipientUser.id,
  full_name: notificationRecipientUser.full_name,
  email: notificationRecipientUser.email,
  username: notificationRecipientUser.username,
  avatar: null,
  role: 'user',
  status: 'active',
  phone: '0905000042',
  birthdate: null,
  gender: null,
  city: 'Da Nang',
  last_login_at: baseDate,
  email_verified_at: baseDate,
  orders_count: 2,
  reviews_count: 1,
  bookings_count: 2,
  favorites_count: 1,
  total_spend: 1500000,
  created_at: '2026-01-10T08:00:00.000Z',
  updated_at: baseDate,
};

function buildNotification(
  overrides: Partial<RawNotificationItem> & Pick<RawNotificationItem, 'id' | 'title'>
): RawNotificationItem {
  return {
    id: overrides.id,
    user_id: overrides.user_id ?? notificationRecipientUser.id,
    type: overrides.type ?? 'system',
    title: overrides.title,
    content: overrides.content ?? 'Nội dung thông báo mẫu cho automation.',
    data: overrides.data ?? null,
    is_read: overrides.is_read ?? false,
    read_at: overrides.read_at ?? null,
    created_at: overrides.created_at ?? baseDate,
    user: overrides.user ?? {
      id: notificationRecipientUser.id,
      full_name: notificationRecipientUser.full_name,
      email: notificationRecipientUser.email,
    },
  };
}

export const primaryNotification = buildNotification({
  id: 1,
  title: 'Khuyến mãi hè 2026',
  content: 'Giảm giá 10% các tour biển trong tháng 6.',
  type: 'promotion',
  is_read: true,
  read_at: '2026-06-20T11:00:00.000Z',
  created_at: '2026-06-20T10:00:00.000Z',
});

export const unreadSystemNotification = buildNotification({
  id: 2,
  title: 'Bảo trì hệ thống',
  content: 'Hệ thống bảo trì từ 02:00 đến 04:00.',
  type: 'system',
  is_read: false,
  created_at: '2026-06-19T08:00:00.000Z',
});

export const bookingNotification = buildNotification({
  id: 3,
  title: 'Xác nhận đặt tour',
  content: 'Đơn BK-2026-100 đã được xác nhận.',
  type: 'booking',
  is_read: true,
  read_at: '2026-06-18T09:00:00.000Z',
  created_at: '2026-06-18T09:00:00.000Z',
});

export const bulkSendForm = {
  title: 'Khuyến mãi hè 2026',
  content: 'Giảm giá 10% các tour biển...',
  link: '/promotions/summer-2026',
};

export const individualSendForm = {
  title: 'Thông báo cá nhân',
  content: 'Bạn có voucher mới trong tài khoản.',
};

export const mockNotificationSearchKeyword = 'Khuyến mãi';

export const expectedNotificationStats = {
  total: 12,
  read: 7,
  unread: 5,
};

export const mockNotificationListRows: RawNotificationItem[] = [
  primaryNotification,
  unreadSystemNotification,
  bookingNotification,
  ...Array.from({ length: 9 }, (_, i) =>
    buildNotification({
      id: 10 + i,
      title: `Thông báo bổ sung ${i + 1}`,
      content: `Nội dung thông báo số ${i + 1}`,
      type: i % 2 === 0 ? 'rating' : 'promotion',
      is_read: i % 3 === 0,
      read_at: i % 3 === 0 ? `2026-06-0${(i % 5) + 4}T10:00:00.000Z` : null,
      created_at: `2026-06-${String(4 + i).padStart(2, '0')}T10:00:00.000Z`,
    })
  ),
];
