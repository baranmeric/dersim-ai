# API Libraries

Guidelines for working in `libs/api/*`. Express/Node.js ecosystem only.

---

## Tech Stack

- **Node.js** — runtime
- **Express** — HTTP framework
- **TypeScript 5.9** — strict mode
- **Mongoose** — MongoDB ODM
- **Redis** — caching and session storage
- **JWT** — authentication tokens

---

## Lib Folder Structure

Feature libs (`user`, `session`, `chat`, `cache`) follow this folder structure inside `src/lib/`:

```
src/lib/
  schema/      ← Mongoose models and document interfaces
  service/     ← business logic services (wrapped with createServiceProxy)
  controller/  ← Express request handlers
  router/      ← Express routers
  helper/      ← domain-specific pure helpers
  queue/       ← background queue processors (when they exist)
  generator/   ← AI content generators (when they exist)
```

Rules:
- `core/` is flat — logger, proxy, config, middleware, socket, error handler all at top level
- Only create a folder when there are actual files for it — no empty folders
- `config/` (db, redis, jwt verify) lives in `core/`
- `generateToken` lives in `user/` since it depends on `IUser`
- `http` response helper lives in `cache/` since it depends on `cacheService`

---

## Lib Dependency Order

```
core → user → session → chat, cache
```

Higher-level libs may import from lower-level libs, never the reverse.

---

## What to Avoid

- Never import Angular or any browser-only APIs
- Never import from `libs/website/*`
- Never put Express-specific code (req, res, next) inside `service/` — keep it in `controller/`
