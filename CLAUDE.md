# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aimo is a React Native + Expo cross-platform memo/note-taking application with iOS, Android, and Web support. It features rich media support, smart search, categorization, and activity tracking.

## Development Commands

```bash
# Start development server (then press i/a/w for platform)
npm start

# Platform-specific start
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser

# Code quality
npm run lint      # Run ESLint with expo config

# Git hooks (runs automatically on commit)
npm run prepare   # Setup Husky hooks
```

## Architecture

### Layered Architecture

The codebase follows a strict layered architecture with unidirectional data flow:

```
Components (UI) → Services (State) → API (HTTP) → Server
       ↑                                    ↓
       └──────────── Response ←─────────────┘
```

**API Layer** (`api/`): Pure functions that make HTTP requests. No state management. Functions throw errors on failure for callers to handle.

**Service Layer** (`services/`): Business logic and state management using `@rabjs/react` Service pattern. Observable properties automatically trigger component re-renders.

**Component Layer** (`components/`, `app/`): UI components that consume services and render based on service state.

### State Management (@rabjs/react)

All state management uses `@rabjs/react` - a reactive state management library with dependency injection.

**Service Pattern**:

```typescript
// services/memo-service.ts
class MemoService extends Service {
  memos: Memo[] = []; // Observable - changes trigger re-render
  loading = false;

  async fetchMemos() {
    // Async methods track loading/error automatically
    this.loading = true;
    this.memos = await getMemos();
    this.loading = false;
  }
}
```

**Component Usage**:

```typescript
// Use bindServices at page level
export default bindServices(PageComponent, [MemoService]);

// Inside component
const memoService = useService(MemoService);
// Access: memoService.memos, memoService.loading
// Async state: memoService.$model.fetchMemos.loading
```

Key rules:

- All business logic goes in Service classes, not components
- Services are registered via `bindServices()` and accessed via `useService()`
- Components using services should be wrapped with `view()` or use `bindServices()`
- Service properties are automatically reactive - no need for decorators

### Routing (Expo Router)

File-based routing in `app/` directory:

- `app/_layout.tsx` - Root layout, handles auth flow
- `app/(memos)/` - Grouped routes (memos feature)
- `app/(memos)/index.tsx` - Memo list page
- `app/(memos)/[id].tsx` - Dynamic route for memo detail
- `app/(memos)/create.tsx` - Create memo page

### Component Organization

**Page-specific components** go in `components/[feature]/` (NOT in `app/`) because Expo Router treats all files in `app/` as routes.

```
components/
├── ui/              # Base UI components (Button, Input, etc.)
├── memos/           # Memo-specific components
│   ├── search-header.tsx
│   ├── sidebar-drawer.tsx
│   └── index.ts     # Unified exports
└── themed-*.tsx     # Global theme-aware components
```

Export pattern: Use `index.ts` in feature folders for clean imports:

```typescript
import { SearchHeader, SidebarDrawer } from "@/components/memos";
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `SearchHeader.tsx`)
- **Services**: kebab-case with `.service.ts` suffix (e.g., `memo-service.ts`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-theme.ts`)
- **Utils/Constants**: kebab-case (e.g., `theme-colors.ts`)
- **Platform-specific**: `.ios.ts`, `.android.ts`, `.web.ts` suffixes

## API Integration

Base URL is configured in `api/common.ts`. All API functions:

- Are pure async functions in `api/` directory
- Return data directly or throw errors
- Automatically attach auth token from AsyncStorage

Pattern:

```typescript
export const getMemos = async (): Promise<Memo[]> => {
  const response = await apiGet<MemoListResponse>("/memos");
  if (response.code !== 0) throw new Error(response.message);
  return response.data.items;
};
```

## Git & Commits

Conventional commits are enforced via Husky hook:

```
<type>(<scope>): <subject>

type: feat, fix, docs, style, refactor, perf, test, chore, revert
```

Example: `feat(memo): add search functionality`

## Configuration Notes

- **npm registry**: Uses China mirror (npmmirror.com) configured in `.npmrc`
- **Node version**: Requires npm >= 10.9.3
- **TypeScript**: Strict mode enabled
- **Expo**: New architecture enabled, supports iOS/Android/Web

## Key Directories

| Directory     | Purpose                                   |
| ------------- | ----------------------------------------- |
| `app/`        | Expo Router pages and layouts             |
| `components/` | UI components (global + feature-specific) |
| `services/`   | Business logic services (@rabjs/react)    |
| `api/`        | HTTP API functions                        |
| `types/`      | TypeScript type definitions               |
| `hooks/`      | Custom React hooks                        |
| `constants/`  | Theme colors and app constants            |
| `docs/`       | Architecture docs and API documentation   |

## Documentation References

- `docs/ARCHITECTURE.md` - Detailed architecture and data flow
- `docs/API_USAGE.md` - API usage patterns
- `.catpaw/rules/base.md` - React Native + Expo conventions
- `.catpaw/rules/rs-react.md` - @rabjs/react detailed usage guide
