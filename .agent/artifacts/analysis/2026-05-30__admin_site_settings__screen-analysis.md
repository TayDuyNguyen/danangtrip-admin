# Screen Analysis: Website Configuration (`admin_site_settings`)

- **Feature Slug**: `admin_site_settings`
- **Screen Name**: `Cấu hình website` (Website Settings)
- **Main Route**: `/admin/settings`
- **Target Page Path**: `src/pages/Settings/index.tsx`
- **Primary Document**: `DATN_Document/docs/page/admin_site_settings.md`
- **Primary APIs**:
  - `GET /v1/config` (Public configuration for frontend web app, i.e., danangtrip-web)
  - `GET /v1/admin/settings` (Admin config retrieval)
  - `PUT /v1/admin/settings` (Admin config update)

---

## 1. Objectives & Business Context

The main objective is to establish a unified website configurations dashboard so that settings like hotlines, support emails, physical addresses, brand assets (logos, favicon), default SEO meta tags, social media profiles, default policies, and payment gateways can be managed dynamically by administrators instead of being hardcoded in frontend codebases.

---

## 2. API Design & Database Schema

We will create a flexible settings storage architecture.

### Database Schema (`settings` table)
- `id` (bigint, primary key)
- `key` (string, unique, index) - e.g., `general.hotline`, `payment.vnpay`
- `value` (text, nullable) - stores serialized JSON or raw string representations
- `value_type` (string, 20) - type helper for cast (`string`, `number`, `boolean`, `json`, `url`, `image`)
- `is_public` (boolean, default false) - determines if accessible via `/config`
- `timestamps`

### Seeder Keys
- `general.hotline` (string, is_public: true)
- `general.email` (string, is_public: true)
- `general.address` (string, is_public: true)
- `general.support_hours` (string, is_public: true)
- `brand.logo` (string, is_public: true)
- `brand.favicon` (string, is_public: true)
- `brand.website_name` (string, is_public: true)
- `social.facebook` (string, is_public: true)
- `social.youtube` (string, is_public: true)
- `social.tiktok` (string, is_public: true)
- `social.zalo` (string, is_public: true)
- `payment.vnpay` (boolean, is_public: true)
- `payment.momo` (boolean, is_public: true)
- `payment.zalopay` (boolean, is_public: true)
- `payment.cod` (boolean, is_public: true)
- `policy.terms` (string, is_public: true)
- `policy.privacy` (string, is_public: true)
- `policy.data_protection` (string, is_public: true)
- `seo.meta_title` (string, is_public: true)
- `seo.meta_description` (string, is_public: true)
- `seo.og_image` (string, is_public: true)

---

## 3. UI Component Layout & Architecture

The admin settings screen will feature a tabbed structure allowing clean separation of different config areas:

1. **Tab 1: General (Thông tin chung)**
   - Hotline, Email, Address, Support Hours
2. **Tab 2: Brand Assets (Tài nguyên thương hiệu)**
   - Website name, Logo upload, Favicon upload
3. **Tab 3: Social Links (Mạng xã hội)**
   - Facebook, YouTube, TikTok, Zalo links
4. **Tab 4: Payment Gateways (Cổng thanh toán)**
   - VNPay, MoMo, ZaloPay, Cash on Delivery switches
5. **Tab 5: Policies (Chính sách)**
   - Privacy Policy, Terms of Service, Data Protection links
6. **Tab 6: default SEO (SEO mặc định)**
   - Default Meta Title, Meta Description, default OG:Image

---

## 4. Reusable Patterns & UX Requirements
- **SaveBar Integration**: Displays fixed alert bar at bottom when form contains unsaved changes, preventing accidental navigation.
- **Micro-Animations**: Clean fade-in for tab content transitions.
- **Vietnamese Hotline Format**: Validate through Yup: `regex(/(0[3|5|7|8|9])+([0-9]{8})\b/g)`.
- **Axios Upload**: Reuses `/upload/image` API for media files, showing loader during image uploads.
