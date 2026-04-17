# Antigravity Kit Local Inventory

This file describes the local `.agent/` toolkit shipped in this repository.
It is an inventory and routing aid, not the source of truth for the application's runtime architecture.

For project-specific implementation rules, prefer:

1. `.agent/rules/PROJECT_RULES.md`
2. `AGENTS.md`
3. The actual repository state (`package.json`, `src/`, configs)

## Overview

Current local inventory:

- 20 agent profiles in `.agent/agents/`
- 37 top-level skill directories in `.agent/skills/`
- 11 workflow files in `.agent/workflows/`
- Validation/helper scripts in `.agent/scripts/`

## Directory Map

```text
.agent/
├── agents/       # specialist personas
├── rules/        # project and framework rules
├── scripts/      # helper and validation scripts
├── skills/       # reusable domain knowledge modules
└── workflows/    # reusable task flows
```

## Agents

Available agent profiles under `.agent/agents/`:

- `backend-specialist`
- `code-archaeologist`
- `database-architect`
- `debugger`
- `devops-engineer`
- `documentation-writer`
- `explorer-agent`
- `frontend-specialist`
- `game-developer`
- `mobile-developer`
- `orchestrator`
- `penetration-tester`
- `performance-optimizer`
- `product-manager`
- `product-owner`
- `project-planner`
- `qa-automation-engineer`
- `security-auditor`
- `seo-specialist`
- `test-engineer`

## Skills

Top-level skills currently present under `.agent/skills/`:

- `api-patterns`
- `app-builder`
- `architecture`
- `bash-linux`
- `behavioral-modes`
- `brainstorming`
- `clean-code`
- `code-review-checklist`
- `database-design`
- `deployment-procedures`
- `documentation-templates`
- `frontend-design`
- `game-development`
- `geo-fundamentals`
- `i18n-localization`
- `intelligent-routing`
- `lint-and-validate`
- `mcp-builder`
- `mobile-design`
- `nextjs-react-expert`
- `nodejs-best-practices`
- `parallel-agents`
- `performance-profiling`
- `plan-writing`
- `powershell-windows`
- `python-patterns`
- `red-team-tactics`
- `rust-pro`
- `seo-fundamentals`
- `server-management`
- `systematic-debugging`
- `tailwind-patterns`
- `tdd-workflow`
- `testing-patterns`
- `vulnerability-scanner`
- `web-design-guidelines`
- `webapp-testing`

Notes:

- The `nextjs-react-expert/` directory currently exposes the canonical skill name `react-best-practices` in its `SKILL.md`.
- Some skills contain nested reference or template folders that are resources, not additional top-level skills.

## Workflows

Workflow files under `.agent/workflows/`:

- `brainstorm.md`
- `create.md`
- `debug.md`
- `deploy.md`
- `enhance.md`
- `orchestrate.md`
- `plan.md`
- `preview.md`
- `status.md`
- `test.md`
- `ui-ux-pro-max.md`

## Usage Guidance

- Read a selected skill's `SKILL.md` before using deeper references or scripts.
- Do not assume every named capability in older docs still exists; verify against the actual directory contents.
- If a skill and an agent doc disagree, prefer the project rules and the real repo state.

## Validation Scripts

Project-level helper scripts:

- `.agent/scripts/checklist.py`
- `.agent/scripts/verify_all.py`
- `.agent/scripts/auto_preview.py`
- `.agent/scripts/session_manager.py`

Skill-level scripts also exist under some skill folders, for example i18n, frontend audit, testing, performance, and database validation.
