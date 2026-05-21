---
name: 09-testing
description: Execute structured testing phases like a professional QA tester, from static gates to UI visual review, copy review, functional flows, edge cases, and regression. Use before handoff.
---

# Skill: 09-testing

## Overview

This skill runs a structured QA pass for the current feature and produces a defensible release verdict.
It is not limited to "does it compile" or "does the happy path work".
It must also catch user-facing defects such as broken copy, visual drift, state issues, and runtime warnings.

## When to Use

- When an admin feature is approaching review, handoff, push, or deploy.
- When testing needs a structured multi-phase workflow with hard stop gates.
- When the result must be a clear verdict with evidence, not a vague status update.

## Process

1. Run static quality gates first and stop immediately on blocking failures.
2. If a working dev URL exists, execute UI visual review, copy review, functional flow testing, edge-case testing, and regression testing in order.
3. Review every major screen section, not only the main happy path.
4. Record passes, fails, skipped checks, and concrete evidence.
5. Produce a verdict that matches the actual gate outcomes.

## Required Input

- `.agent/rules/PROJECT_RULES.md`
- `.agent/rules/REPO_FACTS.md`
- `.agent/memory/WORKING_STATE.md`
- `.agent/memory/HANDOFF.md`
- `package.json`
- the changed feature scope in `src/`
- the analysis artifact from `01-screen-analysis`
- the interaction spec from `07-interactions`
- the auth review from `08-auth-permissions` when relevant
- a working dev server URL for browser-based phases

## Dev Server Requirement

Provide URLs when activating this skill:

```text
Dev server URL: http://localhost:5173
Feature URL:    http://localhost:5173/admin/locations

Login URL: http://localhost:5173/login
Username: [admin@danangtrip.vn] 
Password: [password]

```

If no browser URL is available, browser-based phases must be reported as `NOT RUN` with a specific reason.

## Gate Logic

```text
Phase 1 must pass before Phase 2 starts.
Phase 2 must not have crash, blank-screen, or unusable-layout failures before Phase 3 starts.
Phase 3 happy path must pass before Phase 4 and Phase 5 start.
Phase 4 and Phase 5 contribute to the final verdict and residual risk summary.
```

Phase map:

- Phase 1: Static Gates
- Phase 2: UI Visual + Copy + Polish Review
- Phase 3: Functional Flows
- Phase 4: Edge Cases
- Phase 5: Regression

## Phase 1 - Static Gates [Blocking]

Run in order:

```bash
npm run lint
npm run typecheck
npm run build
npm run prepush:check
```

Required evidence format:

```text
PASS - lint: 0 errors, 0 warnings
PASS - typecheck: no errors
PASS - build: completed successfully
PASS - prepush:check: all gates passed
```

If any command fails:

- stop immediately
- report the failing command
- report the relevant file and error summary
- mark the verdict as `NOT READY`

## Phase 2 - UI Visual, Copy, and Polish Review [Blocking for severe issues]

This phase must inspect the real screen in the browser, not just source code.

### 2.1 Layout and Responsive Review

Check on at least:

- desktop
- tablet
- mobile

Validate:

- layout does not break
- text does not overflow or collapse incorrectly
- key controls remain visible and usable
- sidebar, table, modal, and sticky regions behave correctly
- spacing remains coherent across breakpoints

### 2.2 Loading, Empty, Error, and Disabled States

Check each visible section for:

- loading state
- empty state
- error state
- disabled state

Validate:

- skeletons preserve layout
- empty states are informative
- error states are actionable
- disabled controls look disabled and are actually non-interactive

### 2.3 UI Copy Review [Required]

Review every user-facing string on the screen:

- page titles
- section headers
- breadcrumb labels
- button labels
- form labels
- helper text
- validation messages
- empty-state text
- error messages
- destructive warnings
- filter labels
- table headers
- pagination copy

Catch:

- spelling mistakes
- grammar mistakes
- mojibake or broken encoding
- mixed-language copy
- placeholder text left in production UI
- missing translation keys rendered as raw paths
- inconsistent capitalization or terminology

### 2.4 Visual Polish Review [Required]

Inspect section by section for small but real UI defects:

- misalignment
- inconsistent spacing
- icon size mismatch
- incorrect badge or button height
- broken hover, focus, active, or disabled styles
- image stretching or clipping
- border, shadow, or radius drift from the design system
- weak contrast
- layering issues in modal, dropdown, drawer, or popover

Do not treat "no crash" as sufficient quality.

### 2.5 Section-by-Section Checklist

For each major section on the tested screen, explicitly review:

- section header
- content block layout
- primary action area
- secondary action area
- loading state
- empty state
- error state
- responsive behavior

If the screen has tabs, tables, sidebars, dialogs, filters, or cards, each of them must be checked separately.

### Phase 2 Severity Rules

Blocking Phase 2 issues:

- crash
- blank screen
- unusable layout
- hidden or inaccessible primary CTA
- severe overflow that breaks core usage
- missing translation keys in critical UI

Non-blocking but mandatory findings:

- minor spacing drift
- capitalization inconsistency
- icon or badge polish issues
- non-critical copy issues

## Phase 3 - Functional Flow Testing [Blocking]

The happy path for core actions must pass before moving on.

### 3.1 CRUD and Primary Actions

Where applicable, test:

- create
- update
- delete
- status toggle
- featured toggle
- retry flow

Validate:

- UI opens the correct control
- submission/loading state appears immediately
- success feedback appears correctly
- data refreshes correctly
- no stale UI remains after mutation

### 3.2 Search, Filter, Pagination, and Sort

Validate:

- search updates the data correctly
- filters apply correctly
- reset works correctly
- pagination updates the expected data
- sort order reflects the selected control
- URL state stays correct when the page uses URL-driven state

### 3.3 Form Validation

Validate:

- required fields block submission
- invalid format shows field-level feedback
- corrected input clears the error
- submit button state is correct during pending mutation

### 3.4 Micro-Interaction Review

Validate:

- button pending states
- confirmation flows
- retry actions
- focus return after modal close
- keyboard accessibility for primary controls when applicable
- controls reflect persisted state after mutation completes

If any core happy path fails, stop and mark the verdict as `NOT READY`.

## Phase 4 - Edge Case Testing

### 4.1 Boundary Values

Validate representative bounds:

- too short
- exact minimum
- exact maximum
- above maximum
- zero
- negative numbers where invalid
- empty optional values

### 4.2 Network and Error Simulation

Use DevTools or equivalent controls to simulate:

- timeout
- offline
- 4xx
- 5xx

Validate:

- UI exits loading state
- error presentation is understandable
- retry actions behave correctly
- raw backend internals are not exposed to users

### 4.3 Concurrent Actions

Validate:

- double-click does not submit twice
- repeated toggle does not corrupt state
- rapid filter/search changes do not leave stale results on screen

### 4.4 Console and Warning Review

Check DevTools for:

- `console.error`
- repeated `console.warn`
- React key warnings
- runtime promise rejections
- resource-loading failures

Warnings that do not crash the app are still valid findings and must be recorded.

## Phase 5 - Regression Testing

### 5.1 i18n Regression

Validate:

- both `vi` and `en` render without raw key paths
- meaning stays consistent across locales
- destructive messages remain complete
- validation messages remain complete

### 5.2 Auth and Permission Regression

Validate where relevant:

- protected routes redirect correctly
- role-limited actions stay hidden or disabled appropriately
- session loss or token removal is handled correctly

### 5.3 Existing Feature Regression

Validate nearby or related screens:

- parent list screen still works
- related detail/edit/create flows still work
- no new console errors appear in adjacent pages

### 5.4 Translation Integrity Regression

Confirm:

- locale-specific labels remain complete
- date, number, and currency labels still match the current locale when shown

## Output Document

Create:

- `.agent/artifacts/test-cases/YYYY-MM-DD__<feature-slug>__test-report.md`

The report must include:

1. Summary and verdict
2. Phase 1 findings
3. Phase 2 findings
4. Phase 3 findings
5. Phase 4 findings
6. Phase 5 findings
7. Copy and visual findings
8. Console and warning findings
9. Residual risks

## Rationalizations

| Excuse | Rebuttal |
|---|---|
| "Build passed, so testing is basically done." | Build is only one gate and does not validate runtime quality, UI copy, or user flows. |
| "The happy path worked once, so the screen is ready." | A ready screen also needs edge-case handling, polish review, and regression coverage. |
| "Minor copy or alignment issues can wait." | User-facing polish defects are still quality defects and must be documented before handoff. |

## Red Flags

- Phase 2 is skipped entirely
- copy review is missing
- visual polish review is missing
- no console review is performed
- only static gates are reported
- verdict says `READY` while a core functional flow failed

## Verification

- Cross-check with `checklist.md`
- Confirm that all five phases are covered
- Confirm that copy findings and visual findings are explicitly present
- Confirm that early-stop conditions are respected when blocking failures occur
