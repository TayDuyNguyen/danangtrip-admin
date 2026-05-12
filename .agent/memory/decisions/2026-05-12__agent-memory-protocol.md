# Decision: Introduce Persistent Agent Memory Protocol

## Date
2026-05-12

## Context
The local `.agent` kit had good rules and pipeline docs, but it did not strongly preserve active task state, session continuity, or handoff context across separate AI sessions.

## Options
1. Keep only skills and artifacts.
2. Add one short working-state file only.
3. Add a small memory protocol with current state, session log, handoff, and decision records.

## Chosen
Option 3.

## Why
- One file alone is too fragile.
- A small set of focused files covers active state, history, handoff, and durable decisions without adding much overhead.
- This is enough structure to reduce repeated rediscovery work.

## Consequences
- Future sessions should read memory files before starting non-trivial work.
- The system stays useful only if sessions keep it updated.
- Repository-wide conventions become easier to trace over time.
