# Working Memory Protocol

This folder exists to reduce context loss across sessions.

Read order before every skill step:
1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. `.agent/memory/WORKING_STATE.md`
4. `.agent/memory/HANDOFF.md`
5. `.agent/memory/SESSION_LOG.md`
6. `.agent/memory/project-map.md`
7. The most recent relevant files under:
   - `.agent/memory/decisions/`
   - `.agent/artifacts/`
8. The active skill's `SKILL.md`

Memory must be reread at the start of every skill step, not only at the start of a session.

Update protocol during work:
1. At the start of every skill step, update `WORKING_STATE.md` with the active feature, current step, objective, expected artifact, and code mode.
2. After every skill step, update `WORKING_STATE.md` with artifact path, files changed, current risks, and next step.
3. After every skill step, append a short factual note to `SESSION_LOG.md`.
4. When a meaningful decision is made, add or update a file in `decisions/`.
5. When pausing, waiting for approval, blocked, or leaving incomplete work, update `HANDOFF.md`.

Rules:
- Keep entries short and factual.
- Prefer concrete file paths over vague descriptions.
- Record blockers and assumptions explicitly.
- Do not leave "current task" stale after context changes.
- Do not call a skill step complete until its artifact and memory updates are complete.

Code execution rule:
- Steps `01-screen-analysis` and `02-project-setup` are usually analysis/audit only.
- Step `03-types-api-contract` should write code when missing types, validation schemas, API modules, or mappers block the feature.
- Step `04-layout-routing` should write code when missing routes, page shells, sidebar/menu entries, or i18n route keys block the feature.
- Steps `05-ui-components`, `06-data-integration`, `07-interactions`, and `08-auth-permissions` are code-producing when the user asked to implement the screen.
- Steps `09-testing` and `10-optimization-deploy` should run checks, fix feature-caused issues, and finalize memory/handoff.

Minimum expectation before calling work complete:
- `WORKING_STATE.md` reflects the latest active or completed state.
- `HANDOFF.md` reflects any remaining risks or next steps.
- `SESSION_LOG.md` includes the latest completed skill step.
