import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const promotionSchema = (t: TFunction) => 
    yup.object({
        code: yup
            .string()
            .required(t('promotions:validation.code_required'))
            .min(3, t('promotions:validation.code_min'))
            .matches(/^[A-Z0-9_-]+$/i, t('promotions:validation.code_pattern')),
        name: yup
            .string()
            .required(t('promotions:validation.name_required'))
            .max(150),
        description: yup
            .string()
            .nullable()
            .optional(),
        discount_type: yup
            .string()
            .oneOf(['percent', 'fixed'] as const)
            .required(),
        discount_value: yup
            .number()
            .typeError(t('promotions:validation.discount_value_required'))
            .required(t('promotions:validation.discount_value_required'))
            .min(0.01, t('promotions:validation.discount_value_min'))
            .when('discount_type', {
                is: 'percent',
                then: (schema) => schema.max(100, t('promotions:validation.discount_value_percent_max')),
                otherwise: (schema) => schema,
            }),
        max_discount_amount: yup
            .number()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .min(0, t('promotions:validation.min_order_amount_min'))
            .optional(),
        min_order_amount: yup
            .number()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? 0 : value))
            .min(0, t('promotions:validation.min_order_amount_min'))
            .optional(),
        usage_limit: yup
            .number()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .min(1, t('promotions:validation.usage_limit_min'))
            .optional(),
        usage_per_user: yup
            .number()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? 1 : value))
            .min(1, t('promotions:validation.usage_per_user_min'))
            .optional(),
        starts_at: yup
            .string()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .optional(),
        ends_at: yup
            .string()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .optional()
            .test(
                'ends-at-after-starts-at',
                t('promotions:validation.ends_at_after_starts_at'),
                function (endsAt) {
                    const { starts_at } = this.parent;
                    if (!starts_at || !endsAt) return true;
                    return new Date(endsAt) > new Date(starts_at);
                }
            ),
        status: yup
            .string()
            .oneOf(['active', 'inactive', 'expired'] as const)
            .optional(),
    });

export type PromotionSchemaInput = yup.InferType<ReturnType<typeof promotionSchema>>;
export default promotionSchema;
