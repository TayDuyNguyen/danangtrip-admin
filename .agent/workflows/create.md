---
description: Create a repository-specific implementation plan before building new admin features.
---

# /create - Admin Feature Bootstrap

Use this workflow to start a new screen or feature in `danangtrip-admin`.
It is planning-first, not an instant scaffold generator.

## Process

1. Read `.agent/rules/PROJECT_RULES.md` and `.agent/rules/REPO_FACTS.md`.
2. Use `project-planner` to produce the initial slice plan.
3. Use `explorer-agent` only if repo discovery is still unclear.
4. Ask for approval if the plan changes routes, auth, or shared component APIs.
5. Execute with the local skills in this order when relevant:
   - `01-screen-analysis`
   - `03-types-api-contract`
   - `04-layout-routing`
   - `05-ui-components`
   - `06-data-integration`
   - `07-interactions`
   - `08-auth-permissions`
   - `09-testing`
   - `10-optimization-deploy`

## Notes

- Do not reference removed generic roles.
- Prefer repository reality over generic app-builder behavior.
