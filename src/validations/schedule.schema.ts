import * as Yup from 'yup';
import type { TFunction } from 'i18next';

/**
 * Validation schema for adding a new tour schedule.
 * (Schema xác thực khi thêm lịch khởi hành tour mới)
 */
export const getScheduleSchema = (t: TFunction) => {
    return Yup.object().shape({
        startDate: Yup.string()
            .required(t('validation:common.required', { field: t('schedule:fields.start_date') }))
            .test('is-future', t('schedule:validation.start_date_future'), (value) => {
                if (!value) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const start = new Date(value);
                return start >= today;
            }),
        endDate: Yup.string()
            .required(t('validation:common.required', { field: t('schedule:fields.end_date') }))
            .test('is-after-start', t('schedule:validation.end_date_after'), function (value) {
                const { startDate } = this.parent;
                if (!value || !startDate) return true;
                return new Date(value) >= new Date(startDate);
            }),
        totalSlots: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .required(t('validation:common.required', { field: t('schedule:fields.max_people') }))
            .min(1, t('validation:common.min_number', { field: t('schedule:fields.max_people'), min: 1 })),
        priceAdult: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedule:fields.price_adult'), min: 0 })),
        priceChild: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedule:fields.price_child'), min: 0 })),
        priceInfant: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable()
            .min(0, t('validation:common.min_number', { field: t('schedule:fields.price_infant'), min: 0 })),
        status: Yup.string().required(t('validation:common.required', { field: t('schedule:fields.status') })),
    });
};
