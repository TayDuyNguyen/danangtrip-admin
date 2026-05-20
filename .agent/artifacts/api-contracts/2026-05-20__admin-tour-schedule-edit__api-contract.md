# API Contract: admin-tour-schedule-edit
Date: 2026-05-20
Feature: admin-tour-schedule-edit
Analysis: [.agent/artifacts/analysis/2026-05-20__admin-tour-schedule-edit__screen-analysis.md](file:///D:/DATN/danangtrip-admin/.agent/artifacts/analysis/2026-05-20__admin-tour-schedule-edit__screen-analysis.md)

## 1. Source Reconciliation

- **Doc Requirement:** `departure_code`, `departure_place`, `booking_deadline`.
- **Admin Repo (current):** `startDate`, `endDate`, `totalSlots`, `status`.
- **Backend Repo (current):** `start_date`, `end_date`, `max_people`, `status`.
- **Status:** **Contract Mismatch.** Backend lacks the operational fields. Admin repo uses camelCase ViewModels correctly via Mapper.

## 2. Endpoint Contract

| Action | Method | Path | Auth |
|---|---|---|---|
| Load Schedule | GET | `/admin/tour-schedules/{id}` | Bearer Token (Admin/Staff) |
| Update Schedule| PUT | `/admin/tour-schedules/{id}` | Bearer Token (Admin/Staff) |
| Delete Schedule| DELETE| `/admin/tour-schedules/{id}` | Bearer Token (Admin/Staff) |

## 3. Data Models

### RawSchedule (Backend Shape)
```ts
// D:\DATN\danangtrip-admin\src\dataHelper\schedule.dataHelper.ts
export interface RawSchedule {
    id: number | string;
    tour_id: number | string;
    start_date: string;
    end_date: string;
    max_people: number;
    booked_people: number;
    status: string;
    // NEW FIELDS
    departure_code: string | null;
    departure_place: string | null;
    booking_deadline: string | null; // ISO Date string
    price_adult?: number | null;
    price_child?: number | null;
    price_infant?: number | null;
    tour?: RawScheduleTour | null;
}
```

### Schedule (ViewModel / UI Shape)
```ts
// D:\DATN\danangtrip-admin\src\types\schedule.ts
export interface Schedule {
    id: number | string;
    tourId: number | string;
    startDate: string;
    endDate: string;
    totalSlots: number;
    bookedSlots: number;
    status: ScheduleStatus;
    // NEW FIELDS
    departureCode: string | null;
    departurePlace: string | null;
    bookingDeadline: string | null;
    priceAdult: number | null;
    priceChild: number | null;
    priceInfant: number | null;
}
```

## 4. Backend Migration Plan (Laravel)

Create a new migration in `danangtrip-api`:
- **File:** `database/migrations/2026_05_20_000001_add_operational_fields_to_tour_schedules.php`
- **Logic:**
```php
Schema::table('tour_schedules', function (Blueprint $table) {
    $table->string('departure_code', 50)->nullable()->after('status');
    $table->string('departure_place', 255)->nullable()->after('departure_code');
    $table->dateTime('booking_deadline')->nullable()->after('departure_place');
});
```

## 5. Mapper Contract

Update `src/dataHelper/schedule.mapper.ts`:
- **mapFromRaw:** Add mapping for `departure_code` -> `departureCode`, etc.
- **mapToRaw:** Add mapping for `departureCode` -> `departure_code`, etc.

## 6. Validation Contract (Yup)

Update `src/validations/schedule.schema.ts`:
- `totalSlots`: must be `>= bookedSlots` (passed as context).
- `departureCode`: string, max 50.
- `departurePlace`: string, max 255.
- `bookingDeadline`: date, must be `<= startDate`.

## 7. Handoff to Implementation

Files to be modified:
1.  **Backend (danangtrip-api):**
    - `database/migrations/...`
    - `app/Models/TourSchedule.php` (update `$fillable`)
2.  **Admin (danangtrip-admin):**
    - `src/types/schedule.ts`
    - `src/dataHelper/schedule.dataHelper.ts`
    - `src/dataHelper/schedule.mapper.ts`
    - `src/validations/schedule.schema.ts`
