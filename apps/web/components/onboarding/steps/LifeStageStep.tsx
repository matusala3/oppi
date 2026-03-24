'use client'

import { ArrowRight, Target, Wallet, TrendingUp, BarChart3, HelpCircle, GraduationCap, Home, Banknote, ShoppingCart, Smartphone, Sprout, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import styles from './LifeStageStep.module.css'

export interface LifeStageData {
  goal: string
  startingModule: string
  confidence: string
}

interface LifeStageStepProps {
  onNext: (data: LifeStageData) => void
}

interface Option {
  value: string
  label: string
  Icon: LucideIcon
  full?: boolean
}

const GOAL_OPTIONS: Option[] = [
  { value: 'reduce_impulse',  label: 'Reduce impulse spending', Icon: Target,     },
  { value: 'build_savings',   label: 'Build savings',           Icon: TrendingUp, },
  { value: 'manage_debt',     label: 'Manage debt',             Icon: Wallet,     },
  { value: 'track_spending',  label: 'Track spending',          Icon: BarChart3,  },
  { value: 'other',           label: 'Other',                   Icon: HelpCircle, full: true },
]

const MODULE_OPTIONS: Option[] = [
  { value: 'moving_out',      label: 'Moving out on my own',    Icon: Home,         },
  { value: 'first_income',    label: 'My first income',         Icon: Banknote,     },
  { value: 'student_loans',   label: 'Student loans',           Icon: GraduationCap },
  { value: 'major_purchase',  label: 'First big purchase',      Icon: ShoppingCart, },
  { value: 'digital_finance', label: 'Instant loans & digital', Icon: Smartphone,   },
  { value: 'not_sure',        label: 'Not sure yet',            Icon: HelpCircle,   },
]

const CONFIDENCE_OPTIONS: Option[] = [
  { value: 'low',    label: 'Not very confident', Icon: Sprout,     },
  { value: 'medium', label: 'Somewhat confident', Icon: TrendingUp, },
  { value: 'high',   label: 'Very confident',     Icon: Zap,        },
]

export function LifeStageStep({ onNext }: LifeStageStepProps) {
  const [goal, setGoal]                     = useState<string | null>(null)
  const [startingModule, setStartingModule] = useState<string | null>(null)
  const [confidence, setConfidence]         = useState<string | null>(null)

  const canContinue = goal !== null && startingModule !== null && confidence !== null

  function handleContinue() {
    if (!canContinue) return
    onNext({ goal: goal!, startingModule: startingModule!, confidence: confidence! })
  }

  return (
    <div className={styles.wrap}>

      {/* Mobile-only step header — desktop sees this in the brand panel */}
      <header className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>About You</h1>
        <p className={styles.stepSubtitle}>Three quick questions to personalise your experience.</p>
      </header>

      {/* Q1 — Goal */}
      <section className={styles.question}>
        <h2 className={styles.questionTitle}>What&apos;s your main goal?</h2>
        <div className={styles.optionsGrid}>
          {GOAL_OPTIONS.map(({ value, label, Icon, full }) => (
            <button
              key={value}
              className={`${styles.option} ${full ? styles.optionFull : ''} ${goal === value ? styles.optionSelected : ''}`}
              onClick={() => setGoal(value)}
              aria-pressed={goal === value}
            >
              <div className={`${styles.optionIcon} ${goal === value ? styles.optionIconSelected : ''}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className={styles.optionLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Q2 — Starting module */}
      <section className={styles.question}>
        <h2 className={styles.questionTitle}>Where do you want to start?</h2>
        <div className={styles.optionsGrid}>
          {MODULE_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              className={`${styles.option} ${startingModule === value ? styles.optionSelected : ''}`}
              onClick={() => setStartingModule(value)}
              aria-pressed={startingModule === value}
            >
              <div className={`${styles.optionIcon} ${startingModule === value ? styles.optionIconSelected : ''}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className={styles.optionLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Q3 — Confidence */}
      <section className={styles.question}>
        <h2 className={styles.questionTitle}>How confident are you managing money?</h2>
        <div className={styles.confidenceGrid}>
          {CONFIDENCE_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              className={`${styles.option} ${styles.confidenceOption} ${confidence === value ? styles.optionSelected : ''}`}
              onClick={() => setConfidence(value)}
              aria-pressed={confidence === value}
            >
              <div className={`${styles.optionIcon} ${confidence === value ? styles.optionIconSelected : ''}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className={styles.optionLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className={styles.cta}>
        <button
          className={styles.ctaButton}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          <span>Continue</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>

    </div>
  )
}
