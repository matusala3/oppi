# Frontend Development Skill

You are now in frontend development mode for Oppi.

## Tech Stack
- **Web**: Next.js 16 (App Router) + React 19 + TypeScript
- **Mobile**: Expo + React Native + TypeScript
- **Styling**: CSS Modules + CSS custom properties (NO Tailwind)
- **Design System**: `packages/ui` — tokens, reset, shared components
- **State**: React hooks only — no external state library
- **Forms**: `useState` + native validation — no react-hook-form, no zod
- **Dependencies**: minimum viable — only `lucide-react` added beyond Next.js defaults

## Design System

All styling is driven by design tokens defined in `packages/ui/tokens/`.

### Token layers
- `primitives.ts` — raw palette values (colors, spacing, radius, etc.)
- `semantic.ts` — intent-based mappings (primary, danger, surface, etc.)
- `styles/tokens.css` — CSS custom properties generated from semantic tokens
- `styles/reset.css` — mobile-first base reset

### Available CSS custom properties (from tokens.css)
```css
/* Colors */
--color-primary, --color-primary-hover, --color-primary-subtle
--color-success, --color-danger, --color-warning, --color-premium
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-surface, --color-background, --color-border, --color-divider

/* Spacing (8pt grid) */
--spacing-1 (8px), --spacing-2 (12px), --spacing-3 (16px),
--spacing-4 (24px), --spacing-5 (32px), --spacing-6 (48px), --spacing-7 (64px)
--spacing-page-padding (16px), --spacing-card-padding (24px)

/* Radius */
--radius-button (12px), --radius-card (16px), --radius-input (8px), --radius-badge (999px)

/* Typography */
--font-size-body (16px), --font-size-h1 (26px), --font-size-display (32px)
--font-weight-semibold (600), --font-weight-bold (700)
--line-height-body (1.6), --line-height-tight (1.2)

/* Shadows, transitions, touch targets */
--shadow-card-elevated, --shadow-input-focus
--transition-button (150ms ease), --transition-card (200ms ease)
--touch-target-min (44px), --touch-target-preferred (48px)
```

### Styling pattern — always CSS Modules + custom properties
```typescript
// Button.tsx
import styles from './Button.module.css';

export function Button({ label, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {label}
    </button>
  );
}
```

```css
/* Button.module.css */
.button {
  height: var(--touch-target-preferred);
  padding: 0 var(--spacing-4);
  border-radius: var(--radius-button);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-button);
  cursor: pointer;
  border: none;
}

.primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.primary:hover {
  background: var(--color-primary-hover);
}
```

## File Organization

```
packages/ui/
├── tokens/
│   ├── primitives.ts
│   ├── semantic.ts
│   └── index.ts
├── styles/
│   ├── tokens.css
│   └── reset.css
└── components/
    └── Button/
        ├── Button.tsx
        ├── Button.module.css
        └── index.ts

apps/web/
└── app/
    ├── globals.css          ← imports tokens.css + reset.css
    ├── layout.tsx
    └── (routes)/
        └── page.tsx
```

## Component Rules

1. **Always check `packages/ui`** for existing components before building new ones
2. **No duplicate markup** — if the same JSX structure appears in more than one place, extract it into a shared component with a `variant` prop. Never copy-paste markup between components.
3. **Use CSS Modules** for all component styles — never inline styles, never global classes
4. **Use only CSS custom properties** from `tokens.css` — never hardcode color/spacing values
5. **Follow DESIGN_SYSTEM.md** for all visual decisions (spacing, radius, touch targets, typography)
6. **Type everything** — no `any`, proper interfaces for all props
7. **Handle all states** — default, hover, focus, disabled, loading, error (per design system)
8. **Two intentional designs, not one** — write the mobile layout first (375px base, no media query). Then write a separate `@media (min-width: 1024px)` block that is a genuinely designed desktop layout — different column counts, larger type, different card arrangements. Never just add `max-width` and call it done for desktop.

## Design System Rules (from DESIGN_SYSTEM.md)

- All spacing must be multiples of 8
- Touch targets minimum 44×44px
- Text never below 12px; primary interactive content never below 16px
- One Primary CTA per screen
- Every data-loading component needs a skeleton state
- Semantic colors only: Red = error/debt, Green = success/income, Amber = warning, Blue = primary action
- Contrast minimum 4.5:1 (WCAG 2.1 AA)

## Responsive Design — Two Intentional Layouts

Base CSS (no media query) = mobile at 375px. This is the primary design.
`@media (min-width: 1024px)` = desktop layout. Must be genuinely redesigned — not just a wider mobile view.

```css
/* ✅ Correct pattern */
.card {
  /* Mobile: full-width stacked */
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
}

@media (min-width: 1024px) {
  .card {
    /* Desktop: side-by-side, bigger padding, larger type */
    flex-direction: row;
    padding: var(--spacing-5);
    gap: var(--spacing-5);
  }
}

/* ❌ Wrong — this is just scaled mobile, not a desktop layout */
@media (min-width: 1024px) {
  .card {
    max-width: 560px; /* ← not a desktop design */
  }
}
```

```css
/* Breakpoints */
/* Base: 375px — design here first, no media query */
@media (min-width: 430px) { /* sm — more breathing room */ }
@media (min-width: 768px) { /* md — 2 columns */ }
@media (min-width: 1024px) { /* lg — full desktop layout */ }
@media (min-width: 1280px) { /* xl — wide desktop */ }
```

## Platform-Specific Notes

### Next.js (Web)
- Server Components by default
- `'use client'` only when needed (interactivity, hooks, browser APIs)
- `next/image` for all images
- `next/link` for all navigation

### Expo (Mobile)
- React Native components: `View`, `Text`, `Pressable`
- Import JS token values from `packages/ui/tokens` directly (no CSS vars)
- Spacing values need px → number conversion for StyleSheet (e.g. `16` not `'16px'`)
- Test on both iOS and Android
