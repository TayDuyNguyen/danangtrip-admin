# Review: Admin Site Settings — 2026-05-30

> Feature: `admin_site_settings`
> Route: `/admin/settings`
> Status: ✅ COMPLETED

---

## Summary

Màn hình cấu hình website admin đã được triển khai đầy đủ, bao gồm backend Laravel (key-value settings table, Redis cache, API endpoints) và frontend React (tabbed settings form với 6 nhóm cấu hình, image upload, validation, i18n).

---

## What Was Built

### Backend (danangtrip-api)
- **Database**: `settings` table với key-value-type-group schema.
- **Cache**: Redis key `public_config` invalidated on every `PUT /admin/settings`.
- **Endpoints**: `GET /admin/settings`, `PUT /admin/settings`, `POST/DELETE /admin/settings/images/{key}`, `GET /config` (public).
- **Validation**: Hotline regex updated to allow spaces (`1900 1800`).
- **Error handling**: Controllers return proper 4xx/5xx instead of always 200.
- **Seeder**: Default keys for all 6 settings groups.

### Frontend (danangtrip-admin)
- **Page**: `/admin/settings` with FormProvider wrapping 6 tab panels.
- **Image upload**: Safe pattern — upload new → success → delete old.
- **Validation**: Yup schema with hotline/URL/email validators.
- **i18n**: Full Vietnamese + English parity for all settings keys.
- **Smoke tests**: Playwright coverage added for `/admin/settings` route.

### Web Integration (danangtrip-web)
- `GET /config` consumer wired in `Footer.tsx` for dynamic branding/policies.
- Payment gateway toggles (PayOS/VNPay/MoMo/ZaloPay/COD) driven by config.

---

## Bugs Fixed During Implementation

| ID | Description | Fix |
|---|---|---|
| P1 | Hotline regex too strict (failed seeded `1900 1800`) | Regex updated to allow spaces |
| P1 | Controllers returned 200 even on service failure | Proper error status codes added |
| P2 | Image uploader deleted old asset before new upload | Upload-first, then delete pattern |
| W1 | Tailwind `block flex` CSS conflict in PolicySettings | Removed redundant `block` class |

---

## Quality Gate Evidence

```
npm run prepush:check → ALL CHECKS PASSED
  ✔ Lint passed (0 errors)
  ✔ Typecheck passed (0 errors)
  ✔ Build passed (18.13s)
  ✔ Console Error Testing: 7/7 PASS (includes /admin/settings)
```

---

## Next Recommended Steps

- Push branch `feat/DATN-*/admin-site-settings` and open PR.
- Admin: Next screen → `admin_promotions` (`/admin/promotions`).
- Web: Next screen → `user_blog_list` hardening (`/blog`).
