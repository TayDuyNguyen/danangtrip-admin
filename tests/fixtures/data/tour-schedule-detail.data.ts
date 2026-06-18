/** Helpers for Tour Schedule Detail Playwright tests (03h) */

export {
  bookedEditSchedule,
  cancelledEditSchedule,
  defaultEditSchedule,
  defaultEditScheduleId,
  fullEditSchedule,
} from './tour-schedule-edit.data';

import { defaultEditSchedule } from './tour-schedule-edit.data';

export const fullScheduleId = 102;
export const cancelledScheduleId = 103;
export const invalidScheduleId = 999_999;

export const detailOperationalFixture = {
  departure_code: 'VN-DN-01',
  departure_place: 'Sân bay Đà Nẵng',
  booking_deadline: '2026-06-19',
};

export const detailPriceOverrideFixture = {
  price_adult: 1_500_000,
  price_child: 900_000,
  price_infant: 0,
};

export const isoStartDateLegacy = `${defaultEditSchedule.start_date}T00:00:00.000Z`;

export const detailApiFieldKeys = [
  'start_date',
  'end_date',
  'max_people',
  'booked_people',
  'status',
  'tour',
] as const;
