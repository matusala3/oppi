"use client"

import { useState, useCallback } from "react"
import {
  ChevronRight, Check, Lock, Building2, FileText, Star,
  ArrowLeft, Users, ArrowRight, Sparkles, TrendingUp,
  PiggyBank, GraduationCap, Shield, Wallet, Target, Award,
  AlertTriangle, Zap, BookOpen, Home as HomeIcon, Plane,
} from "lucide-react"

/* ──────────────────────────────────────────────
   Oppi Onboarding — 9 Screens
   Flow order:
     0 Welcome  ->  1 Permissions  ->  2 IQ Quiz
     3 IQ Results  ->  4 Loan Reality  ->  5 Goal Setting
     6 Profile  ->  7 Social Proof  ->  8 Complete

   Mobile: full-bleed single column
   Desktop (lg+): branded left panel + scrollable right form
   ────────────────────────────────────────────── */

const TOTAL_STEPS = 9

/* ─── Quiz data ─── */
const IQ_QUESTIONS = [
  {
    question: "You have \u20AC10,000 in student loans at 2.5% interest. If you pay it over 5 years, how much total will you pay?",
    options: ["\u20AC10,250", "\u20AC10,625", "\u20AC11,250", "\u20AC12,500"],
    correct: 1,
    accent: "#1A6CD8",
    accentLight: "#EBF3FE",
    icon: Wallet,
    tag: "Debt",
  },
  {
    question: "If inflation is 3% and your savings earn 1% interest, after a year your purchasing power has:",
    options: ["Increased", "Stayed the same", "Decreased by about 2%", "Decreased by 3%"],
    correct: 2,
    accent: "#F79009",
    accentLight: "#FEF0C7",
    icon: TrendingUp,
    tag: "Inflation",
  },
  {
    question: "A Finnish developer\u2019s gross salary is \u20AC3,500/month. What\u2019s the approximate net (after tax)?",
    options: ["\u20AC3,200", "\u20AC2,800", "\u20AC2,400", "\u20AC2,100"],
    correct: 2,
    accent: "#12B76A",
    accentLight: "#D1FADF",
    icon: GraduationCap,
    tag: "Tax",
  },
  {
    question: "If you invest \u20AC100/month at 7% annual returns, how much will you have in 10 years?",
    options: ["\u20AC12,000", "\u20AC14,500", "\u20AC17,400", "\u20AC21,000"],
    correct: 2,
    accent: "#7C3AED",
    accentLight: "#EDE9FE",
    icon: PiggyBank,
    tag: "Investing",
  },
  {
    question: "What is the maximum student loan guarantee Kela provides per semester?",
    options: ["\u20AC400/month", "\u20AC650/month", "\u20AC800/month", "\u20AC1,000/month"],
    correct: 1,
    accent: "#1A6CD8",
    accentLight: "#EBF3FE",
    icon: Shield,
    tag: "Kela",
  },
]

/* ─── Goal data ─── */
const GOALS = [
  { id: "loans", icon: Wallet, label: "Pay off student loans faster", desc: "Most popular among students", color: "#12B76A", bgPattern: "linear-gradient(135deg, #D1FADF 0%, #ECFDF3 100%)" },
  { id: "apartment", icon: HomeIcon, label: "Save for apartment deposit", desc: "Average target: \u20AC12,000", color: "#1A6CD8", bgPattern: "linear-gradient(135deg, #EBF3FE 0%, #D1E4FD 100%)" },
  { id: "emergency", icon: Shield, label: "Build emergency fund", desc: "3 months of expenses", color: "#F79009", bgPattern: "linear-gradient(135deg, #FEF0C7 0%, #FFFAEB 100%)" },
  { id: "car", icon: Zap, label: "Buy a car", desc: "Used car avg: \u20AC5,000", color: "#7C3AED", bgPattern: "linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)" },
  { id: "travel", icon: Plane, label: "Travel fund", desc: "Average trip: \u20AC1,200", color: "#F04438", bgPattern: "linear-gradient(135deg, #FEE4E2 0%, #FFF1F0 100%)" },
]

/* ─── Social proof data ─── */
const UNIVERSITIES = ["Aalto University", "University of Helsinki", "Tampere University", "University of Turku"]

const PEER_STORIES = [
  { name: "Mikael", age: 21, field: "CS Student, Tampere", uni: "Tampere University", debt: "\u20AC8,200", result: "Paid off in 2 years", quote: "I cut subscriptions and meal prepped. Saved \u20AC180/month.", color: "#1A6CD8", saved: "\u20AC4,320" },
  { name: "Jenna", age: 22, field: "Business, Helsinki", uni: "Aalto University", debt: "\u20AC12,000", result: "Paying \u20AC250/month", quote: "Freelancing on weekends = \u20AC400 extra/month.", color: "#12B76A", saved: "\u20AC6,000" },
]

