export interface GeneralSettings {
    hotline: string;
    email: string;
    address: string;
    support_hours: string;
}

export interface BrandSettings {
    website_name: string;
    logo: string;
    favicon: string;
}

export interface SocialSettings {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    zalo: string;
}

export interface PaymentSettings {
    sepay: boolean;
    cod: boolean;
    vnpay: boolean;
    momo: boolean;
    zalopay: boolean;
}

export interface PolicySettings {
    terms: string;
    privacy: string;
    data_protection: string;
}

export interface SEOSettings {
    meta_title: string;
    meta_description: string;
    og_image: string;
}

export interface ChatbotCacheSettings {
    threshold_transactional: number;
    threshold_faq: number;
}

export interface ChatbotSettings {
    enabled: boolean;
    clarification_attempt_limit: number;
    cache_ttl_seconds: number;
    cache: ChatbotCacheSettings;
}

export interface WebsiteSettings {
    general: GeneralSettings;
    brand: BrandSettings;
    social: SocialSettings;
    payment: PaymentSettings;
    policy: PolicySettings;
    seo: SEOSettings;
    chatbot: ChatbotSettings;
}
