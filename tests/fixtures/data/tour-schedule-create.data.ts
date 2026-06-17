/** Helpers for Tour Schedule Create Playwright tests */

export function ymdDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatPreviewDateVi(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(y!, m! - 1, d!));
}

/** Matches SchedulePreviewBox for vi-VN or en-US locale */
export function previewDatePattern(ymd: string): RegExp {
  const [y, m, d] = ymd.split('-');
  const dd = d!.padStart(2, '0');
  const mm = m!.padStart(2, '0');
  return new RegExp(`${dd}[./]${mm}[./]${y}|${mm}[./]${dd}[./]${y}`);
}

export const pastStartDate = () => ymdDaysFromToday(-14);
export const futureStartDate = () => ymdDaysFromToday(30);
export const futureEndDate = () => ymdDaysFromToday(32);
export const invalidEndBeforeStart = () => ymdDaysFromToday(25);
export const invalidBookingDeadline = () => ymdDaysFromToday(35);

export const validScheduleSlots = 15;

export function buildValidScheduleForm() {
  const start = futureStartDate();
  return {
    startDate: start,
    endDate: start,
    totalSlots: validScheduleSlots,
  };
}

export function buildApiCreateSchedulePayload(tourId: number) {
  const start = futureStartDate();
  return {
    tour_id: tourId,
    start_date: start,
    end_date: start,
    max_people: validScheduleSlots,
    status: 'available',
  };
}

export const scheduleCreateValidationCopy = {
  startDateRequired: /Ngày khởi hành|Start date/i,
  endDateRequired: /Ngày kết thúc|End date/i,
  startDateFuture: /phải từ hôm nay|today or in the future/i,
  endDateAfter: /sau hoặc bằng ngày khởi hành|after or equal to start/i,
  bookingDeadlineBefore: /trước hoặc cùng ngày khởi hành|before or equal to start date/i,
  totalSlotsMin: /ít nhất 1|greater than or equal to 1/i,
};
