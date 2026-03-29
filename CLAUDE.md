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

---

## Project-Wide Library Configuration

### Scope Boundaries

Enforced via `@nx/enforce-module-boundaries` in the root `eslint.config.mjs`:

| Scope | May import from |
|---|---|
| `scope:shared` | `scope:shared` only |
| `scope:api` | `scope:api`, `scope:shared` |
| `scope:website` | `scope:website`, `scope:shared` |

`scope:api` and `scope:website` are fully isolated from each other — neither can import from the other.

### `libs/shared` — Framework-agnostic shared code

- Tagged `scope:shared`
- No Angular, no Express, no runtime framework dependencies
- Contains only: TypeScript interfaces (`model/`), enumerations (`enum/`), pure utility functions (`helper/`), and error types (`error/`)
- Safe to import in both the website and the API

### `libs/api/*` — API-only libraries

- Tagged `scope:api`
- Exclusively consumed by `apps/api` — never imported by the website
- Express/Node.js ecosystem only (Mongoose, Redis, JWT, etc.)
- Feature libs: `core`, `user`, `session`, `chat`, `cache`

### `libs/website/*` — Website-only libraries

- Tagged `scope:website`
- Exclusively consumed by `apps/website` — never imported by the API
- Angular ecosystem only (Angular, Angular Material, NgRx, RxJS)
- Shared website libs: `core` (infrastructure services), `ui` (dumb components), `store` (NgRx app state)
- Feature libs: `auth`, `chat`

### Path Aliases (`@dersim/`)

All libs are imported via path aliases defined in `tsconfig.base.json`. Never use relative paths to cross lib boundaries.

```typescript
// Correct — use the path alias
import { IUser } from '@dersim/shared';
import { HttpService } from '@dersim/website/core';
import { UserAction } from '@dersim/website/store';

// Wrong — never cross lib boundaries with relative paths
import { IUser } from '../../../libs/shared/src/model/user.model';
```

Available aliases:

```
@dersim/shared             → libs/shared/src/index.ts
@dersim/website/core       → libs/website/core/src/index.ts
@dersim/website/ui         → libs/website/ui/src/index.ts
@dersim/website/auth       → libs/website/auth/src/index.ts
@dersim/website/chat       → libs/website/chat/src/index.ts
@dersim/website/store      → libs/website/store/src/index.ts
```

Each lib exposes its public API exclusively through its `src/index.ts` barrel file. Only import what is exported from there — never reach into internal paths of another lib.

<!-- #suggestion
The following are suggested additions worth reviewing:

1. **Type tags alongside scope tags** — consider adding `type:feature`, `type:ui`, `type:util`, `type:state` tags per lib in `project.json`.
   This would allow finer-grained boundary rules (e.g. prevent feature libs from importing other feature libs directly, forcing communication through the store).

2. **Lib-to-lib communication rule** — website feature libs (`auth`, `chat`) should not import each other.
   Cross-domain state sharing must go through `@dersim/website/store`. This isn't enforced yet and could be added as a depConstraint.

3. **`ui` lib import restriction** — `@dersim/website/ui` should only be importable from feature libs and the app, not from `core` or `store`.
   A `type:ui` tag + constraint would enforce this and prevent accidental coupling of infrastructure to presentation.

4. **Explicit `shared` lib sub-path exports** — as `libs/shared` grows, consider splitting it into `@dersim/shared/model`, `@dersim/shared/enum`, etc.
   This makes tree-shaking more effective and makes import intent clearer at a glance.

5. **Barrel file hygiene rule** — add a lint or CI check that flags direct internal imports like `@dersim/website/core/src/lib/http.service` (bypassing index.ts).
   The `no-restricted-imports` ESLint rule or a custom Nx boundary rule could enforce this.
-->
