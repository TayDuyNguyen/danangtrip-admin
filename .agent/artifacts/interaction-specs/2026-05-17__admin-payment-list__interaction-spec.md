# Interaction Spec: Admin Payment List

- Feature slug: `admin-payment-list`
- Date: `2026-05-17`
- Route: `/admin/payments`

## 1. Scope

This screen manages payment transactions for admins with the following primary behaviors:

- search by transaction code or booking code
- filter by payment status
- filter by payment gateway
- filter by date range
- paginate through results
- export the filtered dataset
- request refund for eligible payments

## 2. State Ownership

- `filters` is local component state in [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/index.tsx).
- `page` is local component state in [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/index.tsx).
- `debouncedFilters` is derived through `useDebounce(filters, 400)`.
- refund dialog state is local:
  - `refundPayment: PaymentItem | null`
  - `isRefundOpen: boolean`
- query state is owned by TanStack Query via `useAdminPaymentsQuery`.
- mutation state is owned by TanStack Query via `usePaymentMutations`.

## 3. Data Flow

### 3.1 List query

- Trigger: initial render, debounced filter change, page change
- Hook: `useAdminPaymentsQuery(filters, page, limit)`
- Endpoint: `GET /admin/payments`
- Query params:
  - `search`
  - `payment_status`
  - `payment_gateway`
  - `date_from`
  - `date_to`
  - `page`
  - `per_page`

### 3.2 Refund mutation

- Trigger: confirm submit inside `RefundPaymentDialog`
- Hook: `refundMutation`
- Endpoint: `POST /admin/payments/{id}/refund`
- Body:
```json
{
  "refund_reason": "string"
}
```

### 3.3 Export mutation

- Trigger: click export button
- Hook: `exportMutation`
- Endpoint: `GET /admin/payments/export`
- Uses current filters only

## 4. User Actions

### 4.1 Search

- Control: text input in [PaymentFilterBar.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentFilterBar.tsx)
- Immediate behavior: updates local `filters.search`
- Network behavior: debounced by 400ms before query runs
- Page behavior: resets `page` to `1`

### 4.2 Payment status filter

- Control: select input
- Values:
  - empty
  - `pending`
  - `success`
  - `failed`
  - `refunded`
- Page behavior: resets `page` to `1`

### 4.3 Payment gateway filter

- Control: select input
- Values:
  - empty
  - `momo`
  - `vnpay`
  - `zalopay`
- Page behavior: resets `page` to `1`

### 4.4 Date range filters

- Controls:
  - `date_from`
  - `date_to`
- Behavior: updates local filters and retriggers the list query through debounce

### 4.5 Reset filters

- Control: reset button
- Behavior:
  - clears search
  - clears status
  - clears gateway
  - clears dates
  - resets page to `1`

### 4.6 Pagination

- Controls: previous and next buttons in [PaymentTable.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx)
- Behavior:
  - previous decrements page if `current_page > 1`
  - next increments page if `current_page < last_page`

### 4.7 Export

- Control: export button in [PaymentFilterBar.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentFilterBar.tsx)
- Pending state:
  - button disabled while exporting
  - icon animates
  - loading toast shown through `toast.promise`
- Success state:
  - file download starts
  - success toast shown
- Error state:
  - error toast shown with backend message when available

### 4.8 Refund payment

- Trigger: click refund action in row
- Eligibility in current UI:
  - shown only when `payment.status === "success"`
  - button disabled for non-admin users
- Dialog:
  - opens with selected payment details
  - requires `refund_reason`
  - validates min length `10`
  - validates max length `255`
- Submit behavior:
  - mutation starts
  - submit button shows spinner
  - on success:
    - success toast
    - dialog closes
    - selected payment clears
    - queries invalidated via `paymentKeys.all`
    - dashboard queries invalidated via `["dashboard"]`
  - on error:
    - error toast
    - dialog remains open

## 5. Loading, Empty, And Error States

### 5.1 Loading

- table area renders skeleton rows while `isLoading` is true
- stats row receives `isLoading`

### 5.2 Empty

- empty card shown when `payments.length === 0`
- messaging exists in `payment` namespace

### 5.3 Error

- list-level error UI is not explicitly rendered in [index.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/index.tsx)
- current query hookup only consumes `data` and `isLoading`
- risk:
  - fetch failure may collapse into empty or stale UI without a dedicated retry surface

## 6. Validation Rules

### Refund dialog

- field: `refund_reason`
- rules:
  - required
  - minimum 10 characters
  - maximum 255 characters

## 7. Permission-Sensitive Interactions

- route access is guarded globally by `PrivateRoute`
- refund action is additionally gated in the table:
  - `admin` can click refund
  - non-admin sees disabled button with tooltip

## 8. Interaction Risks

1. Booking detail navigation is likely incorrect.
   Current row link uses `${ROUTES.BOOKINGS_LIST}/${payment.id}` in [PaymentTable.tsx](/D:/DATN/danangtrip-admin/src/pages/Payments/PaymentList/components/PaymentTable.tsx), but available route config only exposes `/admin/bookings` list and does not register a booking detail route.
2. List error handling is incomplete.
   No explicit `isError` or retry UI is rendered for failed list fetches.
3. Filter state is not URL-synced.
   Refreshing or sharing the page loses current filter and page state.
4. Stats are computed from the current page payload instead of a dedicated summary endpoint.
   This can misrepresent totals when pagination is active.

## 9. Suggested Test Focus

- debounce behavior during rapid search typing
- filter combinations and page reset behavior
- refund dialog validation and admin-only affordance
- export behavior with active filters
- failed list query presentation
- booking link behavior from the transaction table
