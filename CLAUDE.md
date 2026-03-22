<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# API library Structure Convention for libs/api

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
- Lib dependency order: `core` → `user` → `session` → `chat`, `cache`

# Website library Structure Convention for libs/website

Feature libs (`auth`, `chat`, etc.) follow this folder structure inside `src/lib/`:

```
src/lib/
  page/        ← routed page components
  component/   ← dumb/presentational components (when they exist)
  service/     ← services and http clients
  state/        ← NgRx actions, reducers, selectors
  guard/       ← route guards (when they exist)
```

Rules:
- Only create a folder when there are actual files for it — no empty folders
- Libs do not import libs, only shared libs can be imported
- Shared libs:
  - `core`: contains core services whoms scopes surpasses any domain, like environment or http service
  - `shared`: dumb components with no business logic, like buttons or simple dialogs
  - `state`: defines app state via ngrx store and store actions for cross domain communication

