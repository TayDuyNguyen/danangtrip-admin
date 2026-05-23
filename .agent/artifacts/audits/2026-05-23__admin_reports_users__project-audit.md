# Project Audit: Admin Reports Users Baseline
 
> Feature slug: `admin_reports_users`
> Date: 2026-05-23
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu:** Kiểm tra và xác nhận toàn bộ nền tảng hệ thống (Dependencies, Scripts, Config, Routing, HTTP Layer, Auth, i18n) đạt trạng thái chuẩn mực và sẵn sàng cho việc triển khai chức năng **Báo cáo người dùng** (`admin_reports_users`).
- **Blocker:** Không tìm thấy blocker nào. Dự án đã được cấu hình rất chuẩn mực và ổn định.

## 1.1) Audit Verdict
- **Ready / Not Ready:** `Ready`
- **Lý do chính:** Toàn bộ dependencies chính đều khớp hoàn toàn với quy chuẩn của dự án; hệ thống Scripts chất lượng (`lint`, `typecheck`, `build`, `prepush:check`) hoạt động đầy đủ và được khai báo rõ ràng. Cơ chế Http Client (`axiosClient`), Auth Bootstrap, và Route Guards đã được triển khai chuyên nghiệp và an toàn.

---

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | `^19` | `^19.2.4` | `Pass` | Đúng chuẩn React 19 mới nhất |
| Vite | `^7` | `^7.3.1` | `Pass` | Đúng chuẩn Vite 7 |
| TypeScript | `~5` | `~5.9.3` | `Pass` | Đảm bảo an toàn kiểu dữ liệu |
| TanStack Query | `^5` | `^5.95.2` | `Pass` | Thư viện quản lý server state đắc lực |
| Zustand | `^5` | `^5.0.8` | `Pass` | Thư viện client state gọn nhẹ |
| Tailwind CSS | `^4` | `^4.2.2` | `Pass` | Sử dụng Tailwind CSS v4 mới nhất |
| React Router | `^7` | `^7.13.2` | `Pass` | Định tuyến route v7 mạnh mẽ |

---

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | `Pass` | Chứa `axiosClient.ts`, `reportApi.ts` và các services |
| `src/components/` | Exists | `Pass` | Chứa components dùng chung: `Sidebar.tsx`, `Header.tsx`, v.v. |
| `src/hooks/` | Exists | `Pass` | Chứa React Query hooks: `useReportQueries.ts` |
| `src/routes/` | Exists | `Pass` | Quản lý guards và đăng ký router |
| `src/dataHelper/` | Exists | `Pass` | Chứa mappers và payload helpers |
| `src/pages/` | Exists | `Pass` | Chứa các màn hình chức năng |

---

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | `Pass` | Trỏ chính xác `@/` vào `./src` |
| `tsconfig.app.json` | paths aligned | `Pass` | Định nghĩa path `"@/*": ["./src/*"]` khớp với Vite |
| `.env.example` | required env vars present | `Pass` | Cung cấp đầy đủ các cổng port, API URL, Timeout, và Stitch IDs |

---

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | `Pass` | Tự động đọc và đính Bearer token vào header |
| `axiosClient` | fallback URL logic | `Pass` | Có logic client-side failover chuyên nghiệp sang cụm backup API |
| `axiosClient` | response/error interceptor | `Pass` | Chuyển đổi dữ liệu tự động, bắt 401 tự động refresh thầm lặng qua Cookie, xử lý 403, 5xx hiển thị Sonner Toast |
| `providers` | Query bootstrap | `Pass` | Tích hợp AppProviders đầy đủ trong `src/providers/index.tsx` |
| `routes` | ProtectedRoute wiring | `Pass` | Sử dụng `PrivateRoute` và `MainLayout` bọc bảo vệ toàn bộ admin routes |

---

## 5.1) Commands / Scripts Audit
| Script | Purpose | Status | Notes |
|---|---|---|---|
| `npm run lint` | quality gate | `Pass` | Chạy kiểm tra code style bằng ESLint |
| `npm run typecheck` | type safety | `Pass` | Biên dịch TypeScript tĩnh (`tsc -b`) |
| `npm run build` | build verification | `Pass` | Tạo bundle tối ưu hóa bằng Vite |
| `npm run prepush:check` | full gate | `Pass` | Chạy node script để gom lint + typecheck + build liên tiếp |

---

## 6) Risks / Gaps
- **R-01 (Mất cân xứng bộ lọc giữa các API endpoint):** API Báo cáo chỉ nhận `year`, API Xuất Excel chỉ nhận `role`/`status`. Nếu gom chung bộ lọc không khéo có thể dẫn đến gửi sai tham số gây lỗi 422 từ Laravel backend validation.
- **R-02 (Thiếu cấu hình i18n cho tệp báo cáo mới):** Hệ thống i18n yêu cầu đồng bộ Việt-Anh. Khi thêm `users_report.json` mới, bắt buộc phải tạo đầy đủ ở cả 2 thư mục `vi/` và `en/`.

---

## 6.1) Smallest Safe Fixes
- **Fix-01 (Phân tách tham số tại API Call):** Thiết kế bộ lọc trên UI gom chung nhưng khi gọi hook fetch báo cáo chỉ truyền `year`, khi gọi action export chỉ truyền `role` và `status`. Điều này triệt tiêu hoàn toàn rủi ro R-01.
- **Fix-02 (Tạo đồng bộ tập tin ngôn ngữ):** Khởi tạo tệp `users_report.json` song song ở cả hai ngôn ngữ ngay tại Bước 03 hoặc Bước 04 của pipeline triển khai.

---

## 7) Recommended Next Actions
- [x] Continue with feature implementation
- [ ] Fix blockers first
- [ ] Re-audit after dependency/config update
