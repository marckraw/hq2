# Contributing to HQ

Welcome to the HQ project! This guide will help you understand our development patterns and contribute effectively.

## 🏗️ Architecture Overview

HQ is a monorepo with the following packages:

- **thehorizon** - Frontend (Next.js 14 with App Router)
- **thegrid** - Backend (Hono.js API)
- **thecore** - Shared utilities and types
- **anton-grid** - Specialized functionality

## 📁 Code Organization Strategy

### Next.js App Router Colocation

We follow a **strict colocation strategy** for route-specific code:

#### ✅ Route-Specific Code → Colocate

```
src/app/[route]/
├── page.tsx                    # Route page component
├── _components/                # Components ONLY used in this route
├── _hooks/                     # Hooks ONLY used in this route
└── _lib/                       # Utilities ONLY used in this route
```

#### ✅ Truly Reusable Code → Centralize

```
src/
├── components/                 # Components used across multiple routes
├── hooks/                      # Hooks used across multiple routes
└── lib/                        # Utilities used across multiple routes
```

### Decision Matrix

| Usage Pattern        | Location                       | Example                   |
| -------------------- | ------------------------------ | ------------------------- |
| Single route only    | `src/app/[route]/_components/` | Analytics table component |
| Multiple routes      | `src/components/`              | UI Button component       |
| Business logic reuse | `src/hooks/` or `src/lib/`     | API client hooks          |

## 🔄 Import Path Conventions

### Absolute Imports (for shared code)

```typescript
// ✅ Shared components and utilities
import { Button } from "@/components/ui/button";
import { useSharedHook } from "@/hooks/useSharedHook";
import { ApiClient } from "@/services/api";
```

### Relative Imports (for colocated code)

```typescript
// ✅ Colocated components within the same route
import ComponentName from "./_components/component-name";
import { useRouteHook } from "./_hooks/useRouteHook";
import { routeUtil } from "./_lib/utils";
```

### Cross-Package Imports

```typescript
// ✅ Importing from other packages
import { SharedType } from "core.mrck.dev";
import { ApiResponse } from "grid.ef.design/types";
```

## 🚀 Development Workflow

### Before Adding New Components

1. **Determine Usage Scope**

   ```bash
   # Search if component is used elsewhere
   grep -r "ComponentName" src/app/*/
   ```

2. **Choose Correct Location**

   - Single route → `src/app/[route]/_components/`
   - Multiple routes → `src/components/`

3. **Follow Naming Conventions**
   - Components: `PascalCase.tsx`
   - Hooks: `use[Name].ts`
   - Utilities: `kebab-case.ts`

### Moving Existing Components

When refactoring components to follow colocation:

1. **Verify Single Usage**

   ```bash
   grep -r "ComponentName" src/
   ```

2. **Create Colocation Structure**

   ```bash
   mkdir -p src/app/[route]/_components
   ```

3. **Move and Update Imports**

   ```bash
   mv src/components/ComponentName.tsx src/app/[route]/_components/
   # Update imports in page.tsx and related files
   ```

4. **Test Compilation**
   ```bash
   npm run type-check
   ```

## 🧪 Testing Strategy

### Component Tests

- **Colocated components**: Test in isolation within route context
- **Shared components**: Comprehensive testing for all use cases

### File Naming

```
src/app/[route]/_components/
├── component.tsx
└── component.test.tsx

src/components/
├── shared-component.tsx
└── shared-component.test.tsx
```

## 📦 Package Management

### Adding Dependencies

1. **Determine Scope**

   - Frontend only → `packages/thehorizon`
   - Backend only → `packages/thegrid`
   - Shared utilities → `packages/thecore`

2. **Install in Correct Package**

   ```bash
   cd packages/thehorizon
   npm install package-name
   ```

3. **Update Documentation**
   - Add to relevant README if significant
   - Update ARCHITECTURE_ANALYSIS.md if architectural impact

## 🔍 Code Review Guidelines

### Checklist for Reviewers

- [ ] Components placed in correct location (colocated vs shared)
- [ ] Import paths follow conventions (relative vs absolute)
- [ ] No circular dependencies introduced
- [ ] Tests included for new functionality
- [ ] Documentation updated if needed

### Common Issues to Watch For

❌ **Incorrect Placement**

```typescript
// Wrong: Route-specific component in shared location
src / components / analytics - only - table.tsx;

// Right: Route-specific component colocated
src / app / analytics / _components / analytics - table.tsx;
```

❌ **Wrong Import Paths**

```typescript
// Wrong: Absolute import for colocated component
import Table from "@/app/analytics/_components/table";

// Right: Relative import for colocated component
import Table from "./_components/table";
```

## 🛠️ Development Tools

### Required Setup

```bash
# Install dependencies
npm install

# Set up git hooks
npm run prepare

# Start development
npm run dev
```

### Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Bundle analysis
npm run build -- --analyze

# Dependency audit
npx depcheck packages/thehorizon
```

## 📚 Resources

- [ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md) - Comprehensive architecture guide
- [Next.js App Router Docs](https://nextjs.org/docs/app) - Official Next.js documentation
- [Cursor Rules](/.cursor/rules/) - AI-assisted development guidelines

## 🤝 Getting Help

- Check existing [Cursor Rules](/.cursor/rules/) for AI guidance
- Review [ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md) for detailed patterns
- Ask questions in team discussions

---

_This guide evolves with the project. Please update it when introducing new patterns or conventions._
