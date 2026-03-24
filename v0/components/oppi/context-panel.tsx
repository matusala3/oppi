"use client"

import { Flame, Target, BookOpen, TrendingUp, Users, ChevronRight } from "lucide-react"
import type { TabId } from "./side-nav"

interface ContextPanelProps {
  activeTab: TabId
  onOpenSimulator: () => void
}

export function ContextPanel({ activeTab, onOpenSimulator }: ContextPanelProps) {
  return (
    <aside className="hidden lg:flex flex-col w-[320px] shrink-0 border-l border-border bg-card h-dvh sticky top-0 overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        {/* Quick Stats */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Stats
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between rounded-xl bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF0C7]">
                  <Flame size={18} className="text-[#F79009]" />
                </div>
                <span className="text-[15px] text-foreground">Streak</span>
              </div>
              <span className="text-[15px] font-bold text-foreground">5 days</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Target size={18} className="text-primary" />
                </div>
                <span className="text-[15px] text-foreground">Debt Goal</span>
              </div>
              <span className="text-[15px] font-bold text-foreground">5%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FADF]">
                  <TrendingUp size={18} className="text-[#027A48]" />
                </div>
                <span className="text-[15px] text-foreground">Saved</span>
              </div>
              <span className="text-[15px] font-bold text-[#12B76A]">{"\u20AC81"}</span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Active Challenge */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Active Challenge
          </p>
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-2.5">
              <Flame size={18} className="text-[#F79009]" />
              <span className="text-[15px] font-semibold text-foreground">Track Everything</span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">Log every expense for 3 days straight</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[66%] rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">2/3 days</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Weekly Lesson */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {"This Week's Lesson"}
          </p>
          <div className="rounded-xl bg-[#0E3460] p-5">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#86B9F7]/80" />
              <span className="text-xs font-medium text-[#86B9F7]/60">3 min read</span>
            </div>
            <h3 className="mt-2.5 text-base font-bold text-[#FFFFFF]">The Instant Loan Trap</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#86B9F7]/70">
              Learn how 200-1000% APR works.
            </p>
            <button className="mt-4 rounded-lg bg-[#FFFFFF]/15 px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] transition-all hover:bg-[#FFFFFF]/25">
              Start Lesson
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Quick Actions */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Actions
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-3 rounded-xl bg-background p-4 text-left transition-all hover:bg-muted"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEE4E2]">
                <TrendingUp size={16} className="text-[#B42318]" />
              </div>
              <span className="flex-1 text-[15px] text-foreground">Check Loan Costs</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button className="flex items-center gap-3 rounded-xl bg-background p-4 text-left transition-all hover:bg-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Users size={16} className="text-primary" />
              </div>
              <span className="flex-1 text-[15px] text-foreground">Community Tips</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Financial IQ */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Financial IQ</p>
              <p className="mt-1.5 text-3xl font-extrabold text-foreground">72</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#F2F4F7" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#1A6CD8" strokeWidth="3" strokeDasharray="72 28" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">Above average for your age</p>
        </div>
      </div>
    </aside>
  )
}
