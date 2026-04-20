import { toNumberSafe } from './safeConverters';

/**
 * Formats a number to Vietnamese currency format (VNĐ)
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
    const value = toNumberSafe(amount, 0);
    return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Computes the discounted price with safety clamping
 * @param price Original price
 * @param discount Discount percent (0-100)
 */
export const computeDiscountedPrice = (
    price?: number | string | null,
    discount?: number | string | null
): number => {
    const safePrice = Math.max(0, toNumberSafe(price, 0));
    const safeDiscount = Math.min(100, Math.max(0, toNumberSafe(discount, 0)));
    return Math.round(safePrice * (1 - safeDiscount / 100));
};
