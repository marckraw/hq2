# Guidelines for Agents working in this repo

## Structure overview

- **packages/thegrid** – backend built with [Hono](https://hono.dev/).
- **packages/thehorizon** – frontend powered by Next.js.

## Service pattern

- Services are implemented as singletons created via a closure pattern.
- Each service exposes its public API by returning functions from `createXService()` and exporting a constant like `export const xService = createXService();`.
- Private state and helper functions should remain inside the closure to keep them hidden.
- See `signal.service.ts`, `MemoryService/memory.service.ts`, or `pipeline.service.ts` for examples.

## UI Development Guidelines

### Core UI Principles

- **Always use shadcn/ui components when possible** - Prefer shadcn/ui over custom components or other UI libraries
- **Use Tailwind CSS for styling** - Prefer Tailwind utility classes over custom CSS
- **Ensure light and dark mode support** - All UI components must work in both themes
- **Use ThemeProvider for theme management** - Leverage the established theme system

### Component Preferences

#### shadcn/ui First

Always check if a shadcn/ui component exists before creating custom components:

```typescript
// ✅ Correct - Use shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ❌ Incorrect - Creating custom button when shadcn/ui exists
const CustomButton = ({ children, onClick }) => (
  <button
    className="px-4 py-2 bg-blue-500 text-white rounded"
    onClick={onClick}
  >
    {children}
  </button>
);
```

#### Tailwind CSS Styling

Use Tailwind utility classes for all styling:

```typescript
// ✅ Correct - Tailwind utilities
<div className="flex items-center justify-between p-4 bg-background text-foreground border rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold">Title</h2>
  <Badge variant="outline">Status</Badge>
</div>

// ❌ Incorrect - Custom CSS or inline styles
<div style={{ display: "flex", alignItems: "center", backgroundColor: "#ffffff" }}>
```

### Theme Management

#### Use Semantic Color Classes

Always use semantic Tailwind classes that work with both light and dark themes:

```typescript
// ✅ Correct - Semantic colors that adapt to theme
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Secondary text</p>
  <Button variant="destructive">Delete</Button>
</div>

// ❌ Incorrect - Hard-coded colors that don't adapt
<div className="bg-white text-black border-gray-200">
  <p className="text-gray-500">Secondary text</p>
</div>
```

#### Required Theme Colors

When using colors, always use these CSS variables defined in our theme system:

- `bg-primary text-primary-foreground`
- `bg-secondary text-secondary-foreground`
- `bg-muted text-muted-foreground`
- `bg-card text-card-foreground border-border`
- `bg-destructive text-destructive-foreground`
- `bg-background text-foreground`

#### ThemeProvider Integration

Ensure components work with the existing ThemeProvider:

```typescript
// ✅ Correct - Components that respect theme context
import { useTheme } from "next-themes";

export function ThemedComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg">
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Toggle Theme
      </Button>
    </div>
  );
}
```

## Development rules

- Use TypeScript and prefer double quotes and semicolons (see `.eslintrc.json` in `thehorizon`).
- **Always use closure-based functions for services, NEVER use classes** - Follow functional programming patterns.
- Run `npm test` from the repo root before committing to ensure all packages pass their tests.
- Commit messages must follow the Conventional Commits specification (e.g., `fix: ...`, `feat: ...`, `chore: ...`).
- Keep services small and focused. When adding new event listeners, always wrap async logic in `try/catch` and emit further events rather than chaining complex logic.
- Follow the existing folder structure: backend logic lives in **thegrid**, while UI components and pages live in **thehorizon**.
- **Test components in both light and dark modes** to ensure proper theme compatibility.
- **Use database migrations via Drizzle CLI** - Never create SQL migration files directly.

## Code Examples

### Service Pattern (Backend)

```typescript
// ✅ Correct - Closure-based service pattern
export const createMyService = ({ dependency1, dependency2 }) => {
  // Private state/functions inside closure
  const privateState = {};

  const privateFunction = () => {
    // Implementation
  };

  // Return public API
  return {
    publicMethod1: () => {
      // Implementation using privateState/privateFunction
    },
    publicMethod2: () => {
      // Implementation
    },
  };
};

// ❌ Incorrect - Never use classes
export class MyService {
  constructor(dependency1, dependency2) {
    // This pattern is forbidden
  }
}
```

### Component Pattern (Frontend)

```typescript
// ✅ Correct - Using shadcn/ui with proper theme support
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DataCard({ title, status, children }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

## Quick Checklist for Agents

- [ ] Using shadcn/ui components instead of custom ones?
- [ ] Using Tailwind classes instead of custom CSS/inline styles?
- [ ] Using semantic color classes (bg-background, text-foreground, etc.)?
- [ ] Components work in both light and dark themes?
- [ ] Services follow closure pattern (no classes)?
- [ ] Using double quotes and semicolons?
- [ ] Database changes via Drizzle CLI?
