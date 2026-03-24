'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthFormField } from '@/components/auth/AuthFormField'
import pageStyles from '@/components/auth/auth-page.module.css'
import signupStyles from './signup.module.css'

const STEP_INDICATOR = [
  { label: 'Welcome',        isActive: false },
  { label: 'Quiz',           isActive: false },
  { label: 'About You',      isActive: false },
  { label: 'Create Account', isActive: true  },
]

interface FormErrors {
  name?: string
  email?: string
  password?: string
  form?: string
}

interface OnboardingData {
  quizAnswers: number[]
  lifeStage: {
    goal: string
    startingModule: string
    confidence: string
  }
}

function getPasswordStrength(pwd: string): 'weak' | 'fair' | 'strong' {
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return 'weak'
  if (score <= 3) return 'fair'
  return 'strong'
}

const STRENGTH_CONFIG = {
  weak:   { bars: 1, label: 'Weak',   barClass: 'strengthBarWeak',   labelClass: 'strengthLabelWeak'   },
  fair:   { bars: 2, label: 'Fair',   barClass: 'strengthBarFair',   labelClass: 'strengthLabelFair'   },
  strong: { bars: 3, label: 'Strong', barClass: 'strengthBarStrong', labelClass: 'strengthLabelStrong' },
} as const

function validate(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (name.trim().length < 2) {
    errors.name = 'Please enter your full name'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  return errors
}

export default function SignupPage() {
  const router = useRouter()

  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors]             = useState<FormErrors>({})
  const [isLoading, setIsLoading]       = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('oppi_onboarding_data')
    if (stored) {
      try {
        setOnboardingData(JSON.parse(stored) as OnboardingData)
      } catch {
        // Malformed data — proceed without it
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate(name, email, password)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      // TODO: POST /api/auth/signup
      // const res = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password, onboardingData }),
      // })
      // if (!res.ok) {
      //   const body = await res.json()
      //   if (body.code === 'EMAIL_TAKEN') {
      //     setErrors({ email: 'An account with this email already exists.' })
      //   } else {
      //     setErrors({ form: 'Something went wrong. Please try again.' })
      //   }
      //   return
      // }
      console.log('Signup payload:', { name, email, onboardingData })
      sessionStorage.removeItem('oppi_onboarding_data')
      router.push('/onboarding/first-entry')
    } finally {
      setIsLoading(false)
    }
  }

  // Show strength meter only while typing, before a validation error is shown
  const strength = password.length > 0 && !errors.password
    ? getPasswordStrength(password)
    : null
  const strengthConfig = strength ? STRENGTH_CONFIG[strength] : null

  return (
    <AuthShell
      brandTitle={'Your money,\nsorted.'}
      brandSubtitle="Join Finnish students taking control of their finances."
      stepIndicator={STEP_INDICATOR}
    >
      <div className={pageStyles.wrap}>
        <header className={pageStyles.header}>
          <h1 className={pageStyles.title}>Create your account</h1>
          <p className={pageStyles.subtitle}>Free to start — no card needed.</p>
        </header>

        <form className={pageStyles.form} onSubmit={handleSubmit} noValidate>
          <div className={pageStyles.fieldGroup}>
            <AuthFormField
              id="signup-name"
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              error={errors.name}
              placeholder="Mikael Virtanen"
              autoComplete="name"
            />
            <AuthFormField
              id="signup-email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              placeholder="mikael@email.fi"
              autoComplete="email"
            />
            <div className={signupStyles.passwordGroup}>
              <AuthFormField
                id="signup-password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(v => !v)}
              />
              {strengthConfig && (
                <div
                  className={signupStyles.strengthMeter}
                  role="status"
                  aria-label={`Password strength: ${strengthConfig.label}`}
                >
                  <div className={signupStyles.strengthBars} aria-hidden="true">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className={`${signupStyles.strengthBar} ${
                          i < strengthConfig.bars ? signupStyles[strengthConfig.barClass] : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`${signupStyles.strengthLabel} ${signupStyles[strengthConfig.labelClass]}`}
                    aria-hidden="true"
                  >
                    {strengthConfig.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {errors.form && (
            <div role="alert" className={pageStyles.formErrorBanner}>
              <AlertCircle size={16} aria-hidden="true" />
              <span>{errors.form}</span>
            </div>
          )}

          <button
            type="submit"
            className={`${pageStyles.submitButton} ${isLoading ? pageStyles.submitButtonLoading : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Creating account…' : 'Create account'}</span>
            {isLoading
              ? <span className={pageStyles.loadingDots} aria-hidden="true"><span /><span /><span /></span>
              : <ChevronRight size={20} aria-hidden="true" />
            }
          </button>
        </form>

        <p className={pageStyles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={pageStyles.footerLink}>Sign in</Link>
        </p>
      </div>
    </AuthShell>
  )
}
