import type { AdminRawPaymentItem } from '@/dataHelper/payment.dataHelper';

const baseDate = '2026-06-15T10:00:00.000Z';

function buildPayment(
  partial: Partial<AdminRawPaymentItem> & Pick<AdminRawPaymentItem, 'id' | 'transaction_code' | 'payment_status' | 'payment_method'>
): AdminRawPaymentItem {
  return {
    amount: 2500000,
    received_amount: 2500000,
    short_amount: 0,
    excess_amount: 0,
    reconciliation_status: 'matched',
    refunded_at: null,
    refund_reason: null,
    paid_at: baseDate,
    created_at: baseDate,
    updated_at: baseDate,
    latest_refund_request: null,
    booking: {
      id: 101,
      booking_code: 'BK-2026-001',
      total_amount: 2500000,
      customer_name: 'Tran Thu Ha',
      customer_email: 'hatran@gmail.com',
      tour_name: 'Ba Na Hills Full Day',
      tour_thumbnail: 'https://picsum.photos/seed/tour1/80',
    },
    ...partial,
  };
}

export const primarySuccessPayment = buildPayment({
  id: 1,
  transaction_code: 'PAY-2026-0001',
  payment_status: 'success',
  payment_method: 'sepay',
});

export const vnpaySuccessPayment = buildPayment({
  id: 2,
  transaction_code: 'PAY-2026-0002',
  payment_status: 'success',
  payment_method: 'vnpay',
  booking: {
    id: 102,
    booking_code: 'BK-2026-002',
    total_amount: 1800000,
    customer_name: 'Nguyen Van A',
    customer_email: 'nguyenvana@test.com',
    tour_name: 'Son Tra Peninsula',
  },
});

export const pendingPayment = buildPayment({
  id: 3,
  transaction_code: 'PAY-2026-0003',
  payment_status: 'pending',
  payment_method: 'bank_transfer',
  paid_at: null,
  booking: {
    id: 103,
    booking_code: 'BK-2026-003',
    total_amount: 3200000,
    customer_name: 'Le Thi B',
    customer_email: 'lethib@test.com',
    tour_name: 'Hoi An Ancient Town',
  },
});

export const failedPayment = buildPayment({
  id: 4,
  transaction_code: 'PAY-2026-0004',
  payment_status: 'failed',
  payment_method: 'momo',
  paid_at: null,
});

export const refundedPayment = buildPayment({
  id: 5,
  transaction_code: 'PAY-2026-0005',
  payment_status: 'refunded',
  payment_method: 'sepay',
  refunded_at: '2026-06-16T08:00:00.000Z',
  refund_reason: 'Khach huy tour',
  booking: {
    id: 105,
    booking_code: 'BK-2026-005',
    total_amount: 1500000,
    customer_name: 'Pham Van C',
    customer_email: 'phamvanc@test.com',
    tour_name: 'Marble Mountains',
  },
});

export const orphanSuccessPayment = buildPayment({
  id: 6,
  transaction_code: 'PAY-2026-ORPHAN',
  payment_status: 'success',
  payment_method: 'sepay',
  booking: null,
});

export const partialPayment = buildPayment({
  id: 7,
  transaction_code: 'PAY-2026-PARTIAL',
  payment_status: 'success',
  payment_method: 'bank_transfer',
  amount: 3000000,
  received_amount: 1500000,
  short_amount: 1500000,
  reconciliation_status: 'partial',
  booking: {
    id: 107,
    booking_code: 'BK-2026-007',
    total_amount: 3000000,
    customer_name: 'Vo Thi D',
    customer_email: 'vothid@test.com',
    tour_name: 'My Khe Beach',
  },
});

export const zeroAmountPayment = buildPayment({
  id: 9,
  transaction_code: 'PAY-2026-ZERO',
  payment_status: 'success',
  payment_method: 'sepay',
  amount: 0,
  received_amount: 0,
});

export const successNoPaidAtPayment = buildPayment({
  id: 10,
  transaction_code: 'PAY-2026-NOPAID',
  payment_status: 'success',
  payment_method: 'sepay',
  paid_at: null,
});

export const refundedNoReasonPayment = buildPayment({
  id: 11,
  transaction_code: 'PAY-2026-NOREASON',
  payment_status: 'refunded',
  payment_method: 'sepay',
  refunded_at: '2026-06-17T08:00:00.000Z',
  refund_reason: null,
});

