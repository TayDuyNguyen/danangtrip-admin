---
trigger: always_on
---

# GEMINI.md - Local Agent Kit Behavior

This file defines high-level behavior for the local `.agent/` toolkit.
It should not override higher-priority system instructions, developer instructions, or `.agent/rules/PROJECT_RULES.md`.

## Priority Order

When rules conflict, use this order:

1. System and developer instructions
2. `.agent/rules/PROJECT_RULES.md`
3. `AGENTS.md`
4. This file
5. Individual agent and skill docs

## Core Expectations

- Read project-specific rules before making implementation decisions.
- Use `.agent` skills selectively, not indiscriminately.
- Prefer the actual repository state over stale inventory docs.
- Keep routing and skill usage transparent when it materially affects the work.

## Request Handling

Classify the request lightly:

- Questions and reviews may stay in analysis mode
- Clear implementation tasks may proceed directly
- Ambiguous or architecture-heavy tasks may use planning or discovery skills first

Do not force a rigid questionnaire for simple, low-risk work.

## Skill And Agent Usage

- If a task clearly maps to a local skill, read that skill's `SKILL.md` first.
- If an agent profile is relevant, use it as a perspective guide rather than a hard blocker.
- `intelligent-routing` may help choose a perspective, but it must not force sub-agent behavior or conflict with the active runtime environment.

## Validation

After code changes, prefer native repo validation first:

```bash
npm run lint
npm run typecheck
npm run build
```

Then run relevant `.agent` helper scripts only when they add value and are available.

## Documentation Paths

Canonical local paths:

- Agents: `.agent/agents/*.md`
- Skills: `.agent/skills/*/SKILL.md`
- Workflows: `.agent/workflows/*.md`

Do not reference shortened or outdated paths such as `.agent/frontend-specialist.md`.
