# Checklist: 03-types-api-contract

- [ ] Raw<Entity> interface match chính xác backend response shape.
- [ ] ViewModel interface clean, đủ fields cho UI consume.
- [ ] Types đặt đúng `src/types/<feature>.ts`.
- [ ] Yup schema là function nhận `t: TFunction` — không hardcode messages.
- [ ] Schema export type inference: `yup.InferType<ReturnType<typeof schema>>`.
- [ ] API module dùng endpoints từ `src/constants/endpoints.ts` — không hardcode paths.
- [ ] API module import axiosClient từ `src/api/axiosClient.ts`.
- [ ] API module chỉ transport — không có business logic.
- [ ] Mapper dùng safe converters (toNumberSafe, toArraySafe, etc.).
- [ ] Mapper cover tất cả fields từ Raw → ViewModel.
- [ ] Không có `any` type — dùng `unknown` + narrowing nếu cần.
- [ ] Import type cho type-only imports.
- [ ] API contract doc tạo đúng path: `.agent/artifacts/api-contracts/...`.
- [ ] Đã reuse types hiện có (không tạo duplicate).
