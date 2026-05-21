# DanangTrip Admin Agent Kit

Bộ `.agent/` này là **project-local operating kit** dành riêng cho `danangtrip-admin`.
Mục tiêu của nó không phải là làm thật nhiều skill, mà là làm cho AI có thể:

1. Hiểu đúng repo hiện tại
2. Sinh ra tài liệu chi tiết, nhất quán, dễ review
3. Đi theo đúng pipeline triển khai màn hình Admin từ phân tích đến bàn giao

Khi có xung đột, hãy ưu tiên:

1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. Repo thực tế (`package.json`, `src/`, `vite.config.ts`, `tsconfig.app.json`)
4. Các `SKILL.md` trong `.agent/skills/`

`ARCHITECTURE.md` là file inventory và định hướng sử dụng, **không phải** source of truth cho runtime architecture của app.

Quick anchors:

- Repo facts: `.agent/rules/REPO_FACTS.md`
- Drift check: `.agent/scripts/verify_agent_drift.py`

## Inventory thực tế

Hiện bộ `.agent/` này có:

- `10` pipeline skills trong `.agent/skills/`
- `20` agent profiles trong `.agent/agents/`
- `11` workflow files trong `.agent/workflows/`
- Helper scripts trong `.agent/scripts/`
- Shared reference assets trong `.agent/.shared/`

## Directory Map

```text
.agent/
├── .shared/      # Shared datasets / prompts / utilities dùng chung
├── agents/       # Persona documents
├── artifacts/    # Output tài liệu sinh ra trong quá trình làm việc
├── rules/        # Project rules và policy
├── scripts/      # Helper scripts
├── skills/       # 10 skill pipeline cho màn hình Admin
└── workflows/    # Workflow orchestration ngắn gọn
```

## Core Principle

Bộ này được tối ưu cho **artifact-first delivery**.

Điều đó có nghĩa là:

- Trước khi code hoặc song song với code, AI phải sinh ra tài liệu đúng bước
- Mỗi skill phải có input rõ, output rõ, nơi lưu rõ
- Tài liệu sinh ra phải đủ chi tiết để người khác review lại sau này
- Tài liệu phải bám repo thật, không bịa abstraction hoặc stack không tồn tại

## Pipeline Skills

Đây là bộ 10 skill chính đang tồn tại trong repo:

| # | Skill | Mục tiêu | Artifact chính |
|---|---|---|---|
| 01 | `01-screen-analysis` | Phân tích mockup/SRS và bóc tách requirement | `artifacts/analysis/` |
| 02 | `02-project-setup` | Audit project base trước khi triển khai | `artifacts/audits/` |
| 03 | `03-types-api-contract` | Chuẩn hóa types, schema, API contract, mapper | `artifacts/api-contracts/` |
| 04 | `04-layout-routing` | Lập kế hoạch route, layout, navigation | `artifacts/routing/` |
| 05 | `05-ui-components` | Thiết kế chi tiết UI components cần build | `artifacts/ui-specs/` |
| 06 | `06-data-integration` | Lập kế hoạch tích hợp data và hooks | `artifacts/integration/` |
| 07 | `07-interactions` | Xác định flow CRUD, filter, search, export | `artifacts/interaction-specs/` |
| 08 | `08-auth-permissions` | Rà soát auth guard và permission matrix | `artifacts/auth/` |
| 09 | `09-testing` | Ghi nhận quality gates và test results | `artifacts/test-cases/` |
| 10 | `10-optimization-deploy` | Tổng hợp deploy, smoke test, review bàn giao | `artifacts/deploy/`, `artifacts/review/` |

Master index của pipeline nằm tại:

- `.agent/skills/STACK_SKILLS_INDEX.md`

## Artifact Layout

Các artifact nên được lưu theo convention:

```text
.agent/artifacts/
├── analysis/
├── audits/
├── api-contracts/
├── routing/
├── ui-specs/
├── integration/
├── interaction-specs/
├── auth/
├── test-cases/
├── deploy/
└── review/
```

Tên file chuẩn:

```text
YYYY-MM-DD__<feature-slug>__<artifact-name>.md
```

Ví dụ:

```text
2026-05-10__location-create__screen-analysis.md
2026-05-10__location-create__project-audit.md
2026-05-10__location-create__api-contract.md
2026-05-10__location-create__review.md
```

## Documentation Standard

Mọi tài liệu sinh ra từ skill phải tuân thủ các rule sau:

- Lưu file dưới dạng `UTF-8`
- Dùng Markdown sạch, không ký tự lỗi kiểu `Ã`, `â†’`, `má»¥c`
- Chỉ dùng `1` tiêu đề H1 cho mỗi tài liệu
- Phải có metadata tối thiểu: `feature slug`, `date`, `inputs/source`
- Nếu có assumption, ghi rõ `[ASSUMPTION]`
- Nếu có thông tin chưa xác minh, ghi rõ `Open Questions`
- Nếu skill tạo code, tài liệu vẫn phải chỉ ra file dự kiến thay đổi hoặc file đã thay đổi

## Workflow Usage

Khuyến nghị thứ tự làm việc cho một feature mới:

1. `01-screen-analysis`
2. `02-project-setup` nếu chưa audit gần đây hoặc có nghi ngờ về base
3. `03-types-api-contract`
4. `04-layout-routing`
5. `05-ui-components`
6. `06-data-integration`
7. `07-interactions`
8. `08-auth-permissions` nếu feature có route mới hoặc action nhạy cảm
9. `09-testing`
10. `10-optimization-deploy`

## Important Note

Không tham chiếu các skill legacy hoặc external pack nếu chúng **không nằm trong `.agent/skills/` của repo này**.
Nếu cần dùng skill ngoài repo, phải nói rõ đó là external reference, không phải local project skill.
