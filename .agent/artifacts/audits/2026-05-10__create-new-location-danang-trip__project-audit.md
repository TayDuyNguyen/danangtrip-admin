# Project Audit: Create New Location
> Feature slug: `create-new-location-danang-trip`
> Date: 2026-05-10
> Scope: `project base audit`

---

## 1) Summary
- **Mục tiêu**: Kiểm tra tính sẵn sàng của Project Base trước khi triển khai tính năng "Tạo Địa điểm mới".
- **Kết quả**: Project base tuân thủ tốt `PROJECT_RULES.md`. Không có blocker nào.

## 2) Dependency Audit
| Item | Expected | Actual | Status | Notes |
|---|---|---|---|---|
| React | ^19.0.0 | 19.2.4 | PASS | |
| Vite | ^6.0.0+ | 7.3.1 | PASS | |
| TypeScript | ~5.0.0 | 5.9.3 | PASS | |
| TanStack Query | ^5.0.0 | 5.95.2 | PASS | |
| Zustand | ^5.0.0 | 5.0.8 | PASS | |
| React Router | v7 | 7.13.2 | PASS | |
| Tailwind CSS | v4 | 4.2.2 | PASS | |

## 3) Repository Shape Audit
| Path | Expected | Status | Notes |
|---|---|---|---|
| `src/api/` | Exists | PASS | Chứa `axiosClient.ts` và các API modules. |
| `src/components/` | Exists | PASS | Đã có hệ thống UI atomic components. |
| `src/hooks/` | Exists | PASS | Chứa logic React Query hooks. |
| `src/routes/` | Exists | PASS | Quản lý route với Private/Public guards. |
| `src/dataHelper/` | Exists | PASS | Chứa mappers theo Pillar 3 của Rules. |

## 4) Config Audit
| Config | Check | Status | Notes |
|---|---|---|---|
| `vite.config.ts` | alias `@/*` | PASS | Định nghĩa `@` trỏ tới `./src`. |
| `tsconfig.app.json` | paths aligned | PASS | `paths` khớp với Vite alias. |
| `.env.example` | required env vars | PASS | Đã có `VITE_API_URL`, `VITE_STITCH_...`. |

## 5) HTTP / Auth Bootstrap Audit
| Area | Check | Status | Notes |
|---|---|---|---|
| `axiosClient` | Bearer token attach | PASS | Tự động lấy từ `getAccessToken()`. |
| `axiosClient` | fallback URL logic | PASS | Có `baseChain` failover trong response interceptor. |
| `axiosClient` | refresh handling | PASS | Proactive refresh (trước khi gửi) và Reactive refresh (khi 401). |
| `providers` | Query bootstrap | PASS | `QueryClientProvider` bọc ở level cao nhất. |
| `routes` | ProtectedRoute wiring | PASS | `PrivateRoute` bọc toàn bộ module quản trị. |

## 6) Risks / Gaps
- **G-01**: `package.json` hiện đang để `name: "datn-frontend-user"`. Có thể là tên cũ từ bản web-user. Nên cập nhật thành `danangtrip-admin`.
- **G-02**: `axiosClient` hiện đang redirect `window.location.replace` khi logout. Điều này có thể gây hard-reload không cần thiết nếu App Router hỗ trợ navigation tốt hơn. Tuy nhiên hiện tại vẫn an toàn.

## 7) Recommended Next Actions
- [x] Continue with feature implementation (01-screen-analysis đã hoàn thành).
- [ ] Tiến hành bước `03-types-api-contract` để chuẩn hóa payload cho Create Location.
