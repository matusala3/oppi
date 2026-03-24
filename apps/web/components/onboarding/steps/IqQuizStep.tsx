'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import styles from './IqQuizStep.module.css'
import { QUESTIONS, VARIANT_TOKENS } from './quiz-data'

interface IqQuizStepProps {
  onNext: (answers: number[]) => void
  onBack: () => void
}

export function IqQuizStep({ onNext, onBack }: IqQuizStepProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])

  const current = QUESTIONS[questionIndex]
  const { accent, subtle } = VARIANT_TOKENS[current.variant]
  const isLast = questionIndex === QUESTIONS.length - 1
  const progressPct = Math.round(((questionIndex + 1) / QUESTIONS.length) * 100)
  const QuestionIcon = current.icon

  function handleBack() {
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1)
      setSelected(null)
    } else {
      onBack()
    }
  }

  function handleNext() {
    if (selected === null) return
    const updated = [...answers, selected]
    setAnswers(updated)
    if (isLast) {
      onNext(updated)
    } else {
      setQuestionIndex(i => i + 1)
      setSelected(null)
    }
  }

  return (
    <div
      className={styles.wrap}
      style={{ '--q-accent': accent, '--q-subtle': subtle } as React.CSSProperties}
    >

      {/* Back button */}
      <button className={styles.back} onClick={handleBack} aria-label="Go back">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back</span>
      </button>

      {/* Section title + tag */}
      <div className={styles.header}>
        <h2 className={styles.title}>Let&apos;s see what you know about money</h2>
        <span className={styles.tag}>{current.tag}</span>
      </div>

      {/* Quiz progress bar */}
      <div className={styles.progress}>
        <span className={styles.progressCount}>{questionIndex + 1}/{QUESTIONS.length}</span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className={styles.progressFill}
            style={{ '--progress-width': `${progressPct}%` } as React.CSSProperties}
          />
        </div>
        <span className={styles.progressPct}>{progressPct}%</span>
      </div>

      {/* Question card */}
      <div className={styles.card} key={questionIndex}>

        {/* Icon + question */}
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <QuestionIcon size={20} color="var(--q-accent)" aria-hidden="true" />
          </div>
          <p className={styles.question}>{current.question}</p>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {current.options.map((text, i) => (
            <button
              key={i}
              className={`${styles.option} ${selected === i ? styles.optionSelected : ''}`}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
            >
              <span className={`${styles.radio} ${selected === i ? styles.radioFilled : ''}`}>
                {selected === i && <Check size={12} aria-hidden="true" />}
              </span>
              <span className={styles.optionText}>{text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={styles.cta}>
        <button
          className={styles.ctaButton}
          onClick={handleNext}
          disabled={selected === null}
        >
          <span>{isLast ? 'See Results' : 'Next Question'}</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
