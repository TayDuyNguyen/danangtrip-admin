# Working Memory Protocol

This folder exists to reduce context loss across sessions.

Read order before non-trivial work:
1. `.agent/rules/PROJECT_RULES.md`
2. `.agent/rules/REPO_FACTS.md`
3. `.agent/memory/WORKING_STATE.md`
4. `.agent/memory/HANDOFF.md`
5. `.agent/memory/project-map.md`
6. The most recent relevant files under:
   - `.agent/memory/decisions/`
   - `.agent/artifacts/`

Update protocol during work:
1. When starting a feature, update `WORKING_STATE.md`.
2. When a meaningful decision is made, add or update a file in `decisions/`.
3. When pausing or finishing a session, append to `SESSION_LOG.md`.
4. When handing off incomplete work, update `HANDOFF.md`.

Rules:
- Keep entries short and factual.
- Prefer concrete file paths over vague descriptions.
- Record blockers and assumptions explicitly.
- Do not leave "current task" stale after context changes.

Minimum expectation before calling work complete:
- `WORKING_STATE.md` reflects the latest active or completed state.
- `HANDOFF.md` reflects any remaining risks or next steps.
