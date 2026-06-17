/** Tour edit fixtures — aligned with initialMockTours + tour.mapper */

import { mockFeaturedTour } from './tours.data';

export const defaultEditTourId = 1;
export const deleteTourId = 12;
export const emptyScheduleTourId = 10;
export const notFoundTourId = 9999;

export const updatedTourName = 'Tour Ba Na Hills — Phiên bản mới';
export const updatedPriceAdultDigits = '600000';

export const legacyItineraryItem = {
  day: 1,
  title: 'Ngày legacy',
  description: 'Nội dung itinerary từ trường description (DB legacy)',
};

export const legacyItineraryContentText = legacyItineraryItem.description;

export {
  longShortDesc,
  invalidVideoUrl,
  invalidDateRange,
  invalidPeopleRange,
  shortTourName,
  tinyPngBuffer,
  slugSourceName,
  expectedSlugFromName,
} from './tour-create.data';

export const mockEditTour = mockFeaturedTour;

export function formatScheduleSlots(booked: number, total: number) {
  return `${booked}/${total}`;
}
