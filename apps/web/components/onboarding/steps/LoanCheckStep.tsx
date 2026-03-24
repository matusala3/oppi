'use client'

import { useState } from 'react'
import { ArrowRight, GraduationCap, Zap, Building2, ShieldCheck, AlertTriangle, Info, Lightbulb } from 'lucide-react'
import styles from './LoanCheckStep.module.css'

interface LoanCheckStepProps {
  onNext: () => void
}

type LoanType = 'kela' | 'instant' | 'bank' | 'none'

interface LoanTypeOption {
  id: LoanType
  label: string
  sublabel: string
  icon: React.ElementType
  variant: 'primary' | 'danger' | 'warning' | 'success'
  insight: React.ReactNode
  insightIcon: React.ElementType
}

const LOAN_TYPES: LoanTypeOption[] = [
  {
    id:          'kela',
    label:       'Kela opintolaina',
    sublabel:    'State-guaranteed student loan',
    icon:        GraduationCap,
    variant:     'primary',
    insightIcon: Info,
    insight: (
      <>
        66% of Finnish graduates carry student loan debt — and many miss their
        repayment window. Oppi's loan module shows you{' '}
        <strong>exactly when to start preparing</strong> before interest
        compounds.
      </>
    ),
  },
  {
    id:          'instant',
    label:       'Instant / consumer loan',
    sublabel:    'Pikavippi or kulutusluotto',
    icon:        Zap,
    variant:     'danger',
    insightIcon: AlertTriangle,
    insight: (
      <>
        Consumer loans in Finland average <strong>40–120% APR</strong>. Oppi
        will prioritise this in your plan — targeting high-interest debt
        before it spirals.
      </>
    ),
  },
  {
    id:          'bank',
    label:       'Bank loan or credit',
    sublabel:    'Car loan, overdraft, credit card',
    icon:        Building2,
    variant:     'warning',
    insightIcon: Info,
    insight: (
      <>
        Bank debt is manageable with the right sequence. Oppi builds you a
        payoff timeline and flags when{' '}
        <strong>refinancing would save you money</strong>.
      </>
    ),
  },
  {
    id:          'none',
    label:       'No debt yet',
    sublabel:    "I'm starting debt-free",
    icon:        ShieldCheck,
    variant:     'success',
    insightIcon: Lightbulb,
    insight: (
      <>
        Good position to be in. Oppi will teach you the Kela loan structure{' '}
        <strong>before</strong> you need it — so you never take more than you
        can repay.
      </>
    ),
  },
]

const VARIANT_CLASS: Record<string, string> = {
  primary: styles.variantPrimary,
  danger:  styles.variantDanger,
  warning: styles.variantWarning,
  success: styles.variantSuccess,
}

export function LoanCheckStep({ onNext }: LoanCheckStepProps) {
  const [selected, setSelected] = useState<LoanType | null>(null)

  const option = LOAN_TYPES.find(o => o.id === selected) ?? null
  const InsightIcon = option?.insightIcon

  return (
    <div className={styles.wrap}>

      <div className={styles.header}>
        <h1 className={styles.title}>What&apos;s your debt situation?</h1>
        <p className={styles.subtitle}>
          Oppi uses this to show you the most relevant module first.
        </p>
      </div>

      <div
        className={styles.typeList}
        role="radiogroup"
        aria-label="Select your primary debt situation"
      >
        {LOAN_TYPES.map(opt => {
          const Icon       = opt.icon
          const isSelected = selected === opt.id
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              className={`${styles.typeRow} ${VARIANT_CLASS[opt.variant]} ${isSelected ? styles.typeRowSelected : ''}`}
              onClick={() => setSelected(opt.id)}
            >
              <div className={`${styles.typeIcon} ${styles[`icon_${opt.variant}`]}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className={styles.typeText}>
                <span className={styles.typeLabel}>{opt.label}</span>
                <span className={styles.typeSublabel}>{opt.sublabel}</span>
              </div>
              <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''} ${isSelected ? styles[`radioDot_${opt.variant}`] : ''}`} aria-hidden="true" />
            </button>
          )
        })}
      </div>

      {option && InsightIcon && (
        <div
          className={`${styles.insightCard} ${VARIANT_CLASS[option.variant]}`}
          key={selected}
        >
          <div className={`${styles.insightIcon} ${styles[`icon_${option.variant}`]}`}>
            <InsightIcon size={16} aria-hidden="true" />
          </div>
          <p className={styles.insightText}>{option.insight}</p>
        </div>
      )}

      <div className={styles.spacer} />

      <div className={styles.cta}>
        <button
          className={styles.ctaButton}
          onClick={onNext}
          disabled={selected === null}
        >
          <span>Continue</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        {selected === null && (
          <p className={styles.ctaHint}>Select one option above to continue</p>
        )}
      </div>

    </div>
  )
}
