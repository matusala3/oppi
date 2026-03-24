'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, GraduationCap, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { AuthFormField } from '@/components/auth/AuthFormField'
import styles from '@/components/auth/auth-page.module.css'

// TODO: Redirect to /dashboard if a valid session token already exists

const FEATURES = [
  { Icon: BarChart3,      text: 'See all your spending in one place' },
  { Icon: GraduationCap, text: 'Learn as you track' },
  { Icon: TrendingUp,    text: 'Watch your habits improve over time' },
]

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }
  if (!password) {
    errors.password = 'Please enter your password'
  }
  return errors
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors]             = useState<FormErrors>({})
  const [isLoading, setIsLoading]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate(email, password)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      // TODO: POST /api/auth/login
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // })
      // if (!res.ok) { setErrors({ form: 'Incorrect email or password.' }); return }
      console.log('Login payload:', { email })
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      brandTitle={'Welcome\nback.'}
      brandSubtitle="Your financial journey continues here."
      features={FEATURES}
    >
      <div className={styles.wrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Enter your email and password to continue.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <AuthFormField
              id="login-email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              placeholder="mikael@email.fi"
              autoComplete="email"
            />
            <AuthFormField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(v => !v)}
              labelAddon={
                /* TODO: replace with <Link href="/forgot-password"> when reset flow is ready */
                <span className={styles.forgotLink} aria-label="Password reset not yet available">
                  Forgot password?
                </span>
              }
            />
          </div>

          {errors.form && (
            <div role="alert" className={styles.formErrorBanner}>
              <AlertCircle size={16} aria-hidden="true" />
              <span>{errors.form}</span>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
            {isLoading
              ? <span className={styles.loadingDots} aria-hidden="true"><span /><span /><span /></span>
              : <ChevronRight size={20} aria-hidden="true" />
            }
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={styles.footerLink}>Create one free</Link>
        </p>
      </div>
    </AuthShell>
  )
}
