import type { RawContactItem } from '@/dataHelper/contact.dataHelper';

function buildContact(
  partial: Pick<RawContactItem, 'id' | 'name' | 'status'> &
    Partial<
      Pick<
        RawContactItem,
        | 'email'
        | 'phone'
        | 'subject'
        | 'message'
        | 'reply'
        | 'replied_at'
        | 'replied_by'
        | 'replier'
        | 'created_at'
      >
    >
): RawContactItem {
  const now = '2026-06-20T08:00:00Z';
  return {
    id: partial.id,
    name: partial.name,
    email: partial.email ?? `contact${partial.id}@example.com`,
    phone: partial.phone !== undefined ? partial.phone : '0909000000',
    subject: partial.subject ?? `Chủ đề liên hệ #${partial.id}`,
    message: partial.message ?? `Nội dung yêu cầu mẫu #${partial.id}`,
    status: partial.status,
    replied_by: partial.replied_by ?? null,
    replied_at: partial.replied_at ?? null,
    reply: partial.reply ?? null,
    created_at: partial.created_at ?? now,
    updated_at: partial.created_at ?? now,
    replier: partial.replier ?? null,
  };
}

export const mockContactSearchKeyword = 'Văn An';

/** Contact mới có SĐT — dùng search + select + reply */
export const primaryNewContact = buildContact({
  id: 1,
  name: 'Nguyễn Văn An',
  email: 'nguyen.van.an@example.com',
  phone: '0901234567',
  status: 'new',
  subject: 'Hỏi tour Bà Nà Hills',
  message: 'Xin tư vấn tour Bà Nà cho 4 người cuối tuần.',
  created_at: '2026-06-22T10:00:00Z',
});

/** Đã đọc, có phone */
export const readContactWithPhone = buildContact({
  id: 2,
  name: 'Trần Thị Bình',
  email: 'binh.tran@example.com',
  phone: '0912345678',
  status: 'read',
  subject: 'Yêu cầu báo giá combo',
  message: 'Cho mình báo giá combo 3 ngày 2 đêm.',
  created_at: '2026-06-21T09:00:00Z',
});

/** Đã trả lời — hiển thị lịch sử reply */
export const repliedContact = buildContact({
  id: 3,
  name: 'Lê Văn Cường',
  email: 'cuong.le@example.com',
  phone: '0923456789',
  status: 'replied',
  subject: 'Cảm ơn hỗ trợ',
  message: 'Cảm ơn team đã tư vấn nhanh.',
  reply: 'Chúng tôi rất vui được hỗ trợ bạn. Hẹn gặp lại!',
  replied_by: 1,
  replied_at: '2026-06-20T14:00:00Z',
  replier: { id: 1, full_name: 'Admin Demo', username: 'admin' },
  created_at: '2026-06-20T08:00:00Z',
});

/** Không có SĐT */
export const noPhoneContact = buildContact({
  id: 4,
  name: 'Phạm Không SĐT',
  email: 'nophone@example.com',
  phone: null,
  status: 'new',
  subject: 'Hỏi giờ mở cửa',
  message: 'Địa điểm mở cửa mấy giờ?',
  created_at: '2026-06-19T11:00:00Z',
});

/** Message nhiều dòng */
export const multilineContact = buildContact({
  id: 5,
  name: 'Hoàng Nhiều Dòng',
  email: 'multiline@example.com',
  status: 'read',
  subject: 'Phản hồi chi tiết',
  message: 'Dòng một yêu cầu.\nDòng hai bổ sung.\nDòng ba kết thúc.',
  created_at: '2026-06-18T12:00:00Z',
});

/** Subject dài */
export const longSubjectContact = buildContact({
  id: 6,
  name: 'Võ Subject Dài',
  email: 'longsub@example.com',
  status: 'new',
  subject:
    'Yêu cầu tư vấn tour dài hạn khắp miền Trung với nhiều điểm dừng và yêu cầu đặc biệt về lịch trình',
  message: 'Cần lịch trình chi tiết cho nhóm 20 người.',
  created_at: '2026-06-17T13:00:00Z',
});

/** Xóa trong test delete */
export const deletableContact = buildContact({
  id: 7,
  name: 'Nguyễn Xóa Thử',
  email: 'delete.me@example.com',
  status: 'read',
  subject: 'Liên hệ xóa thử',
  message: 'Contact dùng cho test xóa.',
  created_at: '2026-06-16T14:00:00Z',
});

export const mockContactListRows: RawContactItem[] = [
  primaryNewContact,
  readContactWithPhone,
  repliedContact,
  noPhoneContact,
  multilineContact,
  longSubjectContact,
  deletableContact,
  buildContact({ id: 8, name: 'Đặng H', status: 'read', created_at: '2026-06-15T10:00:00Z' }),
  buildContact({ id: 9, name: 'Bùi I', status: 'new', created_at: '2026-06-14T10:00:00Z' }),
  buildContact({ id: 10, name: 'Đỗ J', status: 'replied', reply: 'OK', replied_at: '2026-06-13T10:00:00Z', replier: { id: 1, full_name: 'Admin', username: 'admin' }, created_at: '2026-06-13T09:00:00Z' }),
  buildContact({ id: 11, name: 'Hồ Page Hai', status: 'read', created_at: '2026-06-12T10:00:00Z' }),
  buildContact({ id: 12, name: 'Lý Cuối Trang', status: 'new', created_at: '2026-06-11T10:00:00Z' }),
];

export const expectedContactStats = {
  total: mockContactListRows.length,
  new: mockContactListRows.filter((c) => c.status === 'new').length,
  read: mockContactListRows.filter((c) => c.status === 'read').length,
  replied: mockContactListRows.filter((c) => c.status === 'replied').length,
};

// Sanity: new=5, read=5, replied=2, total=12

export const validReplyText = 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ hỗ trợ sớm nhất.';
