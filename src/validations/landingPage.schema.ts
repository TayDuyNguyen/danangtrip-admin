import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const getLandingPageSchema = (t: TFunction) => 
    yup.object({
        title: yup
            .string()
            .required(t('validation.title_required', { defaultValue: 'Page title is required' }))
            .max(150, t('validation.title_max', { defaultValue: 'Title must not exceed 150 characters' })),
        slug: yup
            .string()
            .required(t('validation.slug_required', { defaultValue: 'SEO Slug is required' }))
            .max(100)
            .matches(/^[a-z0-9-]+$/, t('validation.slug_invalid', { defaultValue: 'Slug must contain only lowercase letters, numbers, and hyphens' })),
        page_type: yup
            .string()
            .required(t('validation.page_type_required', { defaultValue: 'Please select a landing page type' })),
        status: yup
            .string()
            .required(t('validation.status_required', { defaultValue: 'Please select a status' })),
        intro: yup.string().nullable().max(1000),
        hero_image: yup.string().nullable(),
        seo_title: yup.string().nullable().max(150),
        seo_description: yup.string().nullable().max(1000),
        og_image: yup.string().nullable(),
        filters: yup
            .string()
            .nullable()
            .test('is-json', t('validation.invalid_json', { defaultValue: 'Invalid JSON format' }), (value) => {
                if (!value || value.trim() === '') return true;
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            }),
    }).required();
