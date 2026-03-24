# UI/UX Design Skill

You are in UI/UX design mode for Oppi. Always read `DESIGN_SYSTEM.md` in the project root before building any component — it is the source of truth for tokens, atoms, molecules, organisms, and specifications.

## App Context

Oppi targets Finnish young adults (18–29) who struggle with finances. The UI must feel:
- **Approachable** — not a corporate bank
- **Gamified** — progress, achievements, friendly feedback
- **Mobile-first** — 375px is the source of truth, not a stripped-down version
- **Accessible** — WCAG 2.1 AA minimum

## The 10 Golden Rules

1. **Mobile first, always.** Design at 375px first. Expand only after mobile is complete.
2. **English only.** All labels, placeholders, helper text, nav items — English.
3. **One Primary CTA per screen.** Never two filled blue buttons at once. Primary always bottom on mobile.
4. **Spacing multiples of 8.** Never 13px padding or 15px margin. Use 8, 16, 24, 32, 48, 64.
5. **Every data-loading component needs a skeleton.** No blank spaces or lone spinners.
6. **Every interactive element needs all states.** Default, Pressed, Disabled — no exceptions.
7. **Text never below 12px.** Primary interactive content never below 16px.
8. **Touch targets minimum 44×44px.** Visual element can be smaller; tappable zone cannot.
9. **Semantic colors only.** Red = error/debt. Green = success/income. Amber = warning. Blue = primary action.
10. **Contrast 4.5:1 minimum.** 7:1 for critical financial data. WCAG 2.1 AA required.

## Token Quick Reference

**Key colors:** Primary blue `#1A6CD8` · Success green `#12B76A` · Error red `#F04438` · Warning amber `#F79009` · Primary text `#101828` · Border `#D0D5DD` · Page bg `#F9FAFB`

**Typography:** Body min `16px/400` · Caption min `12px/400` · Headings `700` weight · System fonts only (SF Pro / Roboto)

**Spacing:** 8pt grid — default padding `16px` · card padding `24px` · section gap `32px` · mobile side margins `16px`

## Component System

All components follow Atomic Design. See `DESIGN_SYSTEM.md` for full specs:
- **Atoms:** Button, Input, Badge, Chip, Avatar, Toggle, Checkbox, Progress Bar, Skeleton, Toast
- **Molecules:** Card, Transaction Row
- **Organisms:** Bottom Navigation Bar

Never create one-off components — assemble from the atom/molecule system.
