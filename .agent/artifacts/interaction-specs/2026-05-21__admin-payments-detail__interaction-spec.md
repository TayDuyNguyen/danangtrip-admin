# Interaction Spec: Admin Payments Detail

> Feature slug: `admin-payments-detail`
> Date: 2026-05-21
> Source hooks: `src/hooks/usePaymentQueries.ts`

---

## 1) Main User Actions
| Action | Trigger | API / Hook | Success Feedback | Error Feedback |
|---|---|---|---|---|
| Back to list | Click ArrowLeft button or "Back to list" error action button | Navigate locally | N/A (Instant redirect) | N/A |
| View booking details | Click booking code badge | Navigate locally | N/A (Instant redirect) | N/A |
| Open Refund Dialog | Click "Refund" button (only visible if status is `success` and user is `admin`) | Local component state `setIsRefundDialogOpen(true)` | Dialog renders with overlay and animations | N/A |
| Close Refund Dialog | Click Backdrop overlay, X close button, or "Cancel" button | Local component state `setIsRefundDialogOpen(false)` | Dialog unmounts and form resets | N/A |
| Submit Refund Request | Click "Confirm Refund" button | `refundMutation.mutate` from `usePaymentMutations` | Success toast with transaction code, close dialog, invalidate payment query | Error toast with API error message, keep dialog open |

## 1.1) Action Priority
| Action | Priority | Why |
|---|---|---|
| Refund Action | High | Critical administrative payment override. Requires strict validation, confirmation, and role verification. |
| Navigation Links | Medium | Core screen flow to let administrators toggle back to lists or deep-dive into related Bookings. |

## 2) Forms
| Form | Fields | Validation Source | Submit Flow | Reset/Cancel Flow |
|---|---|---|---|---|
| Refund Form | `refund_reason` (Textarea, required, 10-255 characters) | Inline Yup validation schema via `yupResolver` | Triggered via `handleSubmit(handleFormSubmit)`. Fires `refundMutation.mutate`, disables buttons, shows loading spinner, triggers feedback toast on complete, closes modal, and invalidates queries. | Reset form state on closing modal or successful submission. |

## 3) Filters / Search / Pagination
*No active search, filtering, or pagination on this page. All list filtering and pagination are handled on the main Payments List screen.*

## 3.1) Default Values / Reset Logic
| Control | Default Value | Reset Behavior | Notes |
|---|---|---|---|
| Refund Form | `{ refund_reason: "" }` | Reset to empty string when closed or submitted. | Uses react-hook-form `reset()`. |

## 4) Confirm / Destructive Actions
| Action | Confirm UI | Permission | Notes |
|---|---|---|---|
| Refund Payment | Customized modal dialog `RefundPaymentDialog` containing transaction metadata, warning banners, reason input. | `admin` role only | Restricted via frontend auth check (`user?.role === 'admin'`). API enforces backend protection. Staff users see a helper tooltip stating they lack permissions. |

## 4.1) Loading / Pending Behavior
| Action | Pending UI | Disabled Elements | Notes |
|---|---|---|---|
| Refund Payment | Confirm button displays rotating loading spinner. | "Confirm Refund", "Cancel", and X buttons are disabled during mutation execution. | Prevents duplicate API requests. |

## 5) i18n Keys To Add
*Note: All required keys are already fully implemented in both languages.*

### `vi/payment.json`
- `action.refund`: "Hoàn tiền"
- `action.refund_tooltip_staff`: "Chỉ người quản trị mới có quyền thực hiện hoàn tiền"
- `refund.dialog_title`: "Xác nhận Hoàn tiền"
- `refund.dialog_desc`: "Bạn đang yêu cầu hoàn tiền cho giao dịch của khách hàng. Vui lòng kiểm tra kỹ thông tin."
- `refund.warning_title`: "LƯU Ý QUAN TRỌNG:"
- `refund.warning_desc`: "Hành động này là không thể thu hồi. Tiền sẽ được gửi hoàn lại qua tài khoản ví điện tử hoặc tài khoản ngân hàng của khách hàng tùy thuộc vào cổng giao dịch thanh toán."
- `refund.amount`: "Số tiền hoàn:"
- `refund.reason_label`: "Lý do hoàn tiền *"
- `refund.reason_placeholder`: "Nhập chi tiết lý do hoàn tiền (tối thiểu 10 ký tự)..."
- `refund.btn_cancel`: "Hủy bỏ"
- `refund.btn_confirm`: "Xác nhận hoàn tiền"
- `refund.toast_success`: "Yêu cầu hoàn tiền giao dịch {{code}} đã được thực hiện thành công!"
- `refund.toast_error`: "Có lỗi xảy ra khi thực hiện hoàn tiền: {{message}}"
- `validation.reason_required`: "Lý do hoàn tiền là bắt buộc"
- `validation.reason_min`: "Lý do hoàn tiền phải từ 10 ký tự trở lên"
- `validation.reason_max`: "Lý do hoàn tiền tối đa 255 ký tự"

### `en/payment.json`
- `action.refund`: "Refund"
- `action.refund_tooltip_staff`: "Only administrators have permission to refund payments"
- `refund.dialog_title`: "Confirm Refund"
- `refund.dialog_desc`: "You are requesting a refund for this customer transaction. Please verify the details carefully."
- `refund.warning_title`: "IMPORTANT NOTE:"
- `refund.warning_desc`: "This action is irreversible. The funds will be returned to the customer's e-wallet or bank account depending on the gateway used."
- `refund.amount`: "Refund Amount:"
- `refund.reason_label`: "Refund Reason *"
- `refund.reason_placeholder`: "Enter detailed refund reason (minimum 10 characters)..."
- `refund.btn_cancel`: "Cancel"
- `refund.btn_confirm`: "Confirm Refund"
- `refund.toast_success`: "Refund request for transaction {{code}} has been successfully executed!"
- `refund.toast_error`: "An error occurred while executing refund: {{message}}"
- `validation.reason_required`: "Refund reason is required"
- `validation.reason_min`: "Refund reason must be at least 10 characters"
- `validation.reason_max`: "Refund reason cannot exceed 255 characters"

## 6) Risks / Open Questions
- **R-01: Double submissions**: If network request hangs, user could try to double click button.
  - *Mitigation*: The confirmation button is disabled and displays a spinning spinner whenever `isSubmitting` / `refundMutation.isPending` is active.
- **R-02: Backend Role Validation**: Staff could attempt to call refund endpoints by tampering with UI code.
  - *Mitigation*: Ensure the backend endpoint strictly guards the refund request by verifying the requesting user's role is `admin`.
- **Q-01: Partial Refunds**: Does the gateway support partial refunding?
  - *Answer*: Currently, the app only supports a full refund (100% of the `amount`). Partial refunds are not supported.
