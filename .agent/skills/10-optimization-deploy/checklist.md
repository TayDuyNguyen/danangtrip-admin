# Checklist: 10-optimization-deploy

- [ ] `npm run lint` — PASS
- [ ] `npm run typecheck` — PASS
- [ ] `npm run build` — PASS
- [ ] Bundle size hợp lý (không có chunk > 500KB không cần thiết)
- [ ] Dynamic import cho modals và heavy components
- [ ] Parallel queries cho independent data (không waterfall)
- [ ] Smoke test: feature page load OK sau build/deploy
- [ ] Smoke test: CRUD flow hoạt động
- [ ] Smoke test: Auth guard hoạt động (unauthorized → redirect)
- [ ] Browser console: không có errors sau deploy
- [ ] Deploy report tạo đúng path: `.agent/artifacts/deploy/...`
