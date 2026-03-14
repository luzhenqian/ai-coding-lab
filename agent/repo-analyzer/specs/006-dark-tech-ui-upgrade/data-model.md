# Data Model: Dark Tech UI Upgrade

This feature is primarily a UI/visual upgrade. The data model changes are minimal — focused on theme state management.

## Entities

### Theme Configuration

| Field | Type | Description |
|-------|------|-------------|
| theme | `"dark" \| "light" \| "system"` | User's selected theme preference |
| resolvedTheme | `"dark" \| "light"` | Actual applied theme after system resolution |

**Storage**: localStorage (via next-themes)
**Key**: `theme`
**Default**: `"dark"`

### Design Tokens (CSS Custom Properties)

| Token Category | Examples | Scope |
|---------------|----------|-------|
| Background | `--background`, `--card`, `--popover` | Page/component backgrounds |
| Foreground | `--foreground`, `--card-foreground`, `--muted-foreground` | Text colors |
| Accent | `--primary`, `--secondary`, `--accent` | Interactive element colors |
| Border | `--border`, `--input`, `--ring` | Borders and focus rings |
| Status | `--destructive`, `--success`, `--warning` | Semantic status colors |
| Geometry | `--radius` | Border radius |

**Storage**: CSS `:root` and `.dark` selectors in globals.css
**Switch mechanism**: Adding/removing `dark` class on `<html>` element

### Animation Configuration

| Field | Type | Description |
|-------|------|-------------|
| reducedMotion | `boolean` | Whether user prefers reduced motion |
| defaultTransition | `object` | Default spring/tween config for framer-motion |

**Detection**: `prefers-reduced-motion` media query + `useReducedMotion()` hook
**No persistence needed** — derived from OS setting at runtime

## Relationships

- Theme Configuration → controls which Design Token set is active
- Animation Configuration → gates all motion animations
- Design Tokens → consumed by all UI components via CSS variables
- Existing entities (Conversation, Workflow state) → unchanged
