/** Raw backend settings payload (nested groups) for GET /admin/settings */
export const mockRawSettings: Record<string, Record<string, unknown>> = {
  general: {
    hotline: '1900 1234',
    email: 'support@danangtrip.vn',
    address: '123 Bạch Đằng, Hải Châu, Đà Nẵng',
    support_hours: '08:00 - 22:00',
  },
  brand: {
    website_name: 'DaNangTrip',
    logo: 'https://cdn.example.com/logo.png',
    favicon: 'https://cdn.example.com/favicon.ico',
  },
  social: {
    facebook: 'https://facebook.com/danangtrip',
    instagram: '',
    youtube: '',
    tiktok: '',
    zalo: '',
  },
  payment: {
    sepay: true,
    cod: true,
    vnpay: false,
    momo: false,
    zalopay: false,
  },
  policy: {
    terms: 'https://danangtrip.vn/terms',
    privacy: 'https://danangtrip.vn/privacy',
    data_protection: '',
  },
  seo: {
    meta_title: 'DaNangTrip - Tour Đà Nẵng',
    meta_description: 'Khám phá Đà Nẵng cùng DaNangTrip với các tour chất lượng cao và giá tốt nhất.',
    og_image: '',
  },
  chatbot: {
    enabled: true,
    clarification_attempt_limit: 2,
    cache_ttl_seconds: 86400,
    cache: {
      threshold_transactional: 0.97,
      threshold_faq: 0.92,
    },
  },
};

export const updatedGeneralContact = {
  hotline: '1900 8888',
  email: 'support-new@danangtrip.vn',
};

export const updatedBrandName = 'DaNangTrip V2';
