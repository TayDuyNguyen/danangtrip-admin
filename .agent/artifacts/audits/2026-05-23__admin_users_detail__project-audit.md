# Project Audit: Chi tiết Người dùng (`admin_users_detail`)

> Feature slug: `admin_users_detail`
> Date: 2026-05-23
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu**: Kiểm tra tính sẵn sàng của cơ sở mã nguồn hiện tại (dependencies, scripts, config, routing, auth, HTTP layer) trước khi tiến hành viết code cho tính năng Xem chi tiết người dùng (`admin_users_detail`).
- **Blocker**: Không tìm thấy bất kỳ blocker nào. Nền tảng project đang ở trạng thái cực kỳ lành mạnh và nhất quán với bộ quy tắc `PROJECT_RULES.md` và `REPO_FACTS.md`.

## 1.1) Audit Verdict
- **Verdict**: **READY** (Sẵn sàng triển khai ngay lập tức).
- **Lý do chính**:
  - Các thư viện cốt lõi (React 19, TS 5.9, Query v5, Zustand v5) đều trùng khớp với đặc tả stack.
  - Cấu hình aliases `@/*` được đồng bộ tuyệt đối giữa `vite.config.ts` và `tsconfig.app.json`.
  - Cơ chế Auth Bootstrap Gate và PrivateRoute bảo vệ bằng phân quyền admin đã hoạt động ổn định.
  - `axiosClient` được thiết kế chuyên nghiệp với cơ chế tự động làm mới token proactive, xử lý lỗi trung tâm và failover sang API dự phòng.

---

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| **React** | `^19` | `19.2.4` | ✓ PASS | Đúng chuẩn phiên bản mới nhất. |
| **Vite** | `^7` | `7.3.1` | ✓ PASS | Hoạt động trơn tru với plugin React. |
| **TypeScript**| `~5` | `5.9.3` | ✓ PASS | Trình biên dịch mạnh mẽ, chế độ verbatimModuleSyntax. |
| **TanStack Query**| `^5` | `5.95.2` | ✓ PASS | Thư viện quản lý server state chủ đạo. |
| **Zustand** | `^5` | `5.0.8` | ✓ PASS | Thư viện quản lý client state gọn nhẹ. |
| **React Router**| `^7` | `7.13.2` | ✓ PASS | Điều hướng và lazy load ổn định. |
| **Tailwind CSS**| `^4` | `4.2.2` | ✓ PASS | Hỗ trợ biên dịch CSS tốc độ cao qua LightningCSS. |

---

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | ✓ PASS | Đã có đầy đủ các file api gọi service, bao gồm `userApi.ts`. |
| `src/components/` | Exists | ✓ PASS | Thư mục UI dùng chung đã được phân chia rõ ràng. |
| `src/hooks/` | Exists | ✓ PASS | Các hooks Query dùng chung và riêng lẻ, đã có `useUserQueries.ts`. |
| `src/routes/` | Exists | ✓ PASS | File routes định nghĩa các URL và index.tsx cấu hình định tuyến. |

---

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | ✓ PASS | `resolve.alias: {'@': path.resolve(__dirname, './src')}` hoạt động tốt. |
| `tsconfig.app.json` | paths aligned | ✓ PASS | `"paths": { "@/*": ["./src/*"] }` khớp hoàn toàn với cấu hình Vite. |
| `.env.example` | required env vars | ✓ PASS | Đầy đủ các khóa môi trường từ VITE_PORT đến VITE_API_URL. |

---

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | ✓ PASS | Token được lấy từ store và tự động gắn vào Header trong request interceptor. |
| `axiosClient` | fallback URL logic | ✓ PASS | Thiết lập mảng api base chain để tự động failover khi base chính không phản hồi. |
| `axiosClient` | response/error interceptor| ✓ PASS | Xử lý tập trung mã lỗi 401 (làm mới token silent), 403 (quyền hạn), 5xx (hệ thống). |
| `providers` | Query bootstrap | ✓ PASS | `AppProviders` bọc chuẩn xác QueryClientProvider ngoài cùng và I18n. |
| `routes` | ProtectedRoute wiring | ✓ PASS | Định tuyến qua `PrivateRoute` thực hiện check `isAuthenticated && hasRole(user, 'admin')`. |

---

## 5.1) Commands / Scripts Audit
| Script | Purpose | Status | Notes |
|---|---|---|---|
| `npm run lint` | quality gate | ✓ PASS | Hoạt động hoàn hảo, không có lỗi cảnh báo không sử dụng. |
| `npm run typecheck`| type safety | ✓ PASS | `tsc -b` biên dịch kiểm lỗi type an toàn tuyệt đối. |
| `npm run build` | build verification | ✓ PASS | Đã tối ưu hóa manualChunks (lottie, recharts, vendor) để build nhanh. |
| `npm run prepush:check`| full gate | ✓ PASS | Script cục bộ chạy tuần tự lint, typecheck, build kiểm tra trước push. |

---

## 6) Risks / Gaps
* *Không phát hiện rủi ro lớn về mặt project setup.*
* **Lưu ý nhỏ (Warning)**: Cần chú ý file test Playwright E2E để bổ sung phạm vi định tuyến `/admin/users/:id` nhằm phục vụ việc kiểm thử lỗi console khi hoàn tất các bước sau.

## 6.1) Smallest Safe Fixes
* Không cần fix nào ở bước này do project setup đã hoàn hảo.

---

## 7) Recommended Next Actions
- [x] Triển khai tiếp bước tiếp theo của Pipeline (Step 03: `03-types-api-contract`) để điều chỉnh Backend API và tạo hợp đồng kiểu dữ liệu frontend.
