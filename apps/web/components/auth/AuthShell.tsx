import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { BrandPanel } from '@/components/BrandPanel'
import styles from './AuthShell.module.css'

interface StepIndicatorItem {
  label: string
  isActive: boolean
}

interface Feature {
  Icon: LucideIcon
  text: string
}

interface AuthShellProps {
  brandTitle: string
  brandSubtitle: string
  /** Step indicator — pass for pages that continue from onboarding (signup) */
  stepIndicator?: StepIndicatorItem[]
  /** Feature bullets — pass for standalone auth pages (login, first-entry) */
  features?: Feature[]
  children: React.ReactNode
}

export function AuthShell({
  brandTitle,
  brandSubtitle,
  stepIndicator,
  features,
  children,
}: AuthShellProps) {
  return (
    <div className={styles.shell}>

      {/* ── Left brand panel — desktop only ── */}
      <BrandPanel
        title={brandTitle}
        subtitle={brandSubtitle}
        stepIndicator={stepIndicator}
        features={features}
      />

      {/* ── Right content pane ── */}
      <main className={styles.content}>
        <div className={styles.mobileLogo} aria-hidden="true">
          <div className={styles.mobileLogoMark}>
            <Image src="/logo-mark.svg" alt="" width={20} height={20} unoptimized />
          </div>
          <span className={styles.mobileLogoText}>Oppi</span>
        </div>

        {children}
      </main>
    </div>
  )
}