export const paymentWithAvatar = buildPayment({
  id: 12,
  transaction_code: 'PAY-2026-AVATAR',
  payment_status: 'success',
  payment_method: 'vnpay',
  booking: {
    id: 112,
    booking_code: 'BK-2026-012',
    total_amount: 2200000,
    customer_name: 'Avatar User',
    customer_email: 'avatar@test.com',
    customer_avatar: 'https://picsum.photos/seed/avatar/80',
    tour_name: 'Avatar Tour',
    tour_thumbnail: 'https://picsum.photos/seed/tour-avatar/80',
  },
});

export const refundRequestWithBankPayment = buildPayment({
  id: 13,
  transaction_code: 'PAY-2026-BANKQR',
  payment_status: 'success',
  payment_method: 'sepay',
  latest_refund_request: {
    id: 802,
    refund_code: 'RF-802',
    booking_code: 'BK-2026-013',
    reason_type: 'cancellation',
    status: 'pending',
    requested_amount: 2500000,
    approved_amount: 2500000,
    refund_percent: 100,
    reason: 'Khach yeu cau hoan',
    bank_code: 'VCB',
    account_no: '1234567890',
    account_name: 'TRAN THU HA',
  },
  booking: {
    id: 113,
    booking_code: 'BK-2026-013',
    total_amount: 2500000,
    customer_name: 'Bank QR User',
    customer_email: 'bankqr@test.com',
    tour_name: 'QR Refund Tour',
  },
});

export const pendingRefundPayment = buildPayment({
  id: 8,
  transaction_code: 'PAY-2026-REFREQ',
  payment_status: 'success',
  payment_method: 'sepay',
  latest_refund_request: {
    id: 801,
    refund_code: 'RF-801',
    booking_code: 'BK-2026-008',
    reason_type: 'cancellation',
    status: 'pending',
    requested_amount: 2000000,
    approved_amount: 2000000,
    refund_percent: 100,
    reason: 'Khach doi lich',
  },
  booking: {
    id: 108,
    booking_code: 'BK-2026-008',
    total_amount: 2000000,
    customer_name: 'Hoang Van E',
    customer_email: 'hoangvane@test.com',
    tour_name: 'Da Nang City Tour',
  },
});

export const mockPaymentSearchKeyword = 'PAY-2026-0001';
export const mockBookingSearchKeyword = 'BK-2026-002';

export const mockPaymentListRows: AdminRawPaymentItem[] = [
  primarySuccessPayment,
  vnpaySuccessPayment,
  pendingPayment,
  failedPayment,
  refundedPayment,
  orphanSuccessPayment,
  partialPayment,
  pendingRefundPayment,
  zeroAmountPayment,
  successNoPaidAtPayment,
  refundedNoReasonPayment,
  paymentWithAvatar,
  refundRequestWithBankPayment,
  ...Array.from({ length: 6 }, (_, i) =>
    buildPayment({
      id: 20 + i,
      transaction_code: `PAY-2026-EXTRA-${i + 1}`,
      payment_status: i % 2 === 0 ? 'success' : 'pending',
      payment_method: i % 3 === 0 ? 'zalopay' : 'sepay',
      booking: {
        id: 200 + i,
        booking_code: `BK-2026-E${i + 1}`,
        total_amount: 1000000 + i * 100000,
        customer_name: `Extra User ${i + 1}`,
        customer_email: `extra${i + 1}@example.com`,
        tour_name: `Tour Extra ${i + 1}`,
      },
    })
  ),
];

/** Stats computed from first page (10 items) — matches PaymentList client-side logic */
export function computePageStats(rows: AdminRawPaymentItem[]) {
  let totalRevenue = 0;
  let successCount = 0;
  let pendingCount = 0;
  let refundedAmount = 0;
  rows.forEach((p) => {
    const status = p.reconciliation_status === 'partial' ? 'partially_paid' : p.payment_status;
    const amount = Number(p.amount);
    if (status === 'success') {
      totalRevenue += amount;
      successCount += 1;
    } else if (status === 'pending') {
      pendingCount += 1;
    } else if (status === 'refunded') {
      refundedAmount += amount;
    }
  });
  return { totalRevenue, successCount, pendingCount, refundedAmount };
}

export const expectedPage1Stats = computePageStats(mockPaymentListRows.slice(0, 10));

export const refundFormValid = {
  refund_reason: 'Khach huy tour som hon du kien',
  refund_bank_code: 'VCB',
  refund_account_no: '1234567890',
  refund_account_name: 'TRAN THU HA',
  transfer_reference: 'FT260615001',
};
