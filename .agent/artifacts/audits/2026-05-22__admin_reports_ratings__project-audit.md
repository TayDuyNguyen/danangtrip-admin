# Project Audit: Báo cáo Đánh giá (Ratings Report)

> Feature slug: `admin_reports_ratings`
> Date: 2026-05-22
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu**: Đánh giá tính sẵn sàng của repository `danangtrip-admin` trước khi bắt đầu thực hiện các bước phát triển chức năng **Báo cáo Đánh giá (Ratings Report)**. Đảm bảo cấu hình, thư viện, aliases và các luồng HTTP/Auth hoạt động ổn định và nhất quán với dự án.
- **Kết quả**: Dự án cơ sở đang ở trạng thái tốt, các quality gate như lint, typecheck và production build đều vượt qua thành công sau một sửa đổi nhỏ về kiểu dữ liệu kiểm thử.

## 1.1) Audit Verdict
- **Verdict**: `READY`
- **Lý do chính**:
  - Tất cả các lệnh kiểm tra chất lượng tĩnh (`npm run lint`, `npm run typecheck`, `npm run build`, `npm run prepush:check`) đều vượt qua 100%.
  - Luồng interceptor trong `axiosClient.ts`, luồng định tuyến và phân quyền (`PrivateRoute.tsx`) đều được tích hợp hoàn chỉnh và hoạt động đúng quy trình.
  - Sửa đổi thành công lỗi khai báo type không tường minh (`Page` vs `type Page`) trong `tests/admin-reports-bookings.spec.ts` dưới chế độ `verbatimModuleSyntax`.

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | `^19.2.4` | `19.2.4` | `PASS` | Phù hợp chuẩn React 19 mới nhất |
| Vite | `^7.3.1` | `7.3.1` | `PASS` | Phù hợp chuẩn Vite v7 |
| TypeScript | `~5.9.3` | `5.9.3` | `PASS` | Hỗ trợ đầy đủ kiểu dữ liệu và alias |
| TanStack Query | `^5.95.2` | `5.95.2` | `PASS` | Quản lý cache và truy vấn server state |
| Zustand | `^5.0.8` | `5.0.8` | `PASS` | Quản lý state của người dùng và auth |
| Recharts | `^3.8.1` | `3.8.1` | `PASS` | Cần thiết để vẽ biểu đồ báo cáo đánh giá |

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | `PASS` | Chứa `axiosClient.ts` và các API service |
| `src/components/` | Exists | `PASS` | Chứa component giao diện dùng chung và UI components |
| `src/hooks/` | Exists | `PASS` | Chứa hooks tùy biến |
| `src/routes/` | Exists | `PASS` | Chứa file khai báo routes và các route guard |
| `src/dataHelper/` | Exists | `PASS` | Chứa mappers chuyển đổi dữ liệu |

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | `PASS` | Trỏ chính xác về `./src` |
| `tsconfig.app.json` | paths aligned | `PASS` | Đồng bộ đường dẫn `@/*` với Vite config |
| `.env.example` | required env vars present | `PASS` | Đầy đủ các khóa `VITE_API_URL`, `VITE_PORT`,... |

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | `PASS` | Tự động đính kèm Token trong Authorization Header |
| `axiosClient` | fallback URL logic | `PASS` | Có cơ chế failover sang các base URL phụ từ env |
| `axiosClient` | response/error interceptor | `PASS` | Bắt lỗi 401 tự động kích hoạt refresh hoặc logout |
| `providers` | Query bootstrap | `PASS` | `AppProviders` wrap `QueryClientProvider` chính xác |
| `routes` | ProtectedRoute wiring | `PASS` | Bảo vệ các route admin thông qua `PrivateRoute` |

## 5.1) Commands / Scripts Audit
| Script | Purpose | Status | Notes |
|---|---|---|---|
| `npm run lint` | quality gate | `PASS` | Hoạt động tốt sau khi sửa lỗi import type |
| `npm run typecheck` | type safety | `PASS` | Hoàn thành biên dịch không có lỗi loại dữ liệu |
| `npm run build` | build verification | `PASS` | Build ra thư mục `dist` thành công |
| `npm run prepush:check` | full gate | `PASS` | Chạy toàn bộ các bước kiểm tra chất lượng tĩnh |

## 6) Risks / Gaps
- **R-01**: Playwright console testing (`npm run test:console`) bị bỏ qua trong chất lượng tĩnh do local dev server chưa chạy ở port 5173 tại thời điểm chạy script tự động.
  - *Ảnh hưởng*: Thấp đối với việc phát triển tính năng tĩnh, nhưng cần đảm bảo chạy dev server khi thực hiện E2E testing ở bước sau.

## 6.1) Smallest Safe Fixes
- **Fix-01**: Chuyển đổi import `Page` trong `tests/admin-reports-bookings.spec.ts` thành `type Page` để sửa lỗi build biên dịch tĩnh khi bật `verbatimModuleSyntax` trong TypeScript configuration. *(Đã thực hiện thành công)*.

## 7) Recommended Next Actions
- [x] Sửa đổi lỗi verbatimModuleSyntax của Playwright test.
- [x] Chạy kiểm thử chất lượng tĩnh thành công.
- [ ] Chuyển tiếp sang Bước 3: Định nghĩa kiểu dữ liệu và API Contract (`03-types-api-contract`).
