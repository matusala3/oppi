'use client'

import Image from 'next/image'
import { PiggyBank, TrendingUp, ChevronRight } from 'lucide-react'
import { DecorativeShapes } from './DecorativeShapes'
import styles from './WelcomeStep.module.css'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <>
      <DecorativeShapes variant="mobile" />

      <div className={styles.hero}>

        {/* Logo mark with floating badges */}
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>
            <Image
              src="/logo-mark.svg"
              alt="Oppi"
              width={112}
              height={114}
              className={styles.logoImage}
              unoptimized
            />
          </div>
          <div className={`${styles.logoBadge} ${styles.logoBadgeTop}`}>
            <PiggyBank size={14} color="var(--color-success-hover)" aria-hidden="true" />
          </div>
          <div className={`${styles.logoBadge} ${styles.logoBadgeBottom}`}>
            <TrendingUp size={14} color="var(--color-warning-hover)" aria-hidden="true" />
          </div>
        </div>

        {/* Headline */}
        <div className={styles.headline}>
          <h1 className={styles.title}>
            Track your spending.
          </h1>
          <p className={styles.subtitle}>
            See what's really happening with your money.
          </p>
        </div>
      </div>

      {/* CTA area */}
      <div className={styles.cta}>
        <button className={styles.ctaButton} onClick={onNext}>
          <span>Get Started</span>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
