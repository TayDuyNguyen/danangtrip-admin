# Project Audit: Báo cáo Địa điểm (Locations Report)

> Feature slug: `admin_reports_locations`
> Date: 2026-05-22
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu**: Đánh giá tính sẵn sàng của repository `danangtrip-admin` trước khi bắt đầu thực hiện các bước phát triển và tích hợp chức năng **Báo cáo Địa điểm (Locations Report)**. Đảm bảo cấu hình, thư viện, aliases và các luồng HTTP/Auth hoạt động ổn định và nhất quán với dự án.
- **Kết quả**: Dự án cơ sở đang ở trạng thái tốt, các quality gate như lint, typecheck và production build đều vượt qua thành công, đủ điều kiện để triển khai tiếp các bước tích hợp và interactions.

## 1.1) Audit Verdict
- **Verdict**: `READY`
- **Lý do chính**:
  - Lệnh chất lượng đầu vào (`npm run prepush:check`) chạy thành công, linter và typecheck không báo lỗi.
  - Các cấu hình đường dẫn tuyệt đối (Vite alias `@/*` và TypeScript paths) hoàn toàn đồng bộ.
  - `axiosClient.ts` sở hữu đầy đủ luồng tự động làm mới access token (interceptor), đính kèm Bearer token và failover dự phòng.
  - Khai báo định tuyến cho `/admin/reports/locations` đã khớp với page-level lazy loading của `LocationReport`.

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | `^19.2.4` | `19.2.4` | `PASS` | Phù hợp chuẩn React 19 mới nhất |
| Vite | `^7.3.1` | `7.3.1` | `PASS` | Phù hợp chuẩn Vite v7 |
| TypeScript | `~5.9.3` | `5.9.3` | `PASS` | Hỗ trợ đầy đủ kiểu dữ liệu và alias |
| TanStack Query | `^5.95.2` | `5.95.2` | `PASS` | Quản lý cache và truy vấn server state |
| Zustand | `^5.0.8` | `5.0.8` | `PASS` | Quản lý state của người dùng và auth |
| Recharts | `^3.8.1` | `3.8.1` | `PASS` | Vẽ biểu đồ donut phân bổ danh mục và bar phân bổ quận/huyện |
| React Router DOM | `^7.13.2` | `7.13.2` | `PASS` | Định tuyến v7 mượt mà |

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | `PASS` | Chứa `axiosClient.ts`, `reportApi.ts` và `locationApi.ts` |
| `src/components/` | Exists | `PASS` | Chứa component giao diện dùng chung và UI components |
| `src/hooks/` | Exists | `PASS` | Chứa hooks tùy biến như `useReportQueries.ts` |
| `src/routes/` | Exists | `PASS` | Chứa file khai báo routes (`routes.ts` và `index.tsx`) |
| `src/dataHelper/` | Exists | `PASS` | Chứa mappers và dữ liệu helper như `report.mapper.ts` |
| `src/pages/Reports/LocationReport/` | Exists | `PASS` | Thư mục chứa trang báo cáo địa điểm và các component phụ |

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
| `npm run lint` | quality gate | `PASS` | Hoạt động tốt |
| `npm run typecheck` | type safety | `PASS` | Hoàn thành biên dịch không có lỗi loại dữ liệu |
| `npm run build` | build verification | `PASS` | Build ra thư mục `dist` thành công |
| `npm run prepush:check` | full gate | `PASS` | Chạy toàn bộ các bước kiểm tra chất lượng tĩnh |

## 6) Risks / Gaps
- **R-01**: Playwright console testing (`npm run test:console`) bị bỏ qua trong chất lượng tĩnh do local dev server chưa chạy ở port 5173 tại thời điểm chạy script tự động.
  - *Ảnh hưởng*: Thấp đối với việc phát triển tính năng tĩnh, nhưng cần đảm bảo chạy dev server khi thực hiện E2E testing ở bước sau.

## 7) Recommended Next Actions
- [x] Tạo tệp audit dự án cho tính năng Báo cáo Địa điểm.
- [x] Chạy kiểm thử chất lượng tĩnh thành công.
- [ ] Chuyển tiếp sang Bước 3: Định nghĩa kiểu dữ liệu và API Contract (`03-types-api-contract`).
