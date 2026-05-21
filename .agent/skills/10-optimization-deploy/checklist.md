# Checklist: 10-optimization-deploy

## Gate Check
- [ ] Test report từ skill 09 là `READY` hoặc `READY WITH RISKS`
- [ ] Nếu `NOT READY` → DỪNG, không tiếp tục

## Artifact Trace
- [ ] `analysis/...__screen-analysis.md` tồn tại
- [ ] `test-cases/...__test-report.md` tồn tại
- [ ] Các artifact khác (api-contract, route-plan, ui-spec, v.v.) ghi rõ có/không

## Build & Quality Gates
- [ ] `npm run lint` — PASS
- [ ] `npm run typecheck` — PASS
- [ ] `npm run build` — PASS
- [ ] `npm run prepush:check` — PASS

## Performance
- [ ] Bundle size hợp lý (initial JS < 300KB gzipped)
- [ ] Modal/Dialog dùng lazy-load
- [ ] Không có query waterfall vô lý
- [ ] Skeleton đúng chỗ, không có full-page spinner

## Smoke Test
- [ ] Feature page load OK
- [ ] Action chính hoạt động (CRUD)
- [ ] Auth redirect đúng
- [ ] Browser console không có errors

## Output Documents
- [ ] `deploy-report.md` tạo đúng path: `.agent/artifacts/deploy/...`
- [ ] `review.md` tạo đúng path: `.agent/artifacts/review/...`
- [ ] `review.md` có: objective, scope, artifact trace, technical decisions, validation summary, risks

## Git Handoff
- [ ] Đã gợi ý tên nhánh (feat/fix/refactor/chore + feature-slug)
- [ ] Đã gợi ý commit message theo Conventional Commits
- [ ] Đã hiển thị các lệnh git cần chạy
- [ ] **DỪNG và chờ USER xác nhận trước khi push**
- [ ] Chỉ push sau khi USER gõ "push" hoặc "confirm push"
