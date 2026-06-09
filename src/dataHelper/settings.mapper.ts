import type { WebsiteSettings } from '@/types/settings.types';

/**
 * Maps raw backend settings response to dynamic nested WebsiteSettings view model.
 * (Ánh xạ phản hồi cấu hình thô từ Backend sang View Model cấu trúc lồng nhau)
 */
export const mapRawSettingsToViewModel = (raw: Record<string, Record<string, unknown>> | null | undefined): WebsiteSettings => {
    return {
        general: {
            hotline: (raw?.general?.hotline as string) || '',
            email: (raw?.general?.email as string) || '',
            address: (raw?.general?.address as string) || '',
            support_hours: (raw?.general?.support_hours as string) || '',
        },
        brand: {
            website_name: (raw?.brand?.website_name as string) || '',
            logo: (raw?.brand?.logo as string) || '',
            favicon: (raw?.brand?.favicon as string) || '',
        },
        social: {
            facebook: (raw?.social?.facebook as string) || '',
            instagram: (raw?.social?.instagram as string) || '',
            youtube: (raw?.social?.youtube as string) || '',
            tiktok: (raw?.social?.tiktok as string) || '',
            zalo: (raw?.social?.zalo as string) || '',
        },
        payment: {
            sepay: ((raw?.payment?.sepay ?? raw?.payment?.payos) as boolean | undefined) !== false, // default true
            cod: raw?.payment?.cod !== false,     // default true
            vnpay: !!raw?.payment?.vnpay,
            momo: !!raw?.payment?.momo,
            zalopay: !!raw?.payment?.zalopay,
        },
        policy: {
            terms: (raw?.policy?.terms as string) || '',
            privacy: (raw?.policy?.privacy as string) || '',
            data_protection: (raw?.policy?.data_protection as string) || '',
        },
        seo: {
            meta_title: (raw?.seo?.meta_title as string) || '',
            meta_description: (raw?.seo?.meta_description as string) || '',
            og_image: (raw?.seo?.og_image as string) || '',
        },
    };
};
