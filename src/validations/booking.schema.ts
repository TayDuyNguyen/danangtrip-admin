import * as yup from 'yup';
import type { TFunction } from 'i18next';

/**
 * Validation schemas for Booking module
 */

export const cancelBookingSchema = (t: TFunction) =>
    yup.object({
        reason: yup
            .string()
            .required(t('booking:validation.reason_required'))
            .min(5, t('booking:validation.reason_min_length', { min: 5 }))
            .max(500, t('booking:validation.reason_max_length', { max: 500 })),
    });

export type CancelBookingFormValues = yup.InferType<ReturnType<typeof cancelBookingSchema>>;