/* ─── Step metadata for brand panel ─── */
const STEP_META: Record<number, { title: string; subtitle: string; stat?: string; statIcon?: typeof Lock }> = {
  0: { title: "Master Your\nMoney", subtitle: "Built for Finnish students who want to graduate debt-smart." },
  1: { title: "Quick &\nSecure Setup", subtitle: "Connect your accounts safely. We use bank-level encryption.", stat: "256-bit encrypted", statIcon: Lock },
  2: { title: "Test Your\nKnowledge", subtitle: "5 quick questions to measure your financial literacy.", stat: "Average score: 55%", statIcon: Award },
  3: { title: "Your Results\nAre In", subtitle: "See how you compare with 12,400+ Finnish students.", stat: "12,400+ tests taken", statIcon: Users },
  4: { title: "The Real\nCost of Debt", subtitle: "See what instant loans actually cost you.", stat: "Save up to \u20AC1,800", statIcon: AlertTriangle },
  5: { title: "Set Your\nMoney Goal", subtitle: "Students with clear goals save 3x more on average.", stat: "12,000+ goals set", statIcon: Target },
  6: { title: "Almost\nDone", subtitle: "Help us personalize your experience in 30 seconds.", stat: "Takes 30 seconds", statIcon: Sparkles },
  7: { title: "You're Not\nAlone", subtitle: "Real strategies from students at your university.", stat: "98% find this helpful", statIcon: Users },
  8: { title: "Ready\nTo Go!", subtitle: "Your personalized dashboard is waiting.", stat: "Welcome aboard!", statIcon: Sparkles },
}

/* ─── Floating decorative elements for brand panel ─── */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large currency symbols floating */}
      <div className="absolute top-20 right-16 text-[48px] font-bold text-primary-foreground/[0.06] animate-float" style={{ animationDelay: "0s" }}>{"\u20AC"}</div>
      <div className="absolute bottom-40 left-12 text-[32px] font-bold text-primary-foreground/[0.05] animate-float" style={{ animationDelay: "1.2s" }}>%</div>

      {/* Geometric shapes */}
      <div className="absolute top-16 left-20 h-20 w-20 rounded-2xl bg-primary-foreground/[0.04] rotate-12 animate-float" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-28 right-10 h-14 w-14 rounded-full bg-primary-foreground/[0.05] animate-float" style={{ animationDelay: "1.8s" }} />
      <div className="absolute top-1/3 right-1/4 h-8 w-8 rounded-lg bg-primary-foreground/[0.04] rotate-45 animate-float" style={{ animationDelay: "0.8s" }} />

      {/* Dotted grid pattern */}
      <div className="absolute bottom-16 left-10 grid grid-cols-3 gap-3 opacity-[0.08]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        ))}
      </div>

      {/* Ring */}
      <div className="absolute top-2/3 right-20 h-24 w-24 rounded-full border-2 border-primary-foreground/[0.06] animate-float" style={{ animationDelay: "2.2s" }} />
    </div>
  )
}

