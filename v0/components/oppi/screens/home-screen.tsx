"use client"

import { useState } from "react"
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Calculator,
  Target,
  Wallet,
  ArrowLeft,
} from "lucide-react"

const WEEK_TRANSACTIONS = [
  { day: "Mon", items: [
    { name: "Pizza w/ friends", category: "food", amount: 28 },
    { name: "Netflix", category: "entertainment", amount: 14 },
  ]},
  { day: "Tue", items: [
    { name: "Lunch at cafe", category: "food", amount: 12 },
    { name: "T-shirt", category: "shopping", amount: 32 },
  ]},
  { day: "Wed", items: [
    { name: "Grocery", category: "food", amount: 35 },
    { name: "Steam game", category: "entertainment", amount: 25 },
  ]},
  { day: "Thu", items: [
    { name: "Hesburger", category: "food", amount: 9 },
    { name: "Spotify", category: "entertainment", amount: 11 },
  ]},
  { day: "Fri", items: [
    { name: "Drinks at bar", category: "food", amount: 36 },
    { name: "Concert ticket", category: "entertainment", amount: 45 },
    { name: "Headphones", category: "shopping", amount: 40 },
  ]},
]

const CATEGORY_TOTALS = [
  { name: "Food & Drinks", icon: "\uD83C\uDF55", amount: 120, color: "#F79009" },
  { name: "Entertainment", icon: "\uD83C\uDFAE", amount: 95, color: "#7C3AED" },
  { name: "Shopping", icon: "\uD83D\uDC55", amount: 72, color: "#1A6CD8" },
]

interface HomeScreenProps {
  onOpenSimulator: () => void
}

