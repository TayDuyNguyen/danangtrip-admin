# Screen Analysis: <Screen Name>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> Mockup/SRS: <path hoặc NONE>

---

## 1) Summary
- Màn hình này phục vụ mục đích gì?
- Ai là người dùng chính (admin / staff)?
- Thuộc feature/module nào?
- Source inputs nào đã dùng? (mockup, SRS, route cũ, API docs)

## 2) Component Breakdown
### [REUSE] — Components đã có
| Component | Path | Cần chỉnh sửa? | Note |
|-----------|------|-----------------|------|
| | | | |

### [NEW] — Components cần tạo mới
| Component | Mô tả | Layer (Atom/Molecule/Organism) | Props interface |
|-----------|-------|-------------------------------|-----------------|
| | | | |

### [MOD] — Components cần chỉnh sửa
| Component | Path | Thay đổi gì | Impact |
|-----------|------|-------------|--------|
| | | | |

## 3) Responsive Behavior
| Breakpoint | Layout | Note |
|------------|--------|------|
| Desktop (≥1024px) | | Baseline (admin panel) |
| Tablet (768-1023px) | | |
| Mobile (<768px) | | |

## 4) UI States
| Component/Section | Loading | Empty | Error | Success | Disabled | Hover/Focus |
|-------------------|---------|-------|-------|---------|----------|-------------|
| | | | | | | |

## 5) Data Fields
| Field | Type | Required | Validation | Example | Source API |
|-------|------|----------|------------|---------|------------|
| | | | | | |

## 6) API Endpoints
| Method | Path (từ endpoints.ts) | Auth | Request | Response | Cần thêm? |
|--------|------------------------|------|---------|----------|-----------|
| | | | | | |

## 7) Mapper Requirements
| Raw Field (API) | Type | ViewModel Field | Transform logic |
|-----------------|------|-----------------|-----------------|
| | | | |

## 8) Business Rules
- BR-01:
- BR-02:

## 9) Actors & Permissions
| Actor/Role | Can do | Cannot do | Notes |
|------------|--------|-----------|-------|
| admin | | | |
| staff | | | |

## 10) Edge Cases
- EC-01:
- EC-02:

## 11) Assumptions & Open Questions
### Assumptions
- [ASSUMPTION] A-01:

### Open Questions
- Q-01:

## 12) Implementation Checklist
- [ ] Types & API contract (03-types-api-contract)
- [ ] Route & layout (04-layout-routing)
- [ ] UI components — list: ...
- [ ] Data integration — list hooks: ...
- [ ] Interactions — list actions: ...
- [ ] Auth/permissions (nếu cần)
- [ ] Testing (lint + typecheck + build)
- [ ] Deploy

## 13) Files / Areas Likely To Change
- `src/pages/...`
- `src/components/...`
- `src/hooks/...`
- `src/api/...`
- `src/validations/...`
