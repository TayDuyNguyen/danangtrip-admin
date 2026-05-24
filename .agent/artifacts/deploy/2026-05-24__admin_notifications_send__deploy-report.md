# Deploy Report: Admin Send Notifications

> Feature slug: `admin_notifications_send`
> Date: 2026-05-24
> Branch: proposed `feat/DATN-92/admin-notifications-send`

---

## 1) Build Status
| Check | Status | Notes |
|---|---|---|
| lint | PASS | `npm.cmd run prepush:check` ran full ESLint. 0 errors. Warnings are existing React Compiler `react-hook-form watch()` warnings in Contacts, UserEdit, and the new send form. |
| typecheck | PASS | `tsc -b` completed through the admin prepush gate. |
| build | PASS | Vite production build completed in 24.27s. |
| prepush:check | PASS | Admin quality gate passed lint, typecheck, production build, and Playwright console checks. |

## 1.1) Build Notes
- Command executed: `npm.cmd run prepush:check`.
- Console smoke suite ran 6 routes and passed.
- Vite emitted known bundle warnings: `lottie-web` uses `eval`, and some shared chunks exceed 500 KB (`lucide`, `recharts`, main index). These are repository-level bundle notes, not introduced only by this screen.
- API support checks also ran in `danangtrip-api`:
  - `php -l app/Mail/AdminNotificationMail.php`
  - `php -l app/Services/NotificationService.php`
  - `php -l app/Repositories/Eloquent/UserRepository.php`
  - `composer analyze`
  - `composer test`

## 2) Bundle / Performance Notes
| Area | Status | Notes |
|---|---|---|
| chunk size | READY WITH RISKS | Admin app has pre-existing large shared chunks. The send page itself is lazy routed and did not create a new oversized standalone chunk. |
| lazy loading | PASS | `/admin/notifications/send` is lazy imported through the route table. |
| query behavior | PASS | Recipient search uses debounced input and `useInfiniteQuery` pagination to avoid loading every user at once. |

## 2.1) Optimization Notes
- Recipient selector now loads users incrementally while scrolling instead of fetching only the first 10 records.
- Link input now accepts a plain target URL/path and the submit layer converts it to `{ url }`, removing manual JSON entry from the admin workflow.
- Successful send clears the composer and keeps the admin on the send page for repeated sends.
- Future optimization: split large global icon/chart/vendor chunks at the Vite config level if bundle budgets become strict.

## 3) Smoke Test
| Scenario | Status | Notes |
|---|---|---|
| page load | PASS | Route is registered as `/admin/notifications/send`; build and console checks include admin runtime route coverage. |
| primary action | PASS BY CODE REVIEW | Individual and bulk submit paths call `sendMutation` / `sendAllMutation`, clear form on success, and preserve error toast handling. |
| auth redirect | PASS BY ROUTE SCOPE | Page is under existing authenticated admin routing shell. |
| browser console | PASS | Playwright console gate passed 6 existing admin/client routes. |

## 3.1) Additional Scenarios
| Scenario | Status | Notes |
|---|---|---|
| empty state | PASS | Recipient selector supports loading and empty states. |
| error state | PASS | Form validation covers missing recipient, title/content limits, and target link format. |
| i18n text / locale | PASS | Vietnamese and English notification dictionaries were updated together. |

## 4) Deploy Readiness
- Ready / Not Ready: `Ready for push after approval`
- Blocking issues: None.
- Non-blocking risks:
  - Gmail delivery depends on `.env` SMTP values and Google App Password setup in API runtime.
  - Bulk email sends are synchronous through Laravel Mail; very large user counts may take noticeable time or hit Gmail limits.
  - Existing Vite shared chunks remain large.

## 5) Evidence / References
- Review report: `.agent/artifacts/review/2026-05-24__admin_notifications_send__review.md`
- Related implementation files:
  - `src/pages/Notifications/NotificationSend/`
  - `src/api/notificationApi.ts`
  - `src/hooks/useNotificationQueries.ts`
  - `src/routes/index.tsx`
  - `src/routes/routes.ts`
  - `public/lang/vi/notification.json`
  - `public/lang/en/notification.json`
- API support files:
  - `danangtrip-api/app/Mail/AdminNotificationMail.php`
  - `danangtrip-api/app/Services/NotificationService.php`
  - `danangtrip-api/app/Repositories/Eloquent/UserRepository.php`
  - `danangtrip-api/README.md`