/* ─── Brand Panel (desktop left side) ─── */
function BrandPanel({ step }: { step: number }) {
  const meta = STEP_META[step] || STEP_META[0]
  const StatIcon = meta.statIcon || Lock
  return (
    <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between bg-primary p-10 xl:p-12 text-primary-foreground relative overflow-hidden">
      <FloatingShapes />

      {/* Top: Logo + step counter */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
            <span className="text-lg font-extrabold tracking-tight">Op</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight opacity-90">Oppi</span>
        </div>
      </div>

      {/* Middle: Step title + subtitle + stat */}
      <div className="relative z-10 animate-fade-in-up" key={`brand-${step}`}>
        <h2 className="text-[36px] xl:text-[42px] font-extrabold leading-[1.05] tracking-tight whitespace-pre-line">{meta.title}</h2>
        <p className="mt-4 text-base xl:text-lg leading-relaxed text-primary-foreground/70 max-w-[360px]">{meta.subtitle}</p>
        {meta.stat && (
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 backdrop-blur-sm px-4 py-3">
            <StatIcon size={15} className="text-primary-foreground/70" />
            <span className="text-sm font-medium text-primary-foreground/85">{meta.stat}</span>
          </div>
        )}
      </div>

      {/* Bottom: Vertical step indicator with labels */}
      <div className="relative z-10">
        <div className="flex flex-col gap-1">
          {["Welcome", "Connect", "Quiz", "Results", "Loan Check", "Goals", "Profile", "Community", "Dashboard"].map((label, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-500 ${
                i === step
                  ? "bg-primary-foreground text-primary scale-110"
                  : i < step
                    ? "bg-primary-foreground/30 text-primary-foreground"
                    : "bg-primary-foreground/10 text-primary-foreground/40"
              }`}>
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              <span className={`text-[12px] font-medium transition-all duration-300 ${
                i === step
                  ? "text-primary-foreground opacity-100"
                  : i < step
                    ? "text-primary-foreground/50"
                    : "text-primary-foreground/25"
              }`}>
                {label}
              </span>
              {i === step && (
                <div className="h-px flex-1 bg-primary-foreground/20 ml-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Mobile progress bar ─── */
function MobileProgress({ step }: { step: number }) {
  const progress = ((step + 1) / TOTAL_STEPS) * 100
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
        <span className="text-[11px] font-semibold text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Desktop onboarding shell ─── */
function OnboardingShell({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <BrandPanel step={step} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col w-full lg:px-12 xl:px-20 2xl:px-28 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Back button ─── */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:text-foreground group"
      aria-label="Go back"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      Back
    </button>
  )
}

/* ─── Primary CTA button ─── */
function PrimaryButton({ onClick, disabled, children, className = "" }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-primary-foreground shadow-md shadow-primary/15 transition-all hover:bg-[#1250A0] hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:bg-[#E4E7EC] disabled:text-[#98A2B3] disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed lg:max-w-sm ${className}`}
      style={{ height: 52 }}
    >
      {children}
    </button>
  )
}

/* ─── Secondary CTA button ─── */
function SecondaryButton({ onClick, children, className = "" }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-6 text-foreground transition-all hover:bg-secondary hover:border-[#98A2B3] active:bg-secondary lg:max-w-xs ${className}`}
      style={{ height: 48 }}
    >
      {children}
    </button>
  )
}

/* ─── Text skip link ─── */
function SkipLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      {children}
    </button>
  )
}

/* ═════════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════════ */

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [iqStep, setIqStep] = useState(0)
  const [iqAnswers, setIqAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [bankConnected, setBankConnected] = useState(false)
  const [kelaConnected, setKelaConnected] = useState(false)
  const [profileData, setProfileData] = useState({ age: "20", field: "computer_science", year: "2", living: "" })
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [debtAmount, setDebtAmount] = useState("7800")
  const [debtFreeDate, setDebtFreeDate] = useState("2028")

  const score = iqAnswers.filter((a, i) => a === IQ_QUESTIONS[i].correct).length
  const scorePercent = Math.round((score / IQ_QUESTIONS.length) * 100)

  const goTo = useCallback((target: number, dir: "forward" | "back" = "forward") => {
    setDirection(dir)
    setStep(target)
  }, [])

  const goNext = useCallback(() => {
    setDirection("forward")
    setStep((s) => s + 1)
  }, [])

  const goBack = useCallback(() => {
    setDirection("back")
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const animClass = direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"

  /* ═══ Screen 0: Welcome ═══ */
  if (step === 0) {
    return (
      <OnboardingShell step={0}>
        <div className="flex flex-1 flex-col bg-card px-6 md:px-10 lg:justify-center lg:bg-transparent lg:px-0">
          <div key="welcome" className={`flex flex-1 flex-col items-center justify-center gap-5 lg:items-start lg:flex-initial lg:max-w-2xl ${animClass}`}>

            {/* Mobile: Illustrated hero area */}
            <div className="relative lg:hidden">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/25 relative overflow-hidden">
                {/* Decorative inner shapes */}
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary-foreground/10" />
                <div className="absolute bottom-3 left-3 h-4 w-4 rounded-lg bg-primary-foreground/[0.08] rotate-12" />
                <div className="relative flex flex-col items-center">
                  <span className="text-3xl font-extrabold tracking-tight text-primary-foreground">Oppi</span>
                  <div className="mt-0.5 flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-[#12B76A]" />
                    <span className="text-[9px] font-semibold text-primary-foreground/60 uppercase tracking-widest">Finland</span>
                  </div>
                </div>
              </div>
              {/* Floating badges around the logo */}
              <div className="absolute -top-2 -right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1FADF] shadow-md animate-float" style={{ animationDelay: "0.3s" }}>
                <PiggyBank size={14} className="text-[#027A48]" />
              </div>
              <div className="absolute -bottom-1 -left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF0C7] shadow-md animate-float" style={{ animationDelay: "1s" }}>
                <TrendingUp size={14} className="text-[#B54708]" />
              </div>
            </div>

            {/* Desktop: Illustrated hero area */}
            <div className="hidden lg:block relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary-foreground/10" />
                <span className="relative text-2xl font-extrabold tracking-tight text-primary-foreground">Oppi</span>
              </div>
              <div className="absolute -top-1 -right-2 flex h-7 w-7 items-center justify-center rounded-md bg-[#D1FADF] shadow-sm animate-float">
                <PiggyBank size={12} className="text-[#027A48]" />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-foreground text-balance lg:text-[42px] xl:text-[46px]">
                Learn Before<br />You Owe
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground lg:text-base lg:mt-4 max-w-[380px] mx-auto lg:mx-0">
                Built for Finnish students. Track spending, understand debt, and build real financial skills.
              </p>
            </div>

            {/* Feature pills */}
            <div className="mt-2 flex flex-col gap-2.5 self-stretch lg:mt-6 lg:flex-row lg:gap-4 stagger-children">
              {[
                { text: "Free for university students", icon: GraduationCap, color: "#12B76A", bg: "#D1FADF" },
                { text: "2 min setup, real insights", icon: Sparkles, color: "#F79009", bg: "#FEF0C7" },
                { text: "Smart tools, not lectures", icon: BookOpen, color: "#1A6CD8", bg: "#EBF3FE" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 lg:flex-1 lg:bg-transparent lg:border lg:border-border lg:rounded-xl lg:hover:shadow-sm lg:transition-shadow">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: item.bg }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span className="text-[15px] font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-10 pt-8 lg:pb-0 lg:pt-10 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <PrimaryButton onClick={goNext} className="lg:w-full lg:max-w-sm">
              <span className="text-base font-semibold">Get Started</span>
              <ChevronRight size={20} />
            </PrimaryButton>
            <div className="mt-5 flex items-center justify-center gap-1.5 lg:justify-start">
              <div className="flex -space-x-1.5">
                {["#1A6CD8", "#12B76A", "#F79009", "#7C3AED"].map((c) => (
                  <div key={c} className="h-6 w-6 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold text-primary-foreground" style={{ backgroundColor: c }}>
                    {c === "#1A6CD8" ? "A" : c === "#12B76A" ? "M" : c === "#F79009" ? "J" : "S"}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">12,400+ Finnish students</span>
              <Star size={11} className="text-[#F79009] ml-0.5" fill="#F79009" />
              <span className="text-xs font-semibold text-foreground">4.8</span>
            </div>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 1: Permissions ═══ */
  if (step === 1) {
    return (
      <OnboardingShell step={1}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center" key="perm">
          <BackButton onClick={goBack} />
          <MobileProgress step={1} />

          <div className={`mt-4 ${animClass}`}>
            <h1 className="text-[24px] font-bold leading-snug text-foreground lg:text-[28px]">Connect Your Accounts</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              To show you real insights, we need to connect your accounts. This is optional.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5 stagger-children">
            {/* Bank Card */}
            <div className={`rounded-2xl border-2 bg-card p-5 lg:p-6 transition-all duration-300 ${bankConnected ? "border-[#12B76A]/40 shadow-md shadow-[#12B76A]/10" : "border-border hover:border-primary/30 hover:shadow-md"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${bankConnected ? "bg-[#D1FADF]" : "bg-accent"}`}>
                  {bankConnected ? <Check size={22} className="text-[#027A48] animate-pop-in" /> : <Building2 size={22} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">Connect Bank</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">See spending patterns & cash flow</p>
                </div>
              </div>
              <button
                onClick={() => setBankConnected(true)}
                className={`mt-5 flex w-full items-center justify-center rounded-xl transition-all duration-300 ${
                  bankConnected
                    ? "bg-[#D1FADF] text-[#027A48] cursor-default"
                    : "bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:bg-[#1250A0] hover:-translate-y-0.5 active:translate-y-0"
                }`}
                style={{ height: 48 }}
                disabled={bankConnected}
              >
                {bankConnected ? (
                  <span className="flex items-center gap-2 text-sm font-semibold"><Check size={16} /> Connected</span>
                ) : (
                  <span className="text-sm font-semibold">Connect Now</span>
                )}
              </button>
            </div>

            {/* Kela Card */}
            <div className={`rounded-2xl border-2 bg-card p-5 lg:p-6 transition-all duration-300 ${kelaConnected ? "border-[#12B76A]/40 shadow-md shadow-[#12B76A]/10" : "border-border hover:border-primary/30 hover:shadow-md"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${kelaConnected ? "bg-[#D1FADF]" : "bg-accent"}`}>
                  {kelaConnected ? <Check size={22} className="text-[#027A48] animate-pop-in" /> : <FileText size={22} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">Import Kela Data</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Track loans & benefits automatically</p>
                </div>
              </div>
              <button
                onClick={() => setKelaConnected(true)}
                className={`mt-5 flex w-full items-center justify-center rounded-xl transition-all duration-300 ${
                  kelaConnected
                    ? "bg-[#D1FADF] text-[#027A48] cursor-default"
                    : "bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:bg-[#1250A0] hover:-translate-y-0.5 active:translate-y-0"
                }`}
                style={{ height: 48 }}
                disabled={kelaConnected}
              >
                {kelaConnected ? (
                  <span className="flex items-center gap-2 text-sm font-semibold"><Check size={16} /> Connected</span>
                ) : (
                  <span className="text-sm font-semibold">Connect Now</span>
                )}
              </button>
            </div>
          </div>

          {/* Connection status pill */}
          {(bankConnected || kelaConnected) && (
            <div className="mt-4 flex items-center justify-center gap-2 animate-fade-in-up lg:justify-start">
              <div className="flex items-center gap-1.5 rounded-full bg-[#D1FADF] px-3 py-1.5">
                <Check size={13} className="text-[#027A48]" />
                <span className="text-xs font-semibold text-[#027A48]">
                  {bankConnected && kelaConnected ? "Both connected" : "1 of 2 connected"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">Continue</span>
            </PrimaryButton>
            <SkipLink onClick={goNext}>Skip for now</SkipLink>
          </div>
          <div className="flex items-center justify-center gap-2 pt-3 text-xs text-muted-foreground lg:justify-start">
            <Lock size={12} />
            <span>Bank-level security. We never see your passwords.</span>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 2: Financial IQ Quiz ═══ */
  if (step === 2) {
    const q = IQ_QUESTIONS[iqStep]
    const progress = ((iqStep + 1) / IQ_QUESTIONS.length) * 100
    const QuestionIcon = q.icon

    return (
      <OnboardingShell step={2}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <BackButton onClick={iqStep > 0 ? () => { setIqStep(iqStep - 1); setSelectedAnswer(null) } : goBack} />
          <MobileProgress step={2} />

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground lg:text-xl">Financial IQ Test</h2>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: q.accentLight, color: q.accent }}>{q.tag}</span>
            </div>

            {/* Quiz progress */}
            <div className="mt-4 flex items-center gap-3">
              <span className="shrink-0 text-xs font-bold text-foreground">{iqStep + 1}/{IQ_QUESTIONS.length}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: q.accent }}
                />
              </div>
              <span className="shrink-0 text-xs font-bold" style={{ color: q.accent }}>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Question card */}
          <div
            key={`q-${iqStep}`}
            className="mt-7 rounded-2xl border-2 bg-card p-5 lg:p-7 animate-scale-in"
            style={{ borderColor: `${q.accent}25` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: q.accentLight }}>
                <QuestionIcon size={20} style={{ color: q.accent }} />
              </div>
              <p className="text-[15px] font-medium leading-relaxed text-foreground lg:text-base">{q.question}</p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-3">
              {q.options.map((opt, i) => {
                const isSelected = selectedAnswer === i
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswer(i)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 text-left transition-all duration-200 ${
                      isSelected ? "shadow-md -translate-y-0.5" : "hover:border-[#98A2B3] hover:shadow-sm"
                    }`}
                    style={{
                      minHeight: 52,
                      borderColor: isSelected ? q.accent : undefined,
                      backgroundColor: isSelected ? q.accentLight : undefined,
                    }}
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200"
                      style={{ borderColor: isSelected ? q.accent : "#D0D5DD", backgroundColor: isSelected ? q.accent : undefined }}
                    >
                      {isSelected && <Check size={12} className="text-primary-foreground animate-pop-in" />}
                    </div>
                    <span className="text-[15px] text-foreground">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-auto pt-8 lg:mt-0 lg:pt-8">
            <PrimaryButton
              onClick={() => {
                if (selectedAnswer === null) return
                const newAnswers = [...iqAnswers, selectedAnswer]
                setIqAnswers(newAnswers)
                setSelectedAnswer(null)
                if (iqStep < IQ_QUESTIONS.length - 1) {
                  setIqStep(iqStep + 1)
                } else {
                  goNext()
                }
              }}
              disabled={selectedAnswer === null}
            >
              <span className="text-[15px] font-semibold">{iqStep < IQ_QUESTIONS.length - 1 ? "Next Question" : "See Results"}</span>
              <ArrowRight size={18} />
            </PrimaryButton>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 3: IQ Results ═══ */
  if (step === 3) {
    return (
      <OnboardingShell step={3}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <MobileProgress step={3} />

          <div className={`mt-4 ${animClass}`}>
            <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">Your Financial IQ</h1>
          </div>

          {/* Score hero */}
          <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-card p-6 lg:p-8 animate-scale-in">
            <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-10">
              <div className="relative">
                <span className="text-[64px] font-extrabold leading-none tracking-tight text-primary animate-count-up lg:text-[72px]">{scorePercent}%</span>
                <div className="absolute -top-2 -right-3 animate-pop-in" style={{ animationDelay: "0.4s" }}>
                  <Sparkles size={20} className="text-[#F79009]" />
                </div>
              </div>
              <div className="mt-5 w-full lg:mt-0 lg:flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${scorePercent}%` }} />
                </div>
                <div className="mt-5 flex items-center justify-center gap-10 lg:justify-start">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold text-primary">{scorePercent}%</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">Your Score</div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold text-muted-foreground">55%</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">Average</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-5 rounded-2xl bg-accent p-4 lg:p-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                <Sparkles size={16} className="text-primary" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-accent-foreground lg:text-[15px]">
                {scorePercent >= 50 ? (
                  <>Above average! But you missed key questions about <strong>loan costs</strong> and <strong>compound interest</strong>. Oppi will help you master these.</>
                ) : (
                  <>Gaps in compound interest and tax knowledge detected. Students who use Oppi <strong>improve their score by 40% in 3 months</strong>.</>
                )}
              </p>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="mt-5 flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:gap-3 stagger-children">
            {IQ_QUESTIONS.map((q, i) => {
              const isCorrect = iqAnswers[i] === q.correct
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm ${isCorrect ? "border-[#12B76A]/30 bg-[#D1FADF]/30" : "border-[#F04438]/20 bg-[#FEE4E2]/20"}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isCorrect ? "bg-[#D1FADF]" : "bg-[#FEE4E2]"}`}>
                    {isCorrect ? <Check size={14} className="text-[#027A48]" /> : <span className="text-[12px] font-bold text-[#B42318]">X</span>}
                  </div>
                  <span className="flex-1 text-sm text-foreground line-clamp-1">Q{i + 1}: {q.question.slice(0, 40)}...</span>
                </div>
              )
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">See the Real Cost of Debt</span>
              <ArrowRight size={18} />
            </PrimaryButton>
            <SkipLink onClick={() => goTo(5)}>Skip to Goals</SkipLink>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 4: Loan Reality Check (THE AHA MOMENT) ═══ */
  if (step === 4) {
    const loanAmount = 500
    const instantAPR = 49.9
    const kelaRate = 0.5
    const instantTotal = Math.round(loanAmount * (1 + (instantAPR / 100)))
    const kelaTotal = Math.round(loanAmount * (1 + (kelaRate / 100)))
    const savings = instantTotal - kelaTotal
    const instantCost = instantTotal - loanAmount

    return (
      <OnboardingShell step={4}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <BackButton onClick={goBack} />
          <MobileProgress step={4} />

          <div className={`mt-4 ${animClass}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#F04438]" />
              <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">Loan Reality Check</h1>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              What happens when you borrow {"\u20AC"}500 from an instant loan vs. Kela student loan?
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="mt-7 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5">
            {/* Instant Loan — Bad */}
            <div className="rounded-2xl border-2 border-[#F04438]/30 bg-card p-5 lg:p-7 relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#F04438]" />
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEE4E2]">
                  <AlertTriangle size={16} className="text-[#F04438]" />
                </div>
                <span className="text-sm font-bold text-[#B42318] uppercase tracking-wider">Instant Loan</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You borrow</span>
                  <span className="font-semibold text-foreground">{"\u20AC"}{loanAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APR</span>
                  <span className="font-bold text-[#F04438]">{instantAPR}%</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">You pay back</span>
                  <span className="text-2xl font-extrabold text-[#F04438]">{"\u20AC"}{instantTotal}</span>
                </div>
                <div className="rounded-lg bg-[#FEE4E2] px-3 py-2 text-center">
                  <span className="text-sm font-bold text-[#B42318]">{"\u20AC"}{instantCost} wasted on interest</span>
                </div>
              </div>
            </div>

            {/* Kela Loan — Good */}
            <div className="rounded-2xl border-2 border-[#12B76A]/30 bg-card p-5 lg:p-7 relative overflow-hidden animate-scale-in" style={{ animationDelay: "0.15s" }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#12B76A]" />
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1FADF]">
                  <Shield size={16} className="text-[#027A48]" />
                </div>
                <span className="text-sm font-bold text-[#027A48] uppercase tracking-wider">Kela Student Loan</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You borrow</span>
                  <span className="font-semibold text-foreground">{"\u20AC"}{loanAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-bold text-[#12B76A]">{kelaRate}%</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">You pay back</span>
                  <span className="text-2xl font-extrabold text-[#12B76A]">{"\u20AC"}{kelaTotal}</span>
                </div>
                <div className="rounded-lg bg-[#D1FADF] px-3 py-2 text-center">
                  <span className="text-sm font-bold text-[#027A48]">Only {"\u20AC"}{kelaTotal - loanAmount} in interest</span>
                </div>
              </div>
            </div>
          </div>

          {/* DRAMATIC savings callout */}
          <div className="mt-6 rounded-2xl bg-[#12B76A] p-5 lg:p-6 text-center animate-fade-in-up relative overflow-hidden" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
            <p className="text-sm font-medium text-primary-foreground/80 relative">By choosing Kela over an instant loan, you save</p>
            <p className="mt-1 text-[42px] font-extrabold tracking-tight text-primary-foreground relative animate-count-up lg:text-[52px]">{"\u20AC"}{savings}</p>
            <p className="mt-1 text-sm font-semibold text-primary-foreground/90 relative">on just a {"\u20AC"}{loanAmount} loan. Imagine that on {"\u20AC"}5,000.</p>
          </div>

          {/* Quick fact */}
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#FEF0C7] px-4 py-3 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Zap size={16} className="text-[#B54708] shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-[#93370D]">
              <strong>1 in 3</strong> Finnish students under 30 have used an instant loan. Most didn{"'"}t know the real cost until it was too late.
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">Set My Financial Goal</span>
              <ArrowRight size={18} />
            </PrimaryButton>
            <SkipLink onClick={() => goTo(6)}>Skip to Profile</SkipLink>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 5: Goal Setting ═══ */
  if (step === 5) {
    /* Phase A: Pick a goal */
    if (!selectedGoal) {
      return (
        <OnboardingShell step={5}>
          <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
            <BackButton onClick={goBack} />
            <MobileProgress step={5} />

            <div className={`mt-4 ${animClass}`}>
              <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">{"What's Your Money Goal?"}</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">Pick your top priority. You can add more later.</p>
            </div>

            <div className="mt-7 flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 stagger-children">
              {GOALS.map((g) => {
                const GoalIcon = g.icon
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 lg:p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group overflow-hidden relative"
                  >
                    {/* Illustrated background gradient */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: g.bgPattern }} />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl relative" style={{ backgroundColor: `${g.color}15` }}>
                      <GoalIcon size={22} style={{ color: g.color }} />
                    </div>
                    <div className="flex-1 relative">
                      <span className="text-[15px] font-semibold text-foreground block">{g.label}</span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">{g.desc}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1 relative" />
                  </button>
                )
              })}
            </div>

            <div className="mt-auto pt-8 lg:mt-0 lg:pt-10">
              <SkipLink onClick={() => { setSelectedGoal("skip"); goNext() }}>{"Skip \u2014 Just exploring"}</SkipLink>
            </div>
          </div>
        </OnboardingShell>
      )
    }

    /* Phase B: Smart Goal follow-up */
    const yearsToPayoff = parseInt(debtFreeDate) - 2025
    const monthlyNeeded = yearsToPayoff > 0 ? Math.round((parseInt(debtAmount || "7800") * 1.025) / (yearsToPayoff * 12)) : 0
    const surplus = 51
    const difficulty = monthlyNeeded <= surplus ? "Manageable" : monthlyNeeded <= surplus * 3 ? "Challenging" : "Very Difficult"
    const diffColor = difficulty === "Manageable" ? "#12B76A" : difficulty === "Challenging" ? "#F79009" : "#F04438"

    return (
      <OnboardingShell step={5}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <BackButton onClick={() => setSelectedGoal(null)} />

          <div className="animate-slide-in-right">
            <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">Smart Goal Setup</h1>

            <div className="mt-7 flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Student loan balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted-foreground">{"\u20AC"}</span>
                  <input
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-border bg-card pl-9 pr-4 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-[#98A2B3]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Debt-free target</label>
                <select
                  value={debtFreeDate}
                  onChange={(e) => setDebtFreeDate(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border-2 border-border bg-card px-4 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-[#98A2B3]"
                >
                  <option value="2027">2027 (2 years)</option>
                  <option value="2028">2028 (3 years)</option>
                  <option value="2029">2029 (4 years)</option>
                  <option value="2030">2030 (5 years)</option>
                </select>
              </div>
            </div>

            {/* Live calculation */}
            <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-card p-5 lg:p-6 animate-scale-in">
              <p className="text-sm font-medium text-muted-foreground">{"You'll need to save:"}</p>
              <p className="mt-1 text-[36px] font-extrabold tracking-tight text-foreground lg:text-[42px] animate-count-up">
                {"\u20AC"}{monthlyNeeded}<span className="text-lg font-normal text-muted-foreground">/month</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Difficulty:</span>
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `${diffColor}15`, color: diffColor }}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: diffColor }} />
                  {difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">Continue</span>
            </PrimaryButton>
            <SecondaryButton onClick={() => goTo(7)}>
              <span className="text-[15px] font-medium">Skip Profile</span>
            </SecondaryButton>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 6: Profile (moved AFTER aha moment) ═══ */
  if (step === 6) {
    return (
      <OnboardingShell step={6}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <BackButton onClick={goBack} />
          <MobileProgress step={6} />

          <div className={`mt-4 ${animClass}`}>
            <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">Quick Profile</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">This helps us personalize tips for your exact situation.</p>
          </div>

          <div className="mt-7 flex flex-col gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-8 lg:gap-y-5 stagger-children">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Your Age</label>
              <input
                type="number"
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                className="h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-[#98A2B3]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Your Studies</label>
              <select
                value={profileData.field}
                onChange={(e) => setProfileData({ ...profileData, field: e.target.value })}
                className="h-12 w-full appearance-none rounded-xl border-2 border-border bg-card px-4 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-[#98A2B3]"
              >
                <option value="computer_science">Computer Science</option>
                <option value="business">Business</option>
                <option value="engineering">Engineering</option>
                <option value="nursing">Nursing</option>
                <option value="law">Law</option>
                <option value="arts">Arts & Humanities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Year of Study</label>
              <select
                value={profileData.year}
                onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                className="h-12 w-full appearance-none rounded-xl border-2 border-border bg-card px-4 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-[#98A2B3]"
              >
                <option value="1">1st year</option>
                <option value="2">2nd year</option>
                <option value="3">3rd year</option>
                <option value="4">4th year</option>
                <option value="5">5th year+</option>
              </select>
            </div>

            <div className="lg:col-span-2 xl:col-span-3">
              <label className="mb-2.5 block text-sm font-semibold text-foreground">Living Situation</label>
              <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-3">
                {["Shared apartment", "Solo apartment", "With parents", "Student dorm"].map((opt) => {
                  const isActive = profileData.living === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => setProfileData({ ...profileData, living: opt })}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${
                        isActive
                          ? "border-primary bg-accent shadow-md -translate-y-0.5"
                          : "border-border bg-card hover:border-[#98A2B3] hover:shadow-sm"
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isActive ? "border-primary bg-primary" : "border-[#D0D5DD]"
                      }`}>
                        {isActive && <Check size={12} className="text-primary-foreground animate-pop-in" />}
                      </div>
                      <span className="text-[15px] font-medium text-foreground">{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">Continue</span>
            </PrimaryButton>
            <SkipLink onClick={goNext}>Skip for now</SkipLink>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 7: Social Proof ═══ */
  if (step === 7) {
    return (
      <OnboardingShell step={7}>
        <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
          <BackButton onClick={goBack} />
          <MobileProgress step={7} />

          <div className={`mt-4 ${animClass}`}>
            <h1 className="text-[24px] font-bold text-foreground lg:text-[28px]">Students Like You</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Real strategies from students who turned their finances around.
            </p>
          </div>

          {/* Stats banner with university logos */}
          <div className="mt-5 rounded-xl bg-accent p-4 animate-fade-in-up">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-primary" />
                <span className="text-xs font-bold text-accent-foreground">12,400 students</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-primary/20" />
              <span className="text-xs text-accent-foreground">Avg debt reduced by <strong>34%</strong></span>
            </div>
            {/* University badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {UNIVERSITIES.map((uni) => (
                <span key={uni} className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                  <GraduationCap size={10} className="text-primary" />
                  {uni}
                </span>
              ))}
            </div>
          </div>

          {/* Peer stories */}
          <div className="mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5 stagger-children">
            {PEER_STORIES.map((peer) => (
              <div key={peer.name} className="rounded-2xl border-2 border-border bg-card p-5 lg:p-7 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ backgroundColor: peer.color }}>
                    {peer.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-foreground">{peer.name}, {peer.age}</p>
                    <p className="text-xs text-muted-foreground">{peer.uni}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Had debt</p>
                    <p className="mt-1 text-base font-bold text-foreground">{peer.debt}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="mt-1 text-base font-bold text-[#12B76A]">{peer.result}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Saved</p>
                    <p className="mt-1 text-base font-bold text-primary">{peer.saved}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-secondary/70 px-4 py-3">
                  <p className="text-sm italic leading-relaxed text-foreground">
                    {"\u201C"}{peer.quote}{"\u201D"}
                  </p>
                </div>
                <button className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-[#0E3460] group">
                  See Full Strategy
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
            <PrimaryButton onClick={goNext}>
              <span className="text-[15px] font-semibold">Create My Plan</span>
            </PrimaryButton>
            <SkipLink onClick={goNext}>Show Me More Examples</SkipLink>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  /* ═══ Screen 8: Onboarding Complete ═══ */
  return (
    <OnboardingShell step={8}>
      <div className="flex flex-1 flex-col bg-background px-6 pt-14 pb-10 md:px-10 lg:px-0 lg:pt-4 lg:justify-center">
        <MobileProgress step={8} />

        <div className="mt-4 animate-fade-in-up">
          {/* Success badge */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#12B76A]/20 animate-pulse-ring" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FADF]">
                <Check size={32} className="text-[#027A48] animate-pop-in" />
              </div>
            </div>
          </div>
          <h1 className="mt-5 text-center text-[24px] font-bold text-foreground lg:text-left lg:text-[28px]">{"You're All Set!"}</h1>
          <p className="mt-2 text-center text-[15px] text-muted-foreground lg:text-left">{"Here's a preview of your personalized dashboard:"}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-5 stagger-children">
          {/* Debt card */}
          <div className="rounded-2xl border-2 border-border bg-card p-4 lg:p-6 transition-all hover:shadow-md hover:border-primary/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Debt</p>
            <p className="mt-1 text-[28px] font-extrabold tracking-tight text-foreground animate-count-up">{"\u20AC"}{debtAmount || "7,800"}</p>
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#F79009]" />
              <p className="text-xs text-muted-foreground">{"\u20AC0 paid this month"}</p>
            </div>
          </div>

          {/* Monthly summary card */}
          <div className="rounded-2xl border-2 border-border bg-card p-4 lg:p-6 transition-all hover:shadow-md hover:border-primary/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">This Month</p>
            <div className="mt-3 flex gap-5">
              <div>
                <p className="text-[11px] text-muted-foreground">Income</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{"\u20AC801"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Spent</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{"\u20AC720"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Saved</p>
                <p className="mt-0.5 text-lg font-bold text-[#12B76A]">{"\u20AC81"}</p>
              </div>
            </div>
          </div>

          {/* Goal progress card */}
          <div className="rounded-2xl border-2 border-border bg-card p-4 lg:p-6 transition-all hover:shadow-md hover:border-primary/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Goal Progress</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Debt-free by {debtFreeDate}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[2%] rounded-full bg-primary transition-all duration-1000" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{"0% \u2014 Just started! You got this."}</p>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-5 rounded-2xl bg-accent p-4 lg:p-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
              <Sparkles size={16} className="text-primary" />
            </div>
            <p className="text-sm leading-relaxed text-accent-foreground">
              <strong>Quick Tip:</strong> Enable notifications to get weekly spending check-ins. Students who do this save <strong>23% more</strong>.
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-0 lg:pt-10 lg:flex-row lg:items-center lg:gap-4">
          <PrimaryButton onClick={onComplete}>
            <span className="text-[15px] font-semibold">Explore Dashboard</span>
            <ArrowRight size={18} />
          </PrimaryButton>
          <SecondaryButton onClick={onComplete}>
            <span className="text-[15px] font-medium">Enable Notifications</span>
          </SecondaryButton>
        </div>
      </div>
    </OnboardingShell>
  )
}