export function HomeScreen({ onOpenSimulator }: HomeScreenProps) {
  const [showDetails, setShowDetails] = useState(false)

  /* ─── Flow 3: Spending Details drill-down ─── */
  if (showDetails) {
    return (
      <div className="flex flex-col gap-5 px-4 pt-6 pb-4 md:gap-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetails(false)}
            className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-muted active:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-foreground md:hidden" />
            <ArrowLeft size={22} className="text-foreground hidden md:block" />
          </button>
          <h1 className="text-[22px] md:text-[28px] font-bold text-foreground">{"This Week's Spending"}</h1>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 md:p-6">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">March 11 - March 17</p>
            <p className="mt-0.5 text-2xl md:text-3xl font-extrabold text-foreground">{"\u20AC287"}</p>
          </div>
          <div className="rounded-full bg-[#FEE4E2] px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-[#B42318]">
            {"\u20AC87 over budget"}
          </div>
        </div>

        {/* Category breakdowns */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
          {CATEGORY_TOTALS.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg md:text-xl">{cat.icon}</span>
                <span className="text-[15px] md:text-base font-semibold text-foreground">{cat.name}</span>
                <span className="ml-auto text-[15px] md:text-base font-bold" style={{ color: cat.color }}>{"\u20AC"}{cat.amount}</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {WEEK_TRANSACTIONS.flatMap((d) =>
                  d.items
                    .filter((it) => {
                      if (cat.name === "Food & Drinks") return it.category === "food"
                      if (cat.name === "Entertainment") return it.category === "entertainment"
                      return it.category === "shopping"
                    })
                    .map((it) => ({ ...it, day: d.day }))
                ).map((tx, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 ${i < arr.length - 1 ? "border-b border-[#F2F4F7]" : ""}`}
                  >
                    <div>
                      <p className="text-sm md:text-[15px] text-foreground">{tx.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{tx.day}</p>
                    </div>
                    <span className="text-sm md:text-[15px] font-semibold text-[#B42318]">{"\u20AC"}{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actionable insight */}
        <div className="rounded-xl bg-accent p-4 md:p-6">
          <p className="text-sm md:text-base font-medium leading-relaxed text-accent-foreground">
            You spent <strong>{"\u20AC64"} on eating out</strong> this week. If you cooked instead: save ~{"\u20AC40"}/week = <strong>{"\u20AC160"}/month</strong>. {"That's"} 74% of your debt payment goal!
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <button className="flex flex-1 items-center justify-center rounded-xl bg-primary px-6 text-primary-foreground transition-colors hover:bg-[#1250A0] active:bg-[#1250A0]" style={{ height: 52 }}>
            <span className="text-[15px] md:text-base font-semibold">See Meal Prep Guide</span>
          </button>
          <button className="flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-6 text-foreground transition-colors hover:bg-secondary active:bg-secondary" style={{ height: 48 }}>
            <span className="text-sm md:text-[15px] font-medium">Set Eating Out Budget</span>
          </button>
        </div>
      </div>
    )
  }

  /* ─── Flow 2: Main Dashboard ─── */
  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4 md:gap-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm md:text-base text-muted-foreground">Friday, March 15</p>
          <h1 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold leading-tight text-foreground">Hey Antti</h1>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition-all active:bg-muted" aria-label="Notifications">
            <Bell size={20} className="text-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F04438] text-[10px] font-bold text-[#FFFFFF]">3</span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
        </div>
      </div>

      {/* Main content grid: stack on mobile, 2-col on lg+ */}
      <div className="flex flex-col gap-5 md:gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* ─── Weekly Spending Card ─── */}
        <div className="rounded-2xl bg-card border border-border p-5 md:p-7">
          <div className="flex items-center justify-between">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">This Week</p>
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-2">
            <span className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-foreground">{"\u20AC287"}</span>
            <span className="text-sm md:text-base text-muted-foreground">/ {"\u20AC200"} budget</span>
          </div>
          {/* Budget bar */}
          <div className="mt-3 md:mt-4 h-2.5 md:h-3 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[#F04438] transition-all" style={{ width: "100%" }} />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-[#F04438]" />
            <span className="text-sm md:text-base font-medium text-[#B42318]">{"\u20AC87"} over budget</span>
          </div>

          {/* Top spending categories */}
          <div className="mt-4 md:mt-5 flex flex-col gap-2.5">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Top spending:</p>
            {CATEGORY_TOTALS.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg">{cat.icon}</span>
                  <span className="text-sm md:text-[15px] text-foreground">{cat.name}</span>
                </div>
                <span className="text-sm md:text-[15px] font-semibold text-foreground">{"\u20AC"}{cat.amount}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowDetails(true)}
            className="mt-4 md:mt-5 flex w-full items-center justify-center gap-1 rounded-lg bg-secondary px-4 py-2.5 md:py-3 text-sm md:text-[15px] font-semibold text-foreground transition-colors hover:bg-border active:bg-border"
          >
            See Details <ChevronRight size={16} className="md:hidden" /><ChevronRight size={18} className="hidden md:block" />
          </button>
        </div>

        {/* ─── Debt Payoff Goal Card ─── */}
        <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-primary md:hidden" />
            <Target size={20} className="text-primary hidden md:block" />
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Debt Payoff Goal</p>
          </div>
          <div className="mt-2 md:mt-3 flex items-baseline gap-2">
            <span className="text-lg md:text-xl font-bold text-foreground">{"\u20AC7,800 \u2192 \u20AC0"}</span>
            <span className="text-xs md:text-sm text-muted-foreground">by 2028</span>
          </div>
          <div className="mt-3 md:mt-4 h-2 md:h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: "5%" }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm md:text-[15px]">
            <span className="text-muted-foreground">5% complete</span>
          </div>
          <div className="mt-3 md:mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Need</p>
              <p className="text-sm md:text-base font-bold text-foreground">{"\u20AC217"}/month</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Paid this month</p>
              <p className="text-sm md:text-base font-bold text-[#F04438]">{"\u20AC0"}</p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 rounded-lg bg-[#FEF0C7] px-3 py-2 md:px-4 md:py-3">
            <p className="text-xs md:text-sm font-medium text-[#7A2E0E]">
              {"You're \u20AC217 short this month. Can you cut \u20AC40/week on food?"}
            </p>
          </div>
          <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 md:py-3 text-sm md:text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-[#1250A0] active:bg-[#1250A0]">
              Make Payment
            </button>
            <button className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 md:py-3 text-sm md:text-[15px] font-medium text-foreground transition-colors hover:bg-secondary active:bg-secondary">
              Adjust Goal
            </button>
          </div>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">Quick Actions</p>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-4">
          <button className="flex items-center gap-3 md:gap-4 rounded-xl border border-border bg-card px-4 py-3.5 md:px-5 md:py-5 text-left transition-all hover:bg-muted active:bg-muted">
            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Wallet size={18} className="text-primary md:hidden" />
              <Wallet size={22} className="text-primary hidden md:block" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] md:text-base font-semibold text-foreground">Log Expense</p>
              <p className="text-xs md:text-sm text-muted-foreground">Track a new purchase</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground md:hidden" />
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-3 md:gap-4 rounded-xl border border-border bg-card px-4 py-3.5 md:px-5 md:py-5 text-left transition-all hover:bg-muted active:bg-muted"
          >
            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-[#FEE4E2]">
              <Calculator size={18} className="text-[#B42318] md:hidden" />
              <Calculator size={22} className="text-[#B42318] hidden md:block" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] md:text-base font-semibold text-foreground">Check Loans</p>
              <p className="text-xs md:text-sm text-muted-foreground">See what your loans really cost</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground md:hidden" />
          </button>

          <button className="flex items-center gap-3 md:gap-4 rounded-xl border border-border bg-card px-4 py-3.5 md:px-5 md:py-5 text-left transition-all hover:bg-muted active:bg-muted">
            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-[#D1FADF]">
              <Target size={18} className="text-[#027A48] md:hidden" />
              <Target size={22} className="text-[#027A48] hidden md:block" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] md:text-base font-semibold text-foreground">Savings Challenge</p>
              <p className="text-xs md:text-sm text-muted-foreground">1,247 students trying this now</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground md:hidden" />
          </button>
        </div>
      </div>

      {/* ─── Weekly Lesson CTA ─── */}
      <div className="rounded-2xl bg-[#0E3460] p-5 md:p-7">
        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-[#86B9F7]/60">
          {"This week's lesson"}
        </p>
        <h3 className="mt-1 text-lg md:text-xl font-bold text-[#FFFFFF]">
          The Instant Loan Trap
        </h3>
        <p className="mt-1 text-sm md:text-base leading-relaxed text-[#86B9F7]/80">
          Learn how 200-1000% APR actually works and why {"it's"} a debt spiral.
        </p>
        <button className="mt-4 md:mt-5 flex items-center gap-2 rounded-xl bg-[#FFFFFF]/15 px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-[15px] font-semibold text-[#FFFFFF] transition-all hover:bg-[#FFFFFF]/25 active:bg-[#FFFFFF]/25">
          Start Lesson (3 min)
          <ArrowRight size={16} className="md:hidden" />
          <ArrowRight size={18} className="hidden md:block" />
        </button>
      </div>
    </div>
  )
}
