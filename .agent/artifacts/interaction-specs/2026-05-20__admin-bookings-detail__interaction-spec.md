# Interaction Spec: Chi tiết Đơn hàng (Booking Detail)

> Feature slug: `admin-bookings-detail`
> Date: 2026-05-20
> Source hooks: `src/hooks/useBookingQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| Load details | Page Mount / URL ID Param | `useAdminBookingDetailQuery(id)` | Render main layout elements | Display full-screen error with a reload button |
| Confirm booking | "Xác nhận đơn" button click | `updateStatusMutation.mutate({ id, status: 'confirmed' })` | Toast "Xác nhận đơn hàng thành công" & refetch data | Toast "Cập nhật trạng thái thất bại" |
| Complete booking | "Xác nhận hoàn tất" button click | `updateStatusMutation.mutate({ id, status: 'completed' })` | Toast "Hoàn tất đơn hàng thành công" & refetch data | Toast "Cập nhật trạng thái thất bại" |
| Cancel booking | Dialog Confirm submit | `updateStatusMutation.mutate({ id, status: 'cancelled', reason })` | Toast "Hủy đơn hàng thành công", close dialog & refetch data | Toast "Cập nhật trạng thái thất bại" |
| Export Invoice | "In hóa đơn" button click | `getInvoiceMutation.mutate({ id, fallbackFilename })` | Toast "Xuất hóa đơn thành công" and triggers PDF download | Toast "Xuất hóa đơn thất bại" |
| Back to list | "Quay lại" button click | `navigate(ROUTES.BOOKINGS_LIST)` | Instant routing to list screen | None |

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| Load details | High | Core operation. Page remains blank skeleton if load fails. |
| Confirm booking | High | Primary status conversion for new pending bookings. |
| Cancel booking | High | Destructive but vital capability to handle change of plans. |
| Complete booking | Medium | Transitions confirmed booking to terminal archived state. |
| Export Invoice | Medium | Crucial support operation for physical auditing. |

## 2) Forms
| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| Cancellation Dialog Form | `reason` (string, required) | Yup schema validation integrated within `BookingCancelDialog` | Triggered by dialog onConfirm. Calls mutation on submit | Closes modal and clears the text input |

## 3) Filters / Search / Pagination
| Control | State Source | Sync URL | Debounce | Notes |
|---|---|---|---|---|
| Booking ID Param | Route `:id` param | Yes | None | Dynamic ID segment triggers the main query fetch |

## 3.1) Default Values / Reset Logic
*There are no filter inputs on the detail screen.*

## 4) Confirm / Destructive Actions
| Action | Confirm UI | Permission | Notes |
|---|---|---|---|
| Complete booking | standard `window.confirm` modal | Admin / Staff | Prompts operator to confirm finalization |
| Cancel booking | Custom glassmorphism `BookingCancelDialog` | Admin / Staff | Prompts cancellation reason text area before mutation |

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| Load details | Elegant parallel Skeleton loaders for main cards | All actions buttons | Prevents CLS |
| Confirm booking | Inline spinner inside "Confirm" button | All actions buttons | Mutation loading block |
| Complete booking | Inline spinner inside "Complete" button | All actions buttons | Mutation loading block |
| Cancel booking | Spinner inside dialog submit button | All actions buttons & dialog buttons | Mutation loading block |
| Export Invoice | Spinner inside "Export Invoice" button | All actions buttons | Mutation loading block |

## 5) i18n Keys To Add
*All required i18n translation keys are already synced under namespaces in `booking.json` in both `vi` and `en` locales.*

## 6) Risks / Open Questions
- **R-01 (Database Gaps):** High risk of missing detailed logs history and travelers list on backend. Mitigated by aggregate item counts and virtual timestamps timeline calculations.
- **R-02 (Invoice failure):** Downstream PDF rendering may crash on backend. Mitigated by explicit `onError` handling showing Sonner toast.
