# Shared Libraries

Guidelines for working in `libs/shared`. Framework-agnostic — safe to import from both `libs/api/*` and `libs/website/*`.

---

## Purpose

Shared contains only code that has no runtime framework dependency. It is the single source of truth for types, enumerations, errors, and pure utilities used across the monorepo.

---

## Folder Structure

```
src/
  model/   ← TypeScript interfaces only (prefixed with `I`, e.g. IUser, ISessionDto)
  enum/    ← Enumerations
  error/   ← AppError class and AppErrorType enum
  helper/  ← Pure utility functions, no framework dependencies
```

---

## Rules

- No Angular imports — no `@angular/*` anywhere
- No Express imports — no `express`, `req`, `res`, `next`
- No Mongoose imports — no schemas or documents
- No side effects — every export must be a pure type, enum, class, or function
- All interfaces are prefixed with `I` (e.g. `IUser`, `IChatMessage`)
- Barrel file (`src/index.ts`) is the only public API — never import internal paths directly

---

## What to Avoid

- Never add framework-specific logic — if it needs Angular or Express, it belongs in `libs/website` or `libs/api`
- Never import from `libs/api/*` or `libs/website/*` — `scope:shared` can only import `scope:shared`
