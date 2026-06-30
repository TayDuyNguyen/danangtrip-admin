import type { Promotion } from '@/types/promotion.types';

function buildPromotion(
  partial: Pick<Promotion, 'id' | 'code' | 'name' | 'discount_type' | 'discount_value' | 'status'> &
    Partial<
      Pick<
        Promotion,
        | 'description'
        | 'max_discount_amount'
        | 'min_order_amount'
        | 'usage_limit'
        | 'usage_per_user'
        | 'used_count'
        | 'starts_at'
        | 'ends_at'
        | 'created_at'
      >
    >
): Promotion {
  const now = '2026-06-15T10:00:00Z';
  return {
    id: partial.id,
    code: partial.code,
    name: partial.name,
    description: partial.description ?? `Mô tả cho ${partial.code}`,
    discount_type: partial.discount_type,
    discount_value: String(partial.discount_value),
    max_discount_amount:
      partial.max_discount_amount === undefined
        ? partial.discount_type === 'percent'
          ? '300000'
          : null
        : partial.max_discount_amount,
    min_order_amount: partial.min_order_amount ?? '1000000',
    usage_limit: partial.usage_limit ?? 500,
    usage_per_user: partial.usage_per_user ?? 1,
    used_count: partial.used_count ?? 0,
    starts_at: partial.starts_at ?? '2026-06-01T00:00:00Z',
    ends_at: partial.ends_at ?? '2026-12-31T23:59:59Z',
    status: partial.status ?? 'active',
    created_at: partial.created_at ?? now,
    updated_at: now,
  };
}

/** Mirror `17_promotions_seed.sql` + 2 rows for pagination */
export const mockPromotionListRows: Promotion[] = [
  buildPromotion({
    id: 1,
    code: 'DANANG10',
    name: 'Giảm 10% tour Đà Nẵng',
    description: 'Ưu đãi cho các tour nội thành Đà Nẵng, Sơn Trà, Ngũ Hành Sơn và các tuyến biển.',
    discount_type: 'percent',
    discount_value: '10',
    max_discount_amount: '300000',
    min_order_amount: '1000000',
    usage_limit: 500,
    used_count: 42,
    created_at: '2026-06-20T08:00:00Z',
  }),
  buildPromotion({
    id: 2,
    code: 'CENTRAL15',
    name: 'Giảm 15% hành trình miền Trung',
    discount_type: 'percent',
    discount_value: '15',
    max_discount_amount: '500000',
    min_order_amount: '2500000',
    usage_limit: 300,
    used_count: 18,
    created_at: '2026-06-18T08:00:00Z',
  }),
  buildPromotion({
    id: 3,
    code: 'FAMILY200K',
    name: 'Giảm 200.000đ cho gia đình',
    discount_type: 'fixed',
    discount_value: '200000',
    max_discount_amount: null,
    min_order_amount: '1800000',
    starts_at: '2026-07-01T00:00:00Z',
    ends_at: '2026-07-31T23:59:59Z',
    created_at: '2026-06-17T08:00:00Z',
  }),
  buildPromotion({
    id: 4,
    code: 'BANAHILLS300K',
    name: 'Giảm 300.000đ tour Bà Nà Hills',
    discount_type: 'fixed',
    discount_value: '300000',
    max_discount_amount: null,
    min_order_amount: '3000000',
    starts_at: '2026-08-01T00:00:00Z',
    ends_at: '2026-08-31T23:59:59Z',
    created_at: '2026-06-16T08:00:00Z',
  }),
  buildPromotion({
    id: 5,
    code: 'EARLYBIRD8',
    name: 'Ưu đãi đặt sớm 8%',
    discount_type: 'percent',
    discount_value: '8',
    usage_per_user: 2,
    created_at: '2026-06-15T08:00:00Z',
  }),
  buildPromotion({
    id: 6,
    code: 'WELCOME100K',
    name: 'Giảm 100.000đ cho khách mới',
    discount_type: 'fixed',
    discount_value: '100000',
    max_discount_amount: null,
    min_order_amount: '700000',
    usage_limit: 1000,
    created_at: '2026-06-14T08:00:00Z',
  }),
  buildPromotion({
    id: 7,
    code: 'SUMMER2026',
    name: 'Ưu đãi hè Đà Nẵng 2026',
    discount_type: 'percent',
    discount_value: '12',
    max_discount_amount: '400000',
    created_at: '2026-06-13T08:00:00Z',
  }),
  buildPromotion({
    id: 8,
    code: 'FLASH20',
    name: 'Flash sale 20%',
    discount_type: 'percent',
    discount_value: '20',
    max_discount_amount: '600000',
    status: 'inactive',
    created_at: '2026-06-12T08:00:00Z',
  }),
  buildPromotion({
    id: 9,
    code: 'EXPIRED50K',
    name: 'Mã hết hạn 50.000đ',
    discount_type: 'fixed',
    discount_value: '50000',
    max_discount_amount: null,
    min_order_amount: '500000',
    used_count: 12,
    starts_at: '2026-03-01T00:00:00Z',
    ends_at: '2026-05-01T23:59:59Z',
    status: 'expired',
    created_at: '2026-06-11T08:00:00Z',
  }),
  buildPromotion({
    id: 10,
    code: 'VIP25',
    name: 'Ưu đãi VIP 25%',
    discount_type: 'percent',
    discount_value: '25',
    max_discount_amount: '1000000',
    min_order_amount: '5000000',
    usage_limit: 50,
    starts_at: '2026-09-01T00:00:00Z',
    ends_at: '2026-09-30T23:59:59Z',
    created_at: '2026-06-10T08:00:00Z',
  }),
  buildPromotion({
    id: 11,
    code: 'BEACH5',
    name: 'Giảm 5% tour biển',
    discount_type: 'percent',
    discount_value: '5',
    created_at: '2026-06-09T08:00:00Z',
  }),
  buildPromotion({
    id: 12,
    code: 'GROUP150K',
    name: 'Giảm 150k nhóm đông',
    discount_type: 'fixed',
    discount_value: '150000',
    max_discount_amount: null,
    created_at: '2026-06-08T08:00:00Z',
  }),
];

export const primaryPromotionRow = mockPromotionListRows[0]!;
export const inactivePromotionRow = mockPromotionListRows.find((r) => r.code === 'FLASH20')!;
export const expiredPromotionRow = mockPromotionListRows.find((r) => r.code === 'EXPIRED50K')!;
export const fixedPromotionRow = mockPromotionListRows.find((r) => r.code === 'FAMILY200K')!;
export const deletablePromotionRow = mockPromotionListRows.find((r) => r.code === 'WELCOME100K')!;
export const mockPromotionSearchKeyword = 'DANANG10';

export function computePromotionPageStats(rows: Promotion[], total: number) {
  return {
    totalCount: total,
    activeCount: rows.filter((p) => p.status === 'active').length,
    totalUsed: rows.reduce((sum, p) => sum + p.used_count, 0),
  };
}

export const expectedPromotionStatsPage1 = computePromotionPageStats(
  mockPromotionListRows.slice(0, 10),
  mockPromotionListRows.length
);
