# DanangTrip Admin - Multi-Agent Operating Contract

This repository uses .agent/ as the single source of truth for AI workflows.
All platform-specific integrations must route back to the same rules, memory, and skills.

## Primary Sources

Read these files in order before non-trivial work:

1. .agent/rules/PROJECT_RULES.md
2. .agent/rules/REPO_FACTS.md
3. .agent/memory/WORKING_STATE.md
4. .agent/memory/HANDOFF.md
5. Relevant recent files in .agent/memory/decisions/ and .agent/artifacts/
6. Real repo sources: package.json, src/, build config, and runtime config
7. The specific skill in .agent/skills/ that matches the task

## Repository Reality

- Stack: React 19 + Vite + TypeScript + React Router v7 + TanStack Query + Zustand + react-i18next
- Route-level pages live under `src/pages` and router setup under `src/routes`.
- API modules belong in `src/api`, query hooks in `src/hooks`, and mappers in `src/dataHelper`.
- Forms use `react-hook-form` + `yup` where the touched feature already follows that pattern.
- Keep Query cache as the default source of truth for server data; avoid mirroring API results into Zustand.
- Keep `vi` and `en` locale keys synchronized.

## Skill Activation

Map the task to the 10-step pipeline in .agent/skills/STACK_SKILLS_INDEX.md.

- Discovery and requirement analysis -> 1-screen-analysis
- Readiness or stack audit -> 2-project-setup
- Types, schemas, services, contracts -> 3-types-api-contract
- Routes, layout, metadata, menu, shell -> 4-layout-routing
- Visual implementation -> 5-ui-components
- API wiring and query flows -> 6-data-integration
- Forms, CRUD, filter, search, pagination -> 7-interactions
- Access control and protected behavior -> 8-auth-permissions
- Test evidence and validation -> 9-testing
- Final readiness, review, deployment, handoff -> 10-optimization-deploy

## Working Memory Protocol

- Update .agent/memory/WORKING_STATE.md when the active task changes.
- Update .agent/memory/HANDOFF.md before pausing unfinished work.
- Record repo-wide decisions under .agent/memory/decisions/.
- Treat artifacts in .agent/artifacts/ as the running execution record.

## Platform Adapters

- CLAUDE.md provides the concise Claude-facing bootstrap.
- GEMINI.md provides the concise Gemini-facing bootstrap.
- .claude/commands/ exposes slash-command entry points.
- .gemini/commands/ exposes Gemini command entry points.
- .opencode/skills points OpenCode to the local .agent/skills/ directory.
- .claude-plugin/ exposes plugin metadata for environments that ingest plugin manifests.

Never create a second source of truth outside .agent/.
If a platform adapter needs instructions, it must reference .agent/ rather than duplicating workflow details.

