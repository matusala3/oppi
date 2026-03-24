import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { DecorativeShapes } from '@/components/onboarding/steps/DecorativeShapes'
import styles from './BrandPanel.module.css'

interface StepItem {
  label: string
  isActive: boolean
}

interface Feature {
  Icon: LucideIcon
  text: string
}

interface BrandPanelProps {
  title: string
  subtitle: string
  stepIndicator?: StepItem[]
  features?: Feature[]
}

export function BrandPanel({ title, subtitle, stepIndicator, features }: BrandPanelProps) {
  return (
    <aside className={styles.brandPanel} aria-hidden="true">
      <DecorativeShapes variant="panel" />

      <div className={styles.brandLogo}>
        <div className={styles.brandLogoMark}>
          <Image src="/logo-mark.svg" alt="Oppi" width={28} height={28} unoptimized />
        </div>
        <span className={styles.brandLogoText}>Oppi</span>
      </div>

      <div className={styles.brandContent}>
        <h2 className={styles.brandTitle}>{title}</h2>
        <p className={styles.brandSubtitle}>{subtitle}</p>
      </div>

      {stepIndicator ? (
        <div className={styles.brandSteps}>
          {stepIndicator.map(({ label, isActive }, i) => (
            <div
              key={label}
              className={`${styles.brandStep} ${isActive ? styles.brandStepActive : ''}`}
            >
              <div className={`${styles.brandStepDot} ${isActive ? styles.brandStepDotActive : ''}`}>
                {i + 1}
              </div>
              <span className={`${styles.brandStepLabel} ${isActive ? styles.brandStepLabelActive : ''}`}>
                {label}
              </span>
              {isActive && <div className={styles.brandStepLine} />}
            </div>
          ))}
        </div>
      ) : features ? (
        <div className={styles.brandFeatures}>
          {features.map(({ Icon, text }) => (
            <div key={text} className={styles.brandFeature}>
              <div className={styles.brandFeatureIcon}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <span className={styles.brandFeatureText}>{text}</span>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  )
}
