"use client"

import { useState } from "react"
import { ArrowLeft, AlertTriangle, TrendingUp, Info, ChevronDown, ChevronUp, Share2 } from "lucide-react"

const months = [3, 6, 12, 24, 36]

interface SimulatorScreenProps {
  onBack: () => void
}

export function SimulatorScreen({ onBack }: SimulatorScreenProps) {
  const [amount, setAmount] = useState(300)
  const [selectedMonths, setSelectedMonths] = useState(12)
  const [showDetails, setShowDetails] = useState(false)
  const [showDebtPlan, setShowDebtPlan] = useState(false)

  const instantLoanAPR = 163
  const kelaAPR = 3
  const instantTotal = Math.round(amount * (1 + (instantLoanAPR / 100) * (selectedMonths / 12)))
  const kelaTotal = Math.round(amount * (1 + (kelaAPR / 100) * (selectedMonths / 12)))
  const instantInterest = instantTotal - amount
  const kelaInterest = kelaTotal - amount
  const savedAmount = instantTotal - kelaTotal

  /* ─── Debt Plan sub-screen ─── */
  if (showDebtPlan) {
    const totalDebt = 7800
    const scenarios = [
      { label: "Aggressive", monthly: 325, months: 24, interest: 234, emoji: "\uD83D\uDE80" },
      { label: "Moderate", monthly: 217, months: 36, interest: 351, emoji: "\u2696\uFE0F" },
      { label: "Minimum", monthly: 130, months: 60, interest: 600, emoji: "\uD83D\uDC22" },
    ]

    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
          <button
            onClick={() => setShowDebtPlan(false)}
            className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-muted active:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-foreground md:hidden" />
            <ArrowLeft size={22} className="text-foreground hidden md:block" />
          </button>
          <h1 className="text-[22px] md:text-[28px] font-bold text-foreground">Debt-Free Plan</h1>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-8 md:gap-6 md:px-8 lg:px-12 xl:px-16">
          {/* Current debt */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Total Student Loan Debt</p>
            <p className="mt-1 text-[36px] md:text-[44px] font-extrabold tracking-tight text-foreground">{"\u20AC"}{totalDebt.toLocaleString()}</p>
            <p className="text-sm md:text-base text-muted-foreground">at 2.5% interest</p>
          </div>

          {/* Scenarios — grid on desktop */}
          <div>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">Pick Your Speed</p>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
              {scenarios.map((s, i) => (
                <div key={i} className={`rounded-xl border-2 p-4 md:p-5 transition-all hover:shadow-sm ${i === 1 ? "border-primary bg-accent" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl">{s.emoji}</span>
                      <span className="text-[15px] md:text-base font-bold text-foreground">{s.label}</span>
                    </div>
                    {i === 1 && (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] md:text-[11px] font-bold text-primary-foreground">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="mt-3 md:mt-4 flex gap-6">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Monthly</p>
                      <p className="text-lg md:text-xl font-bold text-foreground">{"\u20AC"}{s.monthly}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg md:text-xl font-bold text-foreground">{s.months} mo</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-lg md:text-xl font-bold text-[#B42318]">{"\u20AC"}{s.interest}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <p className="text-sm md:text-base font-semibold text-foreground">Debt Over Time (Moderate)</p>
            <div className="mt-3 md:mt-4 flex items-end gap-1 md:gap-1.5" style={{ height: 100 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const remaining = Math.max(0, 1 - (i + 1) * (1 / 12) * 0.33)
                return (
                  <div key={i} className="flex-1 rounded-t bg-primary/70 transition-all" style={{ height: `${remaining * 100}%` }} />
                )
              })}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] md:text-xs text-muted-foreground">
              <span>Now</span><span>1yr</span><span>2yr</span><span>3yr</span>
            </div>
          </div>

          {/* Insight */}
          <div className="rounded-xl bg-accent p-4 md:p-6">
            <p className="text-sm md:text-base font-medium leading-relaxed text-accent-foreground">
              <strong>Your {"\u20AC51"} monthly surplus</strong> covers 24% of the moderate plan. Cutting {"\u20AC40"}/week on eating out gets you to 100%. Start the meal prep challenge?
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <button onClick={() => setShowDebtPlan(false)} className="flex flex-1 items-center justify-center rounded-xl bg-primary px-6 text-primary-foreground transition-colors hover:bg-[#1250A0] active:bg-[#1250A0]" style={{ height: 52 }}>
              <span className="text-[15px] md:text-base font-semibold">Start Moderate Plan</span>
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-foreground transition-colors hover:bg-secondary active:bg-secondary" style={{ height: 48 }}>
              <Share2 size={16} /><span className="text-sm md:text-[15px] font-medium">Share Plan With Friend</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main Calculator ─── */
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
        <button
          onClick={onBack}
          className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-muted active:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-foreground md:hidden" />
          <ArrowLeft size={22} className="text-foreground hidden md:block" />
        </button>
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold text-foreground">Loan Reality Check</h1>
          <p className="text-[13px] md:text-sm text-muted-foreground">See what it really costs</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-8 md:gap-6 md:px-8 lg:px-12 xl:px-16">
        {/* Amount selector */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-7">
          <label className="text-sm md:text-base font-semibold text-foreground">How much do you need?</label>
          <div className="mt-3 md:mt-4 flex items-baseline gap-2">
            <span className="text-[36px] md:text-[44px] font-extrabold tracking-tight text-foreground">{"\u20AC"}{amount}</span>
          </div>
          <input
            type="range"
            min={50} max={2000} step={50}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 md:mt-4 w-full accent-primary"
            aria-label="Loan amount"
          />
          <div className="mt-1 flex justify-between text-xs md:text-sm text-muted-foreground">
            <span>{"\u20AC50"}</span><span>{"\u20AC2,000"}</span>
          </div>
        </div>

        {/* Duration chips */}
        <div>
          <label className="text-sm md:text-base font-semibold text-foreground">Repayment period</label>
          <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonths(m)}
                className={`flex-1 rounded-lg border py-2.5 md:py-3 text-sm md:text-[15px] font-semibold transition-all ${
                  selectedMonths === m
                    ? "border-primary bg-accent text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted active:bg-muted"
                }`}
              >
                {m}mo
              </button>
            ))}
          </div>
        </div>

        {/* Comparison — side by side on desktop */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
          {/* Instant Loan */}
          <div className="rounded-xl border-2 border-[#FEE4E2] bg-[#FEE4E2]/10 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#B42318] md:hidden" />
                <AlertTriangle size={20} className="text-[#B42318] hidden md:block" />
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#B42318]">Instant Loan</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-[#B42318]/70">{instantLoanAPR}% APR</span>
            </div>
            <p className="mt-2 md:mt-3 text-[28px] md:text-[36px] font-extrabold text-[#B42318]">{"\u20AC"}{instantTotal.toLocaleString()}</p>
            <p className="text-sm md:text-base text-[#B42318]/70">You pay {"\u20AC"}{instantInterest} in interest alone</p>
            <div className="mt-3 md:mt-4 flex items-center justify-between rounded-lg bg-[#FEE4E2] p-3 md:p-4">
              <span className="text-sm md:text-[15px] font-medium text-[#B42318]">Monthly</span>
              <span className="text-base md:text-lg font-bold text-[#B42318]">{"\u20AC"}{Math.round(instantTotal / selectedMonths)}/mo</span>
            </div>
          </div>

          {/* Student Loan */}
          <div className="rounded-xl border-2 border-[#D1FADF] bg-[#D1FADF]/10 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#027A48] md:hidden" />
                <TrendingUp size={20} className="text-[#027A48] hidden md:block" />
                <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#027A48]">Kela Student Loan</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-[#027A48]/70">{kelaAPR}% APR</span>
            </div>
            <p className="mt-2 md:mt-3 text-[28px] md:text-[36px] font-extrabold text-[#027A48]">{"\u20AC"}{kelaTotal.toLocaleString()}</p>
            <p className="text-sm md:text-base text-[#027A48]/70">Only {"\u20AC"}{kelaInterest} in interest</p>
            <div className="mt-3 md:mt-4 flex items-center justify-between rounded-lg bg-[#D1FADF] p-3 md:p-4">
              <span className="text-sm md:text-[15px] font-medium text-[#027A48]">Monthly</span>
              <span className="text-base md:text-lg font-bold text-[#027A48]">{"\u20AC"}{Math.round(kelaTotal / selectedMonths)}/mo</span>
            </div>
          </div>
        </div>

        {/* VS divider — hidden on desktop grid */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-bold text-muted-foreground">VS</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Savings callout */}
        <div className="rounded-xl bg-primary p-5 md:p-7">
          <p className="text-sm md:text-base font-medium text-primary-foreground/70">By choosing a student loan, you save</p>
          <p className="mt-1 text-[32px] md:text-[40px] font-extrabold tracking-tight text-primary-foreground">{"\u20AC"}{savedAmount}</p>
          <p className="mt-1 text-sm md:text-base text-primary-foreground/70">
            {"That's"} {Math.round(savedAmount / 4.8)} cups of coffee, or {Math.round(savedAmount / 55)} HSL monthly passes.
          </p>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 md:p-5 transition-all hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Info size={18} className="text-primary md:hidden" />
            <Info size={20} className="text-primary hidden md:block" />
            <span className="text-[15px] md:text-base font-semibold text-foreground">How is this calculated?</span>
          </div>
          {showDetails ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </button>
        {showDetails && (
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 text-sm md:text-[15px] leading-relaxed text-secondary-foreground">
            <p><strong className="text-foreground">Instant loans</strong> in Finland typically charge 200-1000% APR. We use a conservative 163% APR.</p>
            <p className="mt-2"><strong className="text-foreground">Kela student loans</strong> have regulated interest rates around 3% APR, with repayment starting after graduation.</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2 md:flex-row md:gap-3">
          <button onClick={() => setShowDebtPlan(true)} className="flex flex-1 items-center justify-center rounded-xl bg-primary px-6 text-primary-foreground transition-colors hover:bg-[#1250A0] active:bg-[#1250A0]" style={{ height: 52 }}>
            <span className="text-[15px] md:text-base font-semibold">Create Debt-Free Plan</span>
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-foreground transition-colors hover:bg-secondary active:bg-secondary" style={{ height: 48 }}>
            <Share2 size={16} /><span className="text-sm md:text-[15px] font-medium">Share This Comparison</span>
          </button>
        </div>
      </div>
    </div>
  )
}
