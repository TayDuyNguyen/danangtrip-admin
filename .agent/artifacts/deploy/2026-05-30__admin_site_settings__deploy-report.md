# Deploy Report: Admin Site Settings

> Feature slug: `admin_site_settings`
> Date: 2026-05-30
> Status: `READY`
> Target Platform: Vite / React Admin SPA

---

## 1. Scope

Implemented the full admin website configuration screen at route `/admin/settings`.

### Deliverables

| Area | Description |
|---|---|
| Route | `/admin/settings` lazy-loaded under `PrivateRoute` |
| Page | `src/pages/Settings/index.tsx` — tabbed FormProvider shell |
| Components | 8 setting-section components + SaveBar + ImageUploader |
| API Layer | `src/api/settingsApi.ts`, `src/hooks/useSettingQueries.ts` |
| Types | `src/types/settings.types.ts` |
| Mapper | `src/dataHelper/settings.mapper.ts` |
| Validation | `src/validations/settings.schema.ts` (Yup + react-hook-form) |
| i18n | `public/lang/vi/settings.json` + `public/lang/en/settings.json` |
| Backend | Migration, Model, Repository, Service, Controller, Seeder, Requests in `danangtrip-api` |

---

## 2. Files Changed

### `danangtrip-admin`

| File | Change |
|---|---|
| `src/routes/routes.ts` | Added `SETTINGS: '/admin/settings'` |
| `src/routes/index.tsx` | Added lazy `Settings` import + route entry |
| `src/constants/endpoints.ts` | Added `SETTINGS` endpoint group |
| `src/types/settings.types.ts` | [NEW] Full `WebsiteSettings` type definition |
| `src/types/index.ts` | Re-exported settings types |
| `src/dataHelper/settings.mapper.ts` | [NEW] `mapSettings` / `flattenSettings` helpers |
| `src/dataHelper/index.ts` | Re-exported mapper |
| `src/api/settingsApi.ts` | [NEW] `getSettings` / `updateSettings` / `uploadSettingImage` / `deleteSettingImage` |
| `src/api/index.ts` | Re-exported settingsApi |
| `src/hooks/useSettingQueries.ts` | [NEW] `useSettings` + `useUpdateSettings` hooks |
| `src/hooks/index.ts` | Re-exported hooks |
| `src/validations/settings.schema.ts` | [NEW] Full Yup schema with hotline/phone/url validators |
| `src/validations/index.ts` | Re-exported schema |
| `src/i18n/index.ts` | Registered `settings` namespace |
| `public/lang/vi/settings.json` | [NEW] Full Vietnamese translations |
| `public/lang/en/settings.json` | [NEW] Full English translations |
| `src/pages/Settings/index.tsx` | [NEW] Main tabbed settings page |
| `src/pages/Settings/components/GeneralSettings.tsx` | [NEW] Hotline, email, address section |
| `src/pages/Settings/components/BrandSettings.tsx` | [NEW] Logo, favicon image upload section |
| `src/pages/Settings/components/SocialSettings.tsx` | [NEW] Facebook, Instagram, YouTube, TikTok links |
| `src/pages/Settings/components/PaymentSettings.tsx` | [NEW] PayOS, VNPay, MoMo, ZaloPay, COD toggles |
| `src/pages/Settings/components/PolicySettings.tsx` | [NEW] Terms & Privacy URL/text fields |
| `src/pages/Settings/components/SEOSettings.tsx` | [NEW] Default meta title/description/keywords/OG image |
| `src/pages/Settings/components/SaveBar.tsx` | [NEW] Floating unsaved-changes action bar |
| `src/pages/Settings/components/SettingImageUploader.tsx` | [NEW] Safe upload (new first, then delete old) |
| `tests/console-errors.spec.ts` | Added `/admin/settings` to Playwright smoke routes |

### `danangtrip-api`

| File | Change |
|---|---|
| Migration | `create_settings_table` — `key`, `value`, `type`, `group`, `label` |
| Model | `app/Models/Setting.php` |
| Repository | `app/Repositories/Settings/SettingRepository.php` |
| Service | `app/Services/SettingService.php` with Redis cache |
| Admin Controller | `app/Http/Controllers/Api/Admin/SettingController.php` |
| Public Controller | `app/Http/Controllers/Api/SettingController.php` |
| Requests | `UpdateSettingsRequest.php`, `UploadSettingImageRequest.php` |
| Seeder | `database/seeders/SettingSeeder.php` |
| Routes | `/admin/settings` GET/PUT/POST/DELETE; `/config` GET |

---

## 3. Quality Gate Results

| Check | Command | Result |
|---|---|---|
| **Lint** | `npm run lint` | ✅ PASS (0 errors, 6 existing warnings only) |
| **Typecheck** | `npm run typecheck` (`tsc -b`) | ✅ PASS (0 errors) |
| **Build** | `npm run build` | ✅ PASS (built in 18.13s) |
| **Console Tests** | `npm run test:console` | ✅ **7/7 PASS** (includes `/admin/settings`) |
| **Full Gate** | `npm run prepush:check` | ✅ **ALL CHECKS PASSED** |

---

## 4. UX Highlights

- **Tabbed layout**: 6 tabs (General, Brand, Social, Payment, Policy, SEO) in a left sidebar.
- **Floating SaveBar**: Only appears when form is dirty (`isDirty = true`).
- **Image uploader**: Safe race-condition handling — new file uploads _before_ old file is deleted.
- **Hotline regex**: Allows spaces (e.g., `1900 1800`) to match seeded defaults.
- **Error paths**: Controller returns proper `500` status on service failure (not unconditional `200`).
- **Loading/Error states**: Full screen skeleton on load; centered error widget on fetch failure.

---

## 5. Deploy Readiness Verdict

- **Verdict:** ✅ **READY**
- **Breaking changes:** None — additive feature.
- **Regressions:** None detected.
- **Action:** Sẵn sàng push branch và merge.
