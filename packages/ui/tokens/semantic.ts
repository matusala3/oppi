import { primitives as p } from './primitives';

export const semantic = {
  color: {
    // Primary (Blue — Trust, main interactive)
    primary:       p.color.blue[500],
    primaryHover:  p.color.blue[600],
    primaryPressed: p.color.blue[700],
    primaryFocus:  p.color.blue[400],
    primarySubtle: p.color.blue[100],

    // Success (Green — Savings, income, growth)
    success:       p.color.green[500],
    successHover:  p.color.green[700],
    successSubtle: p.color.green[100],

    // Danger (Red — Errors, debt, destructive)
    danger:        p.color.red[500],
    dangerHover:   p.color.red[700],
    dangerSubtle:  p.color.red[100],

    // Warning (Amber — Alerts, budget warnings)
    warning:       p.color.amber[500],
    warningHover:  p.color.amber[700],
    warningSubtle: p.color.amber[100],

    // Premium (Purple — Paid features)
    premium:       p.color.purple[600],
    premiumSubtle: p.color.purple[100],

    // Text
    textPrimary:     p.color.gray[900],
    textSecondary:   p.color.gray[700],
    textLabel:       p.color.gray[600],  // form labels, supporting text
    textTertiary:    p.color.gray[500],
    textPlaceholder: p.color.gray[400],
    textInverse:     p.color.white,

    // Surfaces & Backgrounds
    surface:           p.color.white,
    background:        p.color.gray[50],
    backgroundSubtle:  p.color.gray[100],

    // Borders
    border:  p.color.gray[300],
    divider: p.color.gray[200],
  },

  spacing: {
    // Mobile-first layout
    pagePadding:    p.spacing[3],  // 16px — mobile side margins
    cardPadding:    p.spacing[4],  // 24px — default card internal padding
    cardPaddingSm:  p.spacing[3],  // 16px — small card padding
    sectionGap:     p.spacing[5],  // 32px — between major sections
    itemGap:        p.spacing[1],  // 8px
    inlineGap:      p.spacing[1],  // 8px — icon ↔ label gap
  },

  radius: {
    button:     p.radius.lg,   // 12px — default rounded button
    buttonPill: p.radius.full, // 999px — pill button
    cardSm:     p.radius.lg,   // 12px
    card:       p.radius.xl,   // 16px
    input:      p.radius.sm,   // 8px
    badge:      p.radius.full, // 999px
    avatar:     p.radius.full, // 999px
  },

  shadow: {
    cardFlat:     'none',
    cardElevated: p.shadow.cardElevated,
    cardHover:    p.shadow.cardHover,
    toast:        p.shadow.toast,
    inputFocus:   '0 0 0 3px rgba(26, 108, 216, 0.12)',
  },

  transition: {
    button:   p.transition.button,
    card:     p.transition.card,
    progress: p.transition.progress,
  },

  touchTarget: {
    min:       p.touchTarget.min,
    preferred: p.touchTarget.preferred,
  },
} as const;
