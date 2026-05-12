# Working State

## Current Status
- Date: 2026-05-12
- Active feature/task: Strengthen `.agent` memory and continuity workflow
- Status: In progress
- Owner: AI collaborator

## Current Objective
- Add persistent memory files so future AI sessions can recover the last active context quickly.
- Make admin pipeline skills read current working state before relying on generic examples.

## Files Recently Updated
- `.agent/rules/REPO_FACTS.md`
- `.agent/scripts/verify_agent_drift.py`
- `.agent/scripts/checklist.py`
- `.agent/scripts/verify_all.py`
- `.agent/ARCHITECTURE.md`
- `.agent/rules/PROJECT_RULES.md`
- `.agent/skills/STACK_SKILLS_INDEX.md`

## Current Decisions In Force
- `REPO_FACTS.md` is the compact repo reality anchor.
- Drift checks should run before native validation checks.
- Memory files under `.agent/memory/` must be updated as work context changes.

## Known Open Items
- Some older markdown files still contain mojibake text.
- Future sessions must keep `WORKING_STATE.md`, `SESSION_LOG.md`, and `HANDOFF.md` current or the memory layer will decay.

## Immediate Next Steps
1. Keep this file updated when the active task changes.
2. Add decision notes whenever a new repo-wide convention is chosen.
3. Update `HANDOFF.md` before stopping unfinished work.
