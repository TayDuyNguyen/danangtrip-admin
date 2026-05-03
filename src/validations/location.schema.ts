import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const getLocationFilterSchema = () => {
    return yup.object({
        q: yup.string().nullable(),
        category_id: yup.string().nullable(),
        district_id: yup.string().nullable(),
        price_level: yup.string().nullable(),
        status: yup.string().nullable(),
    });
};

export const locationFormSchema = (t: TFunction) => {
    return yup.object({
        name: yup.string().required(t('validation.required')),
        address: yup.string().required(t('validation.required')),
        district_id: yup.number().required(t('validation.required')),
        category_id: yup.number().required(t('validation.required')),
        description: yup.string().required(t('validation.required')),
        price_level: yup.string().oneOf(['free', 'low', 'medium', 'high']).required(t('validation.required')),
        status: yup.string().oneOf(['active', 'inactive']).default('active'),
    });
};
