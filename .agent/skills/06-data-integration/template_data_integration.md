# Data Integration Plan: <Feature Name>

> Feature slug: `<feature-slug>`
> Date: YYYY-MM-DD
> API module: `src/api/<feature>Api.ts`

---

## 1) Data Sources
| Purpose | Endpoint | Hook | Notes |
|---|---|---|---|
| | | | |

## 1.1) Data Ownership Notes
- Query nào là source of truth?
- Query nào là lookup/supporting data?

## 2) Query Plan
| Query Key | Query Type | Trigger | staleTime | Mapper |
|---|---|---|---|---|
| | | | | |

## 2.1) Parallel / Dependent Query Notes
| Query | Parallel or Dependent | Why |
|---|---|---|
| | | |

## 3) Mutation Plan
| Action | API Method | Success Handling | Error Handling |
|---|---|---|---|
| | | | |

## 4) UI State Handling
| UI Section | Loading | Empty | Error | Success |
|---|---|---|---|---|
| | | | | |

## 4.1) Error Strategy
| Error Type | UI Handling | Toast | Retry |
|---|---|---|---|
| | | | |

## 5) Files Expected To Change
- `src/hooks/use<Feature>Queries.ts`
- `src/pages/<Feature>/...`
- `src/dataHelper/...`

## 6) Risks / Open Questions
- R-01:
- Q-01:
