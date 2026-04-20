---
name: rust-pro
description: Expert Rust guidance for services, libraries, async systems, performance work, and ownership-heavy debugging. Use when the task genuinely involves Rust code or Rust architecture decisions.
---

# Rust Pro

Use this skill for Rust-specific implementation and design work.

## Focus Areas

- Ownership and borrowing issues
- Async runtime and concurrency design
- Error handling and API design
- Performance-sensitive systems code
- Crate selection and ecosystem tradeoffs

## Working Rules

1. Clarify runtime, safety, and performance constraints first.
2. Prefer idiomatic safe Rust unless unsafe code is clearly justified.
3. Keep public APIs explicit and strongly typed.
4. Add tests or verification steps appropriate to the touched code.
5. Explain unsafe assumptions and invariants when unsafe code is unavoidable.

## Do Not Use

- For non-Rust projects
- For generic scripting tasks where Rust is not already part of the stack
- As a catch-all backend skill when the task is really framework-agnostic
