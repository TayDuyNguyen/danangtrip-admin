/** Helpers for Tour Schedule Edit Playwright tests */

import { mockSchedulesForTour1 } from './tours.data';

export {
  futureStartDate,
  futureEndDate,
  invalidEndBeforeStart,
  invalidBookingDeadline,
  previewDatePattern,
  validScheduleSlots,
  ymdDaysFromToday,
} from './tour-schedule-create.data';

export const defaultEditSchedule = mockSchedulesForTour1[0]!;
export const bookedEditSchedule = mockSchedulesForTour1[1]!;
export const fullEditSchedule = mockSchedulesForTour1[2]!;
export const cancelledEditSchedule = mockSchedulesForTour1[3]!;

export const defaultEditScheduleId = defaultEditSchedule.id;
export const bookedEditScheduleId = bookedEditSchedule.id;

export function buildApiUpdateSchedulePayload(
  scheduleId: number,
  overrides: Record<string, unknown> = {}
) {
  const row = mockSchedulesForTour1.find((s) => s.id === scheduleId) ?? defaultEditSchedule;
  return {
    start_date: row.start_date,
    end_date: row.end_date,
    max_people: row.max_people,
    status: row.status,
    ...overrides,
  };
}

export const scheduleEditValidationCopy = {
  totalSlotsMinBooked: /không thể nhỏ hơn số lượng ghế đã đặt|cannot be less than.*booked/i,
  endDateAfter: /sau hoặc bằng ngày khởi hành|after or equal to start date/i,
  bookingDeadlineBefore: /trước hoặc bằng ngày khởi hành|before or equal to start date/i,
};
