# Data Integration: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit

## 1. Query & Mutation Wiring

| Action | Hook | API Endpoint | Invalidation |
|---|---|---|---|
| Load Schedule | `useSchedule(id)` | `GET /admin/tour-schedules/{id}` | - |
| Load Tour Context | `useTourDetailQuery(tourId)` | `GET /admin/tours/{id}` | - |
| Update Schedule | `useUpdateSchedule()` | `PUT /admin/tour-schedules/{id}` | `schedules:list`, `schedules:detail`, `tour-edit-schedules`, `tour-detail-schedules` |
| Delete Schedule | `useDeleteSchedule()` | `DELETE /admin/tour-schedules/{id}` | `schedules:list`, `schedules:all` |

## 2. Mapper Logic

- **Model:** `Schedule` interface in `src/types/schedule.ts`.
- **Raw:** `RawSchedule` interface in `src/dataHelper/schedule.dataHelper.ts`.
- **Mapper:** `scheduleMapper` (bi-directional) correctly handles:
  - `departureCode` <-> `departure_code`
  - `departurePlace` <-> `departure_place`
  - `bookingDeadline` <-> `booking_deadline`

## 3. UI Integration

- **Form Initialization:** `reset()` in `useEffect` now populates the 3 new fields.
- **Form Submission:** `onSubmit` payload includes the 3 new fields.
- **Stats Wiring:** `ScheduleStatsBlock` uses `totalSlots` and `bookedSlots` from the fetched schedule object.
- **Info Wiring:** `ScheduleInfoBox` uses dates and tour name from the fetched schedule object.

## 4. Error & Loading Handling

- **Fetch Loading:** `LoadingReact` spokes spinner.
- **Mutation Loading:** Button `isLoading` prop.
- **Error Feedback:** Global toast via `sonner` (configured in hooks).
