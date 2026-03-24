'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BrandPanel } from '@/components/BrandPanel'
import { WelcomeStep } from './steps/WelcomeStep'
import { IqQuizStep } from './steps/IqQuizStep'
import { ResultsStep } from './steps/ResultsStep'
import { LifeStageStep } from './steps/LifeStageStep'
import type { LifeStageData } from './steps/LifeStageStep'
import styles from './OnboardingFlow.module.css'

// Pre-auth onboarding flow:
//   0 = Welcome (Screen 1)
//   2 = Quiz    (Screen 2)
//   3 = Results (Screen 2 — immediate feedback)
//   5 = Life stage + motivation (Screen 3)
// After Screen 3 → redirect to /signup (Screen 4 = Create Account)
const STEP_SEQUENCE = [0, 2, 3, 5] as const

// Panel step: map sequenceIndex → 0-based panel position (0–3)
// Screens 2 and 3 (quiz + results) both highlight the same panel step.
const SEQUENCE_TO_PANEL_STEP: Record<number, number> = { 0: 0, 1: 1, 2: 1, 3: 2 }

const PANEL_STEPS = ['Welcome', 'Quiz', 'About You', 'Create Account']

interface StepMeta {
  title: string
  subtitle: string
}

const STEP_META: Record<number, StepMeta> = {
  0: {
    title: 'Track Your\nMoney',
    subtitle: 'Built for Finnish students who want to graduate debt-smart.',
  },
  2: {
    title: 'What Do You\nKnow?',
    subtitle: 'Eight questions. See where you actually stand on money.',
  },
  3: {
    title: 'Your Results\nAre In',
    subtitle: 'Honest, personalised feedback on your financial knowledge.',
  },
  5: {
    title: 'About\nYou',
    subtitle: 'Three questions to personalise your experience.',
  },
}

export function OnboardingFlow() {
  const router = useRouter()

  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [quizAnswers, setQuizAnswers]     = useState<number[]>([])

  const currentStep  = STEP_SEQUENCE[sequenceIndex]
  const meta         = STEP_META[currentStep]
  const isFirstStep  = sequenceIndex === 0
  const progressPct  = Math.round((sequenceIndex / (STEP_SEQUENCE.length - 1)) * 100)
  const panelStep    = SEQUENCE_TO_PANEL_STEP[sequenceIndex] ?? 0

  function handleNext() {
    if (sequenceIndex < STEP_SEQUENCE.length - 1) {
      setSequenceIndex(i => i + 1)
    }
  }

  function handleBack() {
    if (sequenceIndex > 0) {
      setSequenceIndex(i => i - 1)
    }
  }

  function handleQuizComplete(answers: number[]) {
    setQuizAnswers(answers)
    handleNext()
  }

  function handleLifeStageComplete(data: LifeStageData) {
    // Save onboarding results for the signup page to pick up
    const payload = { quizAnswers, lifeStage: data }
    sessionStorage.setItem('oppi_onboarding_data', JSON.stringify(payload))
    router.push('/signup')
  }

  return (
    <div className={styles.shell}>

      {/* ── Left brand panel — desktop only ── */}
      <BrandPanel
        title={meta.title}
        subtitle={meta.subtitle}
        stepIndicator={PANEL_STEPS.map((label, i) => ({ label, isActive: i === panelStep }))}
      />

      {/* ── Right content pane ── */}
      <main className={styles.content}>

        {/* Mobile progress bar — hidden on Screen 1 and during quiz (quiz owns its own back nav) */}
        {!isFirstStep && currentStep !== 2 && (
          <div className={styles.mobileHeader}>
            <button
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Onboarding progress"
            >
              <div
                className={styles.progressFill}
                style={{ '--progress-width': `${progressPct}%` } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Active step */}
        {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
        {currentStep === 2 && <IqQuizStep onNext={handleQuizComplete} onBack={handleBack} />}
        {currentStep === 3 && <ResultsStep answers={quizAnswers} onNext={handleNext} />}
        {currentStep === 5 && <LifeStageStep onNext={handleLifeStageComplete} />}
      </main>
    </div>
  )
}
