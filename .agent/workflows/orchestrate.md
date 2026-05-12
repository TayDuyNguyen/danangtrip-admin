---
description: Coordinate local core agents for a cross-cutting task in DanangTrip Admin.
---

# /orchestrate - Admin Coordination

Use this workflow only when the task clearly spans multiple layers.
Prefer the local 10-step skill pipeline for normal work.

## Core Agent Set

- `project-planner`
- `explorer-agent`
- `frontend-specialist`
- `backend-specialist`
- `test-engineer`
- `security-auditor`
- `devops-engineer`
- `debugger`

## Required Read Order

1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. `.agent/memory/WORKING_STATE.md`
4. `.agent/memory/HANDOFF.md`
5. relevant artifact trail

## Routing Matrix

| Task Type | Preferred Agents |
| --- | --- |
| New feature plan | `project-planner` + `explorer-agent` |
| UI + API integration | `frontend-specialist` + `backend-specialist` + `test-engineer` |
| Auth or permission changes | `security-auditor` + `backend-specialist` + `test-engineer` |
| Release readiness | `test-engineer` + `devops-engineer` + `security-auditor` |
| Hard-to-reproduce bug | `debugger` + `explorer-agent` + `test-engineer` |

## Rules

- Use the minimum number of agents needed.
- Keep ownership disjoint.
- Pass concrete file paths, feature slug, and active artifact names to each agent.
- Update `.agent/memory/WORKING_STATE.md` when orchestration changes the active task state.
