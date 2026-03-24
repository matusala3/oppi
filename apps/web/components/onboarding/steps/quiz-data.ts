import { Wallet, TrendingUp, CreditCard, PiggyBank, Shield, Receipt, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Variant = 'primary' | 'warning' | 'success' | 'premium'
export type Domain = 'budgeting' | 'debt' | 'savings'

export interface Question {
  variant: Variant
  icon: LucideIcon
  tag: string
  domain: Domain
  question: string
  options: readonly string[]
  correctIndex: number
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  budgeting: 'budgeting & cash flow',
  debt:      'debt & credit',
  savings:   'savings basics',
}

export const VARIANT_TOKENS: Record<Variant, { accent: string; subtle: string }> = {
  primary: { accent: 'var(--color-primary)',  subtle: 'var(--color-primary-subtle)'  },
  warning: { accent: 'var(--color-warning)',  subtle: 'var(--color-warning-subtle)'  },
  success: { accent: 'var(--color-success)',  subtle: 'var(--color-success-subtle)'  },
  premium: { accent: 'var(--color-premium)',  subtle: 'var(--color-premium-subtle)'  },
}

// 8 scenario-based questions grounded in Finnish student financial reality.
// Sources: Kela.fi, Vero.fi, research into common debt traps for 18-29 year olds in Finland.
// Domains: 3 budgeting/cash flow, 3 debt/credit, 2 savings basics.
export const QUESTIONS: Question[] = [
  // ── Budgeting & cash flow ──────────────────────────────────────────────

  {
    domain: 'budgeting',
    variant: 'primary',
    icon: Wallet,
    tag: 'Opintotuki',
    question: 'A student in Helsinki receives €210 opintotuki (study grant) and €350 asumistuki (housing supplement). Monthly costs: rent €550, food €250, transport €70. Are they covering their costs?',
    options: [
      'Yes — grant and housing support cover everything',
      'No — they are short by about €310/month',
      'No — they are short by about €110/month',
      'Yes — they have €50 left over each month',
    ],
    correctIndex: 1,  // Income: 210+350=560. Costs: 550+250+70=870. Gap: 310
  },
  {
    domain: 'budgeting',
    variant: 'warning',
    icon: Receipt,
    tag: 'Daily spending',
    question: 'During summer you earn €2,000/month working full-time. In September studies resume and income drops to €560/month. What is the biggest risk?',
    options: [
      'You will earn more from Kela in autumn to compensate',
      'Spending habits formed in summer will create a cash shortfall in autumn',
      'Your tax rate automatically adjusts to the lower income',
      'Summer earnings count toward your opintotuki income limit',
    ],
    correctIndex: 1,
  },
  {
    domain: 'budgeting',
    variant: 'success',
    icon: BarChart3,
    tag: 'Tax card',
    question: "You start a part-time job but don't update your verokortti (tax card). What happens?",
    options: [
      'Nothing — the employer uses the default 40% withholding rate',
      'You automatically get a refund at year end',
      'Vero.fi sends you a fine',
      'Your opintotuki increases to compensate',
    ],
    correctIndex: 0,  // Default withholding is 40% if no tax card provided
  },

  // ── Debt & credit ──────────────────────────────────────────────────────

  {
    domain: 'debt',
    variant: 'primary',
    icon: Wallet,
    tag: 'Kela loan',
    question: 'Kela guarantees up to €650/month in student loans. If you borrow the maximum across 3 years of a bachelor\'s degree, how much total debt do you graduate with?',
    options: ['€7,800', '€15,600', '€23,400', '€31,200'],
    correctIndex: 2,  // 650 × 12 × 3 = 23,400
  },
  {
    domain: 'debt',
    variant: 'warning',
    icon: CreditCard,
    tag: 'Maksuhäiriö',
    question: 'You forget to pay a €60 phone bill for 25 days. What can happen?',
    options: [
      'Nothing — it is too small an amount to matter',
      'A €5 late fee is added to your bill',
      'You may receive a maksuhäiriömerkintä (payment default) that stays on record for 3 years',
      'Kela reduces your student grant temporarily',
    ],
    correctIndex: 2,  // 21+ days late on any debt can trigger a payment default in Finland
  },
  {
    domain: 'debt',
    variant: 'success',
    icon: Shield,
    tag: 'Consumer credit',
    question: 'A quick loan app offers €500 instantly at "only 15% annual interest." You borrow it for 3 months. How much do you actually pay back?',
    options: [
      '€500 — interest only applies if you keep it a full year',
      'About €519',
      'About €575 — fees and processing charges are added on top',
      'Exactly €575 — the 15% APR is simple and transparent',
    ],
    correctIndex: 2,  // True cost of short-term consumer credit with fees often 20-40% effective
  },

  // ── Savings basics ─────────────────────────────────────────────────────

  {
    domain: 'savings',
    variant: 'warning',
    icon: TrendingUp,
    tag: 'ASP account',
    question: 'What is an ASP-tili (first-home savings account) and why does opening one early matter?',
    options: [
      'A Kela account for storing opintotuki — no benefit to opening early',
      'A savings account where the government adds a 20% annual bonus on contributions — the earlier you start, the more bonus you earn',
      'A tax-free investment account available to all Finns — best opened after graduating',
      'A pension savings account — only relevant after age 40',
    ],
    correctIndex: 1,
  },
  {
    domain: 'savings',
    variant: 'premium',
    icon: PiggyBank,
    tag: 'Emergency fund',
    question: 'Your laptop breaks the week before an exam. You have no savings. What do most Finnish students do — and why is it a trap?',
    options: [
      'They borrow from Kela — which is always interest-free',
      'They take a consumer loan or pikavippi (quick loan), which carries high interest and default risk',
      'They apply for a government emergency grant, which covers the cost',
      'They claim insurance — all Finnish students are automatically covered',
    ],
    correctIndex: 1,
  },
]
