# CLAUDE.md

Guidelines for working in this Angular codebase.

---

## Tech Stack

- **Angular 21** — standalone component architecture, no NgModules
- **TypeScript 5.9** — strict mode, all strict flags enabled
- **Angular Material 21** — UI components (Material Design 3)
- **NgRx 21** — app-level state management
- **RxJS 7** — async operations and streaming
- **SCSS** — component and global styles with shared theme variables
- **Vitest** — test runner

---

## Naming Conventions

- **Components**: `feature-name.ts` — no `.component` suffix
- **Services**: `feature-name.service.ts`
- **Guards**: `feature-name.guard.ts`
- **Directives**: `feature-name.directive.ts`
- **Dialogs**: `feature-name.dialog.ts`
- **Specs**: `feature-name.spec.ts`
- **Selectors**: `app-component-name` (always `app-` prefix)
- **Classes**: PascalCase (`ChatInputComponent`, `UserService`)
- **Files and folders**: kebab-case

---

## Component Pattern

All components are standalone. No NgModules.
Variables and methods should have least possible access level, public does not have to be annotated
sections seperated by comment like this:

// ── Signals ──────────────────────────────────────────────────────────────────────


```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, MatIcon, ...],
  templateUrl: './feature-name.html',
  styleUrls: ['./feature-name.scss'],
})
export class FeatureNameComponent {

  // 1. Injected services
  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly service = inject(FeatureService);

  // 2. Inputs then Outputs, no type annotation, always public
  // ── Input/Output ──────────────────────────────────────────────────────────────────
  value = input<string>('');
  changed = output<string>();

  // 3. Signals (component-level state), type only for computed
  // ── Signals ──────────────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  protected derived: Signal<boolean> = computed(() => ...);

  // 4. Observables (component-level state) with type
  // ── Observables ───────────────────────────────────────────────────────────────────
  protected readonly subscription$: Observable<Subscription> = this.subscriptionService.data

  // 5. View references
  // ── View References ────────────────────────────────────────────────────────────────
  private readonly containerRef = viewChild<ElementRef>('container');

  // 5. Lifecycle methods & constructor (only if explicitly needed, no injection here)
  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  constructor {}
  ngOnInit() {}
  ngOnDestroy() {}

  // 6. Getters and methods
  // ── Methods ──────────────────────────────────────────────────────────────────────--
  private async getSessions(): Promise<void> {}
  protected get userData(): IUserData {}
}
```

---

## Dependency Injection

Always use `inject()` — never constructor injection.

```typescript
// Correct
private readonly chatService = inject(ChatService);

// Avoid
constructor(private chatService: ChatService) {}
```

---

## State Management

- **Signals** for component-level reactive state
- **NgRx Store** for app-wide state (user, sessions)
- **Computed signals** for derived values
- **Effects** for side-effect handling inside components

```typescript
// Component state
readonly messages = signal<IDisplayMessage[]>([]);
readonly canSend = computed(() => this.messages().length > 0);

// Updating signals
this.messages.update(m => [...m, newMessage]);
this.messages.set([]);

// NgRx dispatch
this.store.dispatch(UserAction.setUser({ user }));
```

---

## Async Patterns

- Use `firstValueFrom()` to convert Observables to Promises in services
- Use RxJS Observables for streaming (e.g. SSE/chunked HTTP responses)
- Use `async/await` for sequential async logic in components and services

```typescript
async refreshUser(): Promise<void> {
  const user = await firstValueFrom(this.userHttpService.checkStatus());
  this.store.dispatch(UserAction.setUser({ user }));
}
```

---

## Service Architecture

Services are split into three layers. Each layer may only inject from its own layer or layers below it.

### `service/http/` — HTTP layer
- Contains `HttpService` (core transport), `error.interceptor.ts`, and `feature-http.service.ts` files
- Named `feature-http.service.ts`, class `FeatureHttpService`
- Only injects `HttpService` — no business logic, no state
- Maps REST endpoints to typed Observable-returning methods

### `service/domain/` — Domain layer
- Named `feature.service.ts`, class `FeatureService`
- Only injects HTTP services and core services — never `HttpService` directly
- Owns business logic, state mutations, and side effects
- These are the services components interact with

### `service/core/` — Infrastructure layer
- Utility and infrastructure services: `AnimationService`, `LayoutService`, `SocketService`, `SnackbarService`, `EnvironmentService`
- No feature-specific logic — reusable across the whole app

### HTTP internals
- `HttpService` wraps `HttpClient` with REST and streaming helpers
- Streaming uses `responseType: 'text'`, `observe: 'events'`, `reportProgress: true`
- Error handling is centralized in `error.interceptor.ts`
- Interceptor catches HTTP errors and throws typed `AppError`

---

## Error Handling

- Use the custom `AppError` class from `shared/error/app.error.ts`
- Use `AppErrorType` enum for typed error categories (UNAUTHORIZED, CONFLICT, VALIDATION, etc.)
- Services throw typed errors; components catch and handle them

```typescript
throw new AppError(AppErrorType.UNAUTHORIZED, 'Session expired');
```

---

## Styling

- Each component has its own `.scss` file
- Global theme variables live in `src/style/`
- Import theme partials at the top of component stylesheets:

```scss
@use "theme-colors" as *;
@use "animations" as *;
```

- Use `$background-2`, `$primary`, `$tertiary`, etc. from theme-colors
- Keep transitions consistent: `0.25s ease`
- Follow Material Design 3 conventions for elevation and color roles
- **Always use `rem` for font sizes** — the root font size is set to `62.5%` (`10px`), so `1rem = 10px` (e.g. `1.6rem = 16px`, `1.8rem = 18px`)

---

## Routing

- All routes use `loadComponent()` for lazy loading
- Route guards handle authentication via `canActivate`
- Keep routes defined in `app.routes.ts`

---

## Shared Code

The `shared/` folder is framework-agnostic and can be used by both the frontend and any backend services. Keep it clean:

- `shared/model/` — TypeScript interfaces only (prefixed with `I`, e.g. `IUserDto`)
- `shared/enum/` — Enumerations
- `shared/error/` — Error classes and error type enums
- `shared/helper/` — Pure utility functions, no framework dependencies

---

## Formatting (Prettier)

- `printWidth`: 100
- `singleQuote`: true
- HTML files use the Angular parser

---

## TypeScript Rules

All strict flags are enabled. Additionally:

- `noImplicitOverride` — always declare `override`
- `noImplicitReturns` — all code paths must return
- `noFallthroughCasesInSwitch` — no implicit fallthrough
- `noPropertyAccessFromIndexSignature` — use bracket notation for indexed access
- `isolatedModules` — each file must be independently compilable

---

## What to Avoid

- Never create NgModules — use standalone components
- Never use constructor injection — use `inject()`
- Never add `.component` to component file names
- Avoid putting business logic in components — keep it in services
- Avoid relying on lifecycle hooks (especially onChanges) and implement reactive changes with signals and observables
- Never mutate signals directly — use `.set()` or `.update()`
- Never import from Angular private APIs
- Never disable strict TypeScript checks to silence errors — fix the type
