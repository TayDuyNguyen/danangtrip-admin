# Feature Review: Admin Send Notifications

> Feature slug: `admin_notifications_send`
> Date: 2026-05-24
> Reviewer context: `pre-push / pre-handoff`

---

## 1) Objective
`admin_notifications_send` completes the admin workflow for sending system notifications from `/admin/notifications/send`. Admin/staff users can compose an individual or bulk notification, select recipients, preview the message, optionally attach a click target link, and send the notification through existing API endpoints. The latest backend addition also sends an email copy through Laravel Mail when SMTP is configured.

## 2) Scope Delivered
| Area | What changed | Files |
|---|---|---|
| API / Types | Added notification send/send-all API wrappers and React Query mutations. | `src/api/notificationApi.ts`, `src/hooks/useNotificationQueries.ts` |
| Routing | Added lazy route constant and route registration for `/admin/notifications/send`. | `src/routes/routes.ts`, `src/routes/index.tsx` |
| UI Components | Added compose page, recipient selector, form, preview card, and bulk confirmation dialog. | `src/pages/Notifications/NotificationSend/` |
| Data Integration | Recipient selector uses debounced search plus infinite pagination over admin users. Submit layer converts a plain target link into `data: { url }`. | `RecipientSelector.tsx`, `NotificationSend/index.tsx` |
| Interactions | Form clears after successful send; bulk mode confirms before dispatch; link input replaces manual JSON entry. | `NotificationSend/index.tsx`, `NotificationSendForm.tsx`, `BulkConfirmDialog.tsx` |
| i18n | Added synchronized Vietnamese and English notification send strings. | `public/lang/vi/notification.json`, `public/lang/en/notification.json` |
| Backend Support | Added Gmail-compatible email copy of admin notifications, with failure logged and DB notification preserved. | `danangtrip-api/app/Mail/AdminNotificationMail.php`, `NotificationService.php`, `UserRepository.php`, `README.md` |

## 2.1) User-Facing Outcomes
- Admin can open `/admin/notifications/send` from the notification list CTA.
- Admin can search recipients, scroll the dropdown to load more users, and select one user.
- Admin can switch between individual and bulk sending.
- Admin enters a normal link/path in "Link đích"; no JSON input is required.
- After a successful send, the compose form resets so another notification can be entered immediately.
- Users receive in-app notifications; if API SMTP is configured, they also receive an email copy.

## 3) Artifact Trace
| Step | Artifact Path | Status |
|---|---|---|
| 01 | `.agent/artifacts/analysis/2026-05-24__admin_notifications_send__screen-analysis.md` | Missing in workspace |
| 02 | `.agent/artifacts/setup/2026-05-24__admin_notifications_send__project-setup-report.md` | Missing in workspace |
| 03 | `.agent/artifacts/api-contracts/2026-05-24__admin_notifications_send__api-contract.md` | Missing in workspace |
| 04 | `.agent/artifacts/routing/2026-05-24__admin_notifications_send__route-plan.md` | Missing in workspace |
| 05 | `.agent/artifacts/ui-specs/2026-05-24__admin_notifications_send__ui-spec.md` | Missing in workspace |
| 06 | `.agent/artifacts/integration/2026-05-24__admin_notifications_send__data-integration.md` | Missing in workspace |
| 07 | `.agent/artifacts/interaction-specs/2026-05-24__admin_notifications_send__interaction-spec.md` | Missing in workspace |
| 08 | `.agent/artifacts/auth/2026-05-24__admin_notifications_send__auth-permissions-review.md` | Missing in workspace |
| 09 | `.agent/artifacts/test-cases/2026-05-24__admin_notifications_send__test-report.md` | Missing in workspace; current Step 10 re-ran quality gates directly |
| 10 | `.agent/artifacts/deploy/2026-05-24__admin_notifications_send__deploy-report.md` | Complete |

## 3.1) Missing / Skipped Steps
| Step | Why skipped | Impact |
|---|---|---|
| 01-09 workspace artifacts | Existing memory files claim the feature was completed, but the corresponding artifact files were not present under `.agent/artifacts/`. | Review trace is weaker than ideal; Step 10 compensates with direct prepush/build/API validation evidence. |

## 4) Technical Decisions
- TD-01: Keep notification persistence and email sending coupled in `NotificationService`, but catch mail failures so SMTP issues do not block the in-app notification.
- TD-02: Use `useInfiniteQuery` for recipient selection so the dropdown loads more users while scrolling instead of forcing a large up-front fetch.
- TD-03: Keep form state simple by reusing the internal `data` field for the link input, then converting it to `{ url }` at submit time.
- TD-04: Do not redirect to the notification list after send; reset the composer to support repeated admin sends.

## 4.1) Reuse And Architecture Notes
- Reused existing admin route conventions, `axiosClient`, notification query key invalidation, `react-hook-form`, `yupResolver`, and translation namespaces.
- Reused Laravel `Mail` infrastructure and the existing `config/mail.php` SMTP setup.
- API email template follows the existing inline `Mailable` pattern used by OTP email.

## 5) Validation Summary
| Check | Status | Notes |
|---|---|---|
| admin lint | PASS | `npm.cmd run prepush:check`; 0 errors, 3 React Compiler warnings related to `react-hook-form watch()`. |
| admin typecheck | PASS | `tsc -b` completed. |
| admin build | PASS | Vite production build completed. |
| admin console smoke | PASS | Playwright console suite passed 6 routes. |
| api php syntax | PASS | `php -l` passed on new/modified PHP files. |
| api static analysis | PASS | `composer analyze` completed with no errors. |
| api tests | PASS | `composer test` completed: 12 tests, 48 assertions. |

## 5.1) Quality Assessment
- Strong points:
  - The admin screen is route-lazy and keeps recipient loading paginated.
  - The form is easier to use after replacing raw JSON with a normal link input.
  - Email delivery is additive; notification DB writes remain reliable even if SMTP fails.
- Follow-up areas:
  - For production bulk sends, a queue-backed mail flow would be safer than synchronous Gmail SMTP delivery.
  - Existing admin bundle warnings remain outside the feature scope.

## 6) Risks / Follow-ups
- R-01: Gmail SMTP requires `MAIL_MAILER=smtp`, `MAIL_SCHEME=tls`, Gmail username, and Google App Password in API `.env`.
- R-02: Gmail sending limits can throttle bulk notifications.
- F-01: Add queued mail jobs for bulk notification email delivery if user volume grows.
- F-02: Recreate missing Step 01-09 artifacts if the project requires a fully continuous artifact chain before audit.

## 7) Approval Recommendation
- Recommendation: `Ready for push after approval`
- Reason: The current admin/API implementation passes build, typecheck, lint, console smoke, PHP static analysis, and API tests. Remaining risks are deploy configuration and bulk email throughput, not code blockers.
