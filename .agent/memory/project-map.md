# Project map (DanangTrip Admin)

## Source of truth
- Repo rules: `.agent/rules/PROJECT_RULES.md`
- Repo facts: `.agent/rules/REPO_FACTS.md`
- Current working state: `.agent/memory/WORKING_STATE.md`
- Handoff state: `.agent/memory/HANDOFF.md`
- Agent playbook: `AGENTS.md`
- Architecture: `.agent/ARCHITECTURE.md`

## High-level structure
```text
src/
|-- api/           # API service wrappers and axios client
|-- components/    # reusable UI
|-- dataHelper/    # mappers and payload helpers
|-- hooks/         # React Query hooks and UI hooks
|-- i18n/          # i18next bootstrap
|-- layouts/       # app layouts
|-- pages/         # route-level screens
|-- providers/     # app bootstrap and providers
|-- routes/        # router setup and guards
|-- store/         # zustand stores
|-- validations/   # yup schemas
```

## Conventions (short)
- Do not hardcode new user-facing strings; keep `vi` and `en` in sync.
- Data flow: page/component -> hook -> api module -> `axiosClient`.
- TanStack Query is the source of truth for server data.
- Reuse existing helpers before creating new ones.

## Memory protocol
- Read `.agent/memory/README.md` before continuing unfinished non-trivial work.
- Update `WORKING_STATE.md` when the active task changes.
- Append to `SESSION_LOG.md` when ending a meaningful work session.
