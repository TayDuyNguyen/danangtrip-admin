# Project Audit: Chi tiết Đơn hàng (Booking Detail)

> Feature slug: `admin-bookings-detail`
> Date: 2026-05-20
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu:** Kiểm tra và đánh giá cơ sở dự án (project base) trước khi thực hiện viết code cho màn hình Chi tiết Đơn hàng, đảm bảo các cấu hình dự án, gói thư viện phụ thuộc, cài đặt axiosClient và cấu trúc thư mục hoàn toàn khớp với thực tế và không có blocker tiềm ẩn.
- **Kết luận:** Dự án sẵn sàng để phát triển, không có blocker nền tảng nào.

## 1.1) Audit Verdict
- **Ready / Not Ready:** **Ready**
- **Lý do chính:** Toàn bộ các quality gates (`npm run lint`, `npm run typecheck`, `npm run build`, `npm run prepush:check`) chạy tốt, alias cấu hình chính xác, và axiosClient đã cấu hình interceptor gắn token tự động ổn định.

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | ^19.0.0 | ^19.2.4 | PASS | React v19.2 |
| Vite | ^5.0.0 / ^6.0.0 | ^6.0.0+ | PASS | Sử dụng @tailwindcss/vite cho Tailwind CSS v4 |
| TypeScript | ^5.0.0 | ^5.6.3+ | PASS | Trình biên dịch tsc chạy thông qua script `typecheck` |
| TanStack Query | ^5.0.0 | ^5.95.2 | PASS | TanStack Query v5 ổn định |
| Zustand | ^5.0.0 | ^5.0.8 | PASS | Quản lý global store cho auth và user |

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | PASS | Chứa axiosClient và các file API calls |
| `src/components/` | Exists | PASS | Chứa common UI components |
| `src/hooks/` | Exists | PASS | Chứa query/mutation custom hooks |
| `src/routes/` | Exists | PASS | Quản lý router react-router-dom v7 |

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | PASS | Định nghĩa alias trỏ về `./src` |
| `tsconfig.app.json` | paths aligned | PASS | Thống nhất với `vite.config.ts` |
| `.env.example` | required env vars present | PASS | Có đầy đủ các biến môi trường cấu hình API |

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | PASS | Gắn Authorization header trong request interceptor |
| `axiosClient` | fallback URL logic | PASS | Có cơ chế đổi API base URL dự phòng khi mất kết nối mạng |
| `axiosClient` | response/error interceptor | PASS | Tự động xử lý lỗi 401 để refresh token thầm lặng hoặc redirect về login |
| `providers` | Query bootstrap | PASS | Cấu hình trong `src/providers/index.tsx` |
| `routes` | ProtectedRoute wiring | PASS | Bọc các Route riêng tư để ngăn truy cập trái phép |

## 5.1) Commands / Scripts Audit
| Script | Purpose | Status | Notes |
|---|---|---|---|
| `npm run lint` | quality gate | PASS | Quét và phát hiện lỗi ESLint |
| `npm run typecheck` | type safety | PASS | Đảm bảo tính an toàn kiểu dữ liệu bằng `tsc -b` |
| `npm run build` | build verification | PASS | Build production để kiểm thử Bundle |
| `npm run prepush:check` | full gate | PASS | Chạy toàn bộ các bước lint, typecheck và build trước khi đẩy code |

## 6) Risks / Gaps
- **R-01 (API Invoice):** Endpoint xuất hóa đơn trả về file Blob. Cần xử lý download trực tiếp và đặt tên file phù hợp, xử lý lỗi khi file tải xuống bị lỗi (corrupted hoặc rỗng).
- **R-02 (API Gaps):** Không thể lấy được thông tin chi tiết của hành khách và lịch sử trạng thái chi tiết qua API độc lập.
  - *Hướng xử lý:* Hiển thị thông báo trạng thái GAP giao diện một cách tinh tế và tận dụng các trường dữ liệu có sẵn trên Booking model để giả lập/Virtualize thông tin.

## 6.1) Smallest Safe Fixes
- **Fix-01:** Thêm các trường mốc thời gian (`confirmed_at`, `completed_at`, `cancelled_at`) vào kiểu dữ liệu đơn hàng và mapper để dựng Virtual Timeline mà không cần thêm API.
- **Fix-02:** Cấu hình download file Invoice dạng Blob qua Axios và xử lý tải xuống thông qua thẻ `a` ẩn trong DOM.

## 7) Recommended Next Actions
- [x] Continue with feature implementation
- [ ] Fix blockers first
- [ ] Re-audit after dependency/config update
