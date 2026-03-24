'use client'

import { ArrowRight, Trophy, TrendingUp, Target, Sprout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './ResultsStep.module.css'
import { QUESTIONS, DOMAIN_LABELS } from './quiz-data'
import type { Domain } from './quiz-data'

interface ResultsStepProps {
  answers: number[]
  onNext: () => void
}

interface DomainResult {
  domain: Domain
  label: string
  correct: number
  total: number
  color: string
}

// SVG ring — radius 52 inside 120×120 viewBox
// Circumference = 2π × 52 = 326.73px
const RING_CIRCUMFERENCE = 326.73

// Score tier — non-judgmental, growth-framed labels
const TIERS: Array<{
  minPct:      number
  label:       string
  Icon:        LucideIcon
  iconColor:   string
  badgeBg:     string
  badgeBorder: string
}> = [
  {
    minPct:      0.875,
    label:       'Strong foundation',
    Icon:        Trophy,
    iconColor:   'var(--color-warning)',
    badgeBg:     'var(--color-warning-subtle)',
    badgeBorder: 'var(--color-warning)',
  },
  {
    minPct:      0.625,
    label:       'Solid start',
    Icon:        TrendingUp,
    iconColor:   'var(--color-primary)',
    badgeBg:     'var(--color-primary-subtle)',
    badgeBorder: 'var(--color-primary)',
  },
  {
    minPct:      0.375,
    label:       'Room to build',
    Icon:        Target,
    iconColor:   'var(--color-primary)',
    badgeBg:     'var(--color-primary-subtle)',
    badgeBorder: 'var(--color-border)',
  },
  {
    minPct:      0,
    label:       'Fresh start',
    Icon:        Sprout,
    iconColor:   'var(--color-success)',
    badgeBg:     'var(--color-success-subtle)',
    badgeBorder: 'var(--color-success)',
  },
]

function getTier(score: number, total: number) {
  const pct = score / total
  return TIERS.find(t => pct >= t.minPct) ?? TIERS[TIERS.length - 1]
}

// Semantic colors: Debt → red, Savings → green, Budgeting → blue
const DOMAIN_COLORS: Record<Domain, string> = {
  budgeting: 'var(--color-primary)',
  debt:      'var(--color-danger)',
  savings:   'var(--color-success)',
}

function computeDomainResults(answers: number[]): DomainResult[] {
  const domains: Domain[] = ['budgeting', 'debt', 'savings']
  return domains.map(domain => {
    const indexed = QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.domain === domain)
    const correct = indexed.filter(({ q, i }) => answers[i] === q.correctIndex).length
    return { domain, label: DOMAIN_LABELS[domain], correct, total: indexed.length, color: DOMAIN_COLORS[domain] }
  })
}

function buildFeedback(domainResults: DomainResult[]): string {
  const strong = domainResults.filter(d => d.correct === d.total)
  const weak   = domainResults.filter(d => d.correct < Math.ceil(d.total / 2))

  if (strong.length === domainResults.length) {
    return "You've got strong foundations across all three areas. Oppi will help you go deeper."
  }
  if (strong.length > 0 && weak.length > 0) {
    return `You understand ${strong[0].label} well. Let's strengthen ${weak[0].label} next.`
  }
  if (strong.length > 0) {
    const others = domainResults.filter(d => d.correct < d.total).map(d => d.label)
    return `You understand ${strong[0].label} well. We'll build on ${others[0]} as you go.`
  }
  const sorted = [...domainResults].sort((a, b) => b.correct / b.total - a.correct / a.total)
  return `You've got a solid start on ${sorted[0].label}. We'll cover ${sorted[sorted.length - 1].label} step by step.`
}

export function ResultsStep({ answers, onNext }: ResultsStepProps) {
  const score         = answers.reduce((n, ans, i) => (ans === QUESTIONS[i].correctIndex ? n + 1 : n), 0)
  const ringOffset    = RING_CIRCUMFERENCE * (1 - score / QUESTIONS.length)
  const tier          = getTier(score, QUESTIONS.length)
  const TierIcon      = tier.Icon
  const domainResults = computeDomainResults(answers)
  const feedback      = buildFeedback(domainResults)

  return (
    <div className={styles.wrap}>

      {/* ── Hero: ring + tier badge ── */}
      <div className={styles.hero}>

        {/* SVG progress ring */}
        <div className={styles.ringWrap}>
          <svg
            viewBox="0 0 120 120"
            className={styles.ring}
            aria-label={`Score: ${score} out of ${QUESTIONS.length}`}
            role="img"
          >
            <circle cx="60" cy="60" r="52" className={styles.ringTrack} />
            <circle
              cx="60" cy="60" r="52"
              className={styles.ringFill}
              style={{ '--ring-offset': ringOffset } as React.CSSProperties}
            />
          </svg>

          {/* Score in the ring center */}
          <div className={styles.ringCenter} aria-hidden="true">
            <span className={styles.ringScore}>{score}</span>
            <span className={styles.ringTotal}>/ {QUESTIONS.length}</span>
          </div>
        </div>

        {/* Tier badge */}
        <div
          className={styles.tier}
          style={{
            '--badge-bg':     tier.badgeBg,
            '--badge-border': tier.badgeBorder,
          } as React.CSSProperties}
        >
          <TierIcon size={14} aria-hidden="true" style={{ color: tier.iconColor }} />
          <span className={styles.tierLabel}>{tier.label}</span>
        </div>

        <p className={styles.heroCaption}>Baseline quiz · {score}/{QUESTIONS.length} correct</p>
      </div>

      {/* ── Content: feedback + domain breakdown ── */}
      <div className={styles.content}>

        {/* Personalised feedback */}
        <p className={styles.feedbackText}>{feedback}</p>

        {/* Domain breakdown */}
        <div className={styles.breakdown} aria-label="Score by area">
          <span className={styles.breakdownHeading}>By area</span>

          {domainResults.map(({ domain, label, correct, total, color }) => {
            const pct = Math.round((correct / total) * 100)
            return (
              <div key={domain} className={styles.domainRow}>
                <div className={styles.domainMeta}>
                  <span className={styles.domainLabel}>{label}</span>
                  <span className={styles.domainScore} style={{ color }}>{correct}/{total}</span>
                </div>
                <div
                  className={styles.domainTrack}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label}: ${correct} of ${total}`}
                >
                  <div
                    className={styles.domainFill}
                    style={{
                      '--domain-pct':   `${pct}%`,
                      '--domain-color': color,
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <button className={styles.ctaButton} onClick={onNext}>
          <span>Continue</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>

    </div>
  )
}
