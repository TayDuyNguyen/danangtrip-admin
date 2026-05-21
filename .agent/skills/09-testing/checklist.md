# Checklist: 09-testing

> **GATE LOGIC: Phase 1 FAIL → dừng ngay, không chạy Phase 2-5**
> **Phase 2 crash/blank → dừng ngay, không chạy Phase 3-5**
> **Phase 3 happy path FAIL → dừng ngay, không chạy Phase 4-5**

## Phase 1 — Static Quality Gates [BLOCKING]
- [ ] `npm run lint` — PASS (0 errors)
- [ ] `npm run typecheck` — PASS (no type errors)
- [ ] `npm run build` — PASS
- [ ] `npm run prepush:check` — PASS
- [ ] **→ Tất cả PASS? Nếu không: DỪNG. Ghi lỗi. Yêu cầu fix.**

## Phase 2 — UI Visual [BLOCKING nếu crash]
- [ ] App load thành công (không blank screen, không crash)
- [ ] Layout không bị vỡ ở desktop (1440px)
- [ ] Layout không bị vỡ ở tablet (768px)
- [ ] Layout không bị vỡ ở mobile (375px)
- [ ] Skeleton hiển thị đúng khi loading (không phải spinner toàn trang)
- [ ] Empty state hiển thị đúng (không phải blank)
- [ ] Màu sắc / typography đúng DESIGN.md
- [ ] Không có console.error khi load trang
- [ ] **→ Có crash/blank? Nếu có: DỪNG. Ghi lỗi. Yêu cầu fix.**

## Phase 3 — Functional Flows [BLOCKING]
- [ ] Create: form → submit → toast success → bản ghi xuất hiện
- [ ] Update: edit → submit → toast success → bản ghi cập nhật
- [ ] Delete: click → confirm dialog → toast success → bản ghi biến mất
- [ ] Search: debounce đúng, URL params cập nhật, kết quả đúng
- [ ] Filter: URL params cập nhật, refresh giữ nguyên filter
- [ ] Pagination: URL params cập nhật, refresh giữ nguyên trang
- [ ] Form validation: required fields hiển thị error, format sai hiển thị error
- [ ] **→ Có happy path FAIL? Nếu có: DỪNG. Ghi flow nào fail. Yêu cầu fix.**

## Phase 4 — Edge Cases
- [ ] Submit form rỗng → tất cả required fields có error
- [ ] Input vượt max length → validation fail
- [ ] API timeout / offline → error state hiển thị, không crash
- [ ] 500 error → toast error, không expose raw error
- [ ] Double-click submit → chỉ 1 request

## Phase 5 — Regression
- [ ] Switch vi ↔ en: tất cả text đổi đúng, không có key thiếu
- [ ] Không có hardcoded text mới (tất cả qua `t()`)
- [ ] Truy cập không có auth → redirect về /login
- [ ] Các màn hình khác trong module vẫn hoạt động
- [ ] Không có console.error mới ở các trang khác

## Unit Tests
- [ ] Mapper tests: đã chạy hoặc ghi rõ NOT RUN + residual risk
- [ ] Schema tests: đã chạy hoặc ghi rõ NOT RUN + residual risk

## Verdict
- [ ] Phase 1-3 đều PASS → có thể xét READY
- [ ] Phase 4-5 có issues → READY WITH RISKS (liệt kê rõ)
- [ ] Bất kỳ phase blocking nào FAIL → NOT READY

## Output
- [ ] Test report tạo đúng path: `.agent/artifacts/test-cases/YYYY-MM-DD__<slug>__test-report.md`
- [ ] Report có đủ 5 phase
- [ ] Verdict rõ ràng với lý do cụ thể
