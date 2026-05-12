# DanangTrip Admin - Claude Bootstrap

Treat .agent/ as the authoritative workflow layer for this repository.
Before non-trivial work, read:

1. .agent/rules/PROJECT_RULES.md
2. .agent/rules/REPO_FACTS.md
3. .agent/memory/WORKING_STATE.md
4. .agent/memory/HANDOFF.md
5. The relevant skill in .agent/skills/

Execution rules:
- Use the 10-step pipeline in .agent/skills/STACK_SKILLS_INDEX.md.
- Follow repo reality over template assumptions.
- Keep .agent/memory/* updated when task state changes.
- Use .agent/artifacts/ as the persistent execution trail.
- Prefer the smallest correct change that matches existing architecture.

Use the slash commands under .claude/commands/ as entry points when helpful.
