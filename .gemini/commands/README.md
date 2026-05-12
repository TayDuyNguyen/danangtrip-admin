# Gemini Commands

These command files mirror the Claude entry points but stay intentionally thin.
All durable workflow logic lives under `.agent/`.

## Read Order

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`

## Command Mapping

- `spec.toml` -> `01-screen-analysis`
- `setup.toml` -> `02-project-setup`
- `planning.toml` -> planning before implementation
- `build.toml` -> approved implementation slice
- `test.toml` -> `09-testing`
- `review.toml` -> repo-specific review pass
- `ship.toml` -> `10-optimization-deploy`

If command guidance and repo reality diverge, follow `REPO_FACTS.md` and the actual codebase.
