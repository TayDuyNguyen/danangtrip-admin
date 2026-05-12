---
description: Create a local plan artifact for DanangTrip Admin before implementation starts.
---

# /plan - Admin Planning Mode

This command is planning-only.
It should not write production code.

## Process

1. Read `.agent/rules/PROJECT_RULES.md`, `.agent/rules/REPO_FACTS.md`, `.agent/memory/WORKING_STATE.md`, and `.agent/memory/HANDOFF.md`.
2. Use `project-planner` to turn the request into a file plan and skill sequence.
3. Store the result under `.agent/artifacts/planning/` using the standard naming convention.
4. Report the artifact path and the next execution step.

## Output Must Include

- feature slug
- affected files
- skill sequence
- blockers or assumptions
- approval point if shared architecture changes are involved
