# Auth & Permissions Review: <Feature Name>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> Route scope: `<route-path>`

---

## 1) Protected Routes
| Route | Guard | Required Role | Redirect Behavior | Notes |
|---|---|---|---|---|
| | | | | |

## 2) Role Matrix
| Role | View | Create | Update | Delete | Export | Notes |
|---|---|---|---|---|---|---|
| admin | | | | | | |
| staff | | | | | | |

## 2.1) Action Matrix
| Action | Allowed Role(s) | UI Behavior | Backend Expectation | Notes |
|---|---|---|---|---|
| | | | | |

## 3) Guarded UI Actions
| UI Element | Visible To | Why |
|---|---|---|
| | | |

## 3.1) Hidden vs Disabled Decisions
| UI Element | Hidden or Disabled | Reason | Risk |
|---|---|---|---|
| | | | |

## 4) Token / Redirect Flow Review
| Area | Current Behavior | Expected Behavior | Status | Notes |
|---|---|---|---|---|
| Token attach | | | | |
| Logout | | | | |
| Unauthorized redirect | | | | |
| Wrong role redirect | | | | |

## 5) Risks / Assumptions
- [ASSUMPTION] A-01:
- R-01:

## 6) Files / Areas Affected
- `src/routes/...`
- `src/store/...`
- `src/hooks/...`
- `src/pages/...`
- `src/components/...`
