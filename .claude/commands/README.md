# Claude Commands

These slash commands are thin entry points for the local `.agent/` pipeline.
They do not replace repository rules.

## Read Order

Before acting on any command, read:

1. `AGENTS.md`
2. `.agent/rules/PROJECT_RULES.md`
3. `.agent/rules/REPO_FACTS.md`
4. `.agent/memory/WORKING_STATE.md`
5. `.agent/memory/HANDOFF.md`

## Command Intent

- `spec` -> discovery and scope definition via `01-screen-analysis`
- `setup` -> project readiness and stack audit via `02-project-setup`
- `plan` -> contract and route planning before edits
- `build` -> implement the next approved slice with the relevant skills
- `test` -> collect validation evidence via `09-testing`
- `review` -> produce prioritized findings against repo rules
- `ship` -> final readiness, deploy constraints, and handoff via `10-optimization-deploy`

Keep artifacts under `.agent/artifacts/` and keep working memory current.
