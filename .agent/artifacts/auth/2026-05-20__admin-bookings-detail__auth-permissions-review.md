# Auth & Permissions Review: Chi tiết Đơn hàng (Booking Detail)

> Feature slug: `admin-bookings-detail`
> Date: 2026-05-20
> Route scope: `/admin/bookings/:id`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| `/admin/bookings/:id` | `PrivateRoute` | `admin` | Redirect to `/login` if unauthenticated | Gated under admin space layout |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| admin | ✓ | ✓ | ✓ | ✗ | ✓ | Standard full operations capability. *Delete bookings is not supported by API design.* |

## 2.1) Action Matrix
| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| View Details | `admin` | Render the entire detail workspace with Customer and Tour panels | Returns 200 OK with detail payload | Core requirement |
| Confirm Status | `admin` | Display emerald "Xác nhận đơn" button | Processes `PATCH /admin/bookings/{id}/status` | Updates `booking_status` to `confirmed` |
| Complete Status | `admin` | Display teal "Xác nhận hoàn tất" button | Processes `PATCH /admin/bookings/{id}/status` | Updates `booking_status` to `completed` |
| Cancel Status | `admin` | Display red "Hủy đơn" button | Processes `PATCH /admin/bookings/{id}/status` | Requires `cancellation_reason` |
| Export Invoice | `admin` | Display download button beside title | Returns PDF stream or URL | Asynchronous export |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| Action Operations Sidebar Panel | `admin` | Current frontend route guard and backend admin APIs are admin-only |

## 3.1) Hidden vs Disabled Decisions
| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| Operations Buttons (Confirm, Complete, Cancel) | Hidden | Hidden if the booking status is in a terminal state (`completed` / `cancelled`) | None. Confirms UX clarity. |
| Inactive Operations Buttons | Hidden | Hidden if booking status does not allow transition (e.g. Confirm is hidden when status is already `confirmed`) | Operator confusion if buttons are visible but disabled. Better to only display actionable status changes. |
| Invoice download | Disabled | Disabled during network download (`getInvoiceMutation.isPending`) | Prevents duplicate requests. |

## 4) Token / Redirect Flow Review
| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| Token attach | Attaches JWT header automatically inside `axiosClient` interceptor | Clean authorization header propagation on every endpoint call | PASS | Wires via standard bearer token |
| Logout | Clears storage, redirects client to `/login` | Storage keys wiped and state flushed | PASS | Uses standard auth store |
| Unauthorized redirect | Axio client interceptor catches 401 and routes to `/login` | Seamless bounce to login portal | PASS | Global interceptor |
| Wrong role redirect | Private route blocks non-admin users and redirects to `/login` | Prevents privilege escalation | PASS | Handled inside route guards |

## 5) Risks / Assumptions
- **[ASSUMPTION] A-01:** This screen is intentionally admin-only in the current product and backend permission model.
- **R-01 (Token expiration):** Session may expire mid-action. Mitigated by Sonner toast alert from axios client interceptor catching 401s.

## 6) Files / Areas Affected
- [routes/index.tsx](file:///d:/DATN/danangtrip-admin/src/routes/index.tsx) (Route registration under private namespace)
- [routes/routes.ts](file:///d:/DATN/danangtrip-admin/src/routes/routes.ts) (Route constants)
- [bookingApi.ts](file:///d:/DATN/danangtrip-admin/src/api/bookingApi.ts) (Endpoints request execution)
- [BookingDetail/index.tsx](file:///d:/DATN/danangtrip-admin/src/pages/Bookings/BookingDetail/index.tsx) (Component workspace guarding)
