"use client"

import { useState } from "react"
import {
  Flame, Trophy, Shield, Check, Lock, ChevronRight, BookOpen,
  Users, Sparkles, Target, Plus,
} from "lucide-react"

type Tab = "challenges" | "learning" | "community"

const CHALLENGES = [
  { title: "Track Everything", desc: "Log every expense for 3 days straight", progress: 2, total: 3, icon: Flame, iconBg: "bg-[#FEF0C7]", iconColor: "text-[#F79009]", status: "active" as const, participants: 3412 },
  { title: "No-Spend Day", desc: "Go 24 hours without spending", progress: 0, total: 1, icon: Shield, iconBg: "bg-accent", iconColor: "text-primary", status: "upcoming" as const, participants: 1879 },
  { title: "Coffee at Home", desc: "Make coffee at home for 5 days", progress: 5, total: 5, icon: Trophy, iconBg: "bg-[#D1FADF]", iconColor: "text-[#027A48]", status: "completed" as const, participants: 2145 },
  { title: "Meal Prep Week", desc: "Cook all meals at home for 7 days", progress: 0, total: 7, icon: Target, iconBg: "bg-[#FEE4E2]", iconColor: "text-[#B42318]", status: "locked" as const, participants: 956 },
]

const LESSONS = [
  { title: "The Instant Loan Trap", duration: "3 min", status: "new" as const, xp: 50 },
  { title: "Understanding Kela Loans", duration: "4 min", status: "completed" as const, xp: 50 },
  { title: "Needs vs. Wants", duration: "2 min", status: "completed" as const, xp: 30 },
  { title: "Credit Card Basics", duration: "3 min", status: "locked" as const, xp: 50 },
  { title: "Building Emergency Funds", duration: "3 min", status: "locked" as const, xp: 50 },
]

const LEADERBOARD = [
  { name: "Mikael", avatar: "M", school: "Tampere U", streak: 14, level: 8 },
  { name: "Jenna", avatar: "J", school: "Aalto", streak: 12, level: 7 },
  { name: "Antti (You)", avatar: "A", school: "Helsinki", streak: 5, level: 3, isYou: true },
  { name: "Laura", avatar: "L", school: "Turku U", streak: 4, level: 3 },
  { name: "Petri", avatar: "P", school: "Oulu U", streak: 3, level: 2 },
]

const COMMUNITY_TIPS = [
  { user: "Mikael", tip: "I cut subscriptions and meal prepped. Saved \u20AC180/month.", likes: 47 },
  { user: "Jenna", tip: "Freelancing on weekends = \u20AC400 extra/month. Worth it.", likes: 32 },
  { user: "Laura", tip: "The 50/30/20 rule changed everything for me.", likes: 28 },
]

export function GoalsScreen() {
  const [tab, setTab] = useState<Tab>("challenges")

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4 md:gap-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold text-foreground">Grow</h1>
        <p className="text-sm md:text-base text-muted-foreground">Challenges, lessons, and community</p>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-xl bg-muted p-1 md:max-w-md">
        {([
          { id: "challenges", label: "Challenges" },
          { id: "learning", label: "Learn" },
          { id: "community", label: "Community" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2.5 md:py-3 text-sm md:text-[15px] font-semibold transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Challenges Tab ─── */}
      {tab === "challenges" && (
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Streak banner */}
          <div className="flex items-center gap-3 md:gap-4 rounded-xl bg-[#FEF0C7] p-4 md:p-5">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#F79009]">
              <Flame size={20} className="text-[#FEF0C7] md:hidden" />
              <Flame size={24} className="text-[#FEF0C7] hidden md:block" />
            </div>
            <div className="flex-1">
              <p className="text-base md:text-lg font-bold text-[#7A2E0E]">5 Day Streak</p>
              <p className="text-xs md:text-sm text-[#7A2E0E]/70">2 more days for the 7-day badge!</p>
            </div>
          </div>

          {/* Challenge cards — grid on desktop */}
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {CHALLENGES.map((ch, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 md:p-5 transition-all hover:shadow-sm ${
                  ch.status === "completed" ? "border-[#D1FADF] bg-[#D1FADF]/10" :
                  ch.status === "locked" ? "border-border bg-card opacity-60" :
                  "border-border bg-card"
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg ${ch.iconBg}`}>
                    {ch.status === "locked"
                      ? <><Lock size={18} className="text-muted-foreground md:hidden" /><Lock size={22} className="text-muted-foreground hidden md:block" /></>
                      : <><ch.icon size={18} className={`${ch.iconColor} md:hidden`} /><ch.icon size={22} className={`${ch.iconColor} hidden md:block`} /></>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] md:text-base font-semibold text-foreground">{ch.title}</h3>
                      {ch.status === "completed" && (
                        <span className="flex items-center gap-1 rounded-full bg-[#D1FADF] px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-[#027A48]">
                          <Check size={10} /> Done
                        </span>
                      )}
                      {ch.status === "active" && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-primary">Active</span>
                      )}
                      {ch.status === "upcoming" && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-muted-foreground">Next</span>
                      )}
                      {ch.status === "locked" && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-muted-foreground">Locked</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">{ch.desc}</p>
                    {ch.status !== "locked" && (
                      <div className="mt-2.5 md:mt-3">
                        <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all ${ch.status === "completed" ? "bg-[#12B76A]" : "bg-primary"}`}
                            style={{ width: `${(ch.progress / ch.total) * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 md:mt-1.5 flex justify-between text-[11px] md:text-xs text-muted-foreground">
                          <span>{ch.progress}/{ch.total} days</span>
                          <span>{ch.participants.toLocaleString()} students</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">Achievements</h2>
            <div className="mt-3 flex gap-2.5 md:gap-3 overflow-x-auto pb-1 md:flex-wrap" style={{ scrollbarWidth: "none" }}>
              {[
                { label: "First Log", earned: true },
                { label: "3-Day Streak", earned: true },
                { label: "Coffee Saver", earned: true },
                { label: "Budget Pro", earned: false },
                { label: "Debt Free", earned: false },
              ].map((badge, i) => (
                <div
                  key={i}
                  className={`flex shrink-0 flex-col items-center gap-1.5 md:gap-2 rounded-xl border p-3 md:p-4 ${
                    badge.earned ? "border-[#D1FADF] bg-[#D1FADF]/10" : "border-border bg-card opacity-50"
                  }`}
                  style={{ width: 90 }}
                >
                  <div className={`flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full ${badge.earned ? "bg-[#12B76A]" : "bg-secondary"}`}>
                    {badge.earned
                      ? <><Trophy size={16} className="text-[#D1FADF] md:hidden" /><Trophy size={20} className="text-[#D1FADF] hidden md:block" /></>
                      : <><Lock size={16} className="text-muted-foreground md:hidden" /><Lock size={20} className="text-muted-foreground hidden md:block" /></>
                    }
                  </div>
                  <span className="text-center text-[10px] md:text-xs font-medium text-foreground leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Learning Tab ─── */}
      {tab === "learning" && (
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Progress */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base text-muted-foreground">Modules completed</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">2 / 5</p>
              </div>
              <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-[3px] border-primary">
                <span className="text-base md:text-lg font-bold text-primary">40%</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex items-center gap-2">
              <Sparkles size={14} className="text-[#F79009] md:hidden" />
              <Sparkles size={16} className="text-[#F79009] hidden md:block" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">130 XP earned</span>
            </div>
          </div>

          {/* Lessons — grid on desktop */}
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {LESSONS.map((lesson, i) => (
              <button
                key={i}
                disabled={lesson.status === "locked"}
                className={`flex items-center gap-3 md:gap-4 rounded-xl border p-4 md:p-5 text-left transition-all ${
                  lesson.status === "locked" ? "border-border bg-card opacity-50" :
                  lesson.status === "completed" ? "border-[#D1FADF] bg-[#D1FADF]/5 hover:bg-[#D1FADF]/10 active:bg-[#D1FADF]/10" :
                  "border-border bg-card hover:bg-muted active:bg-muted"
                }`}
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-muted">
                  <BookOpen size={18} className={`${lesson.status === "new" ? "text-primary" : "text-muted-foreground"} md:hidden`} />
                  <BookOpen size={22} className={`${lesson.status === "new" ? "text-primary" : "text-muted-foreground"} hidden md:block`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] md:text-base font-semibold text-foreground">{lesson.title}</h3>
                    {lesson.status === "new" && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-primary">New</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">{lesson.duration} read  {"\u00B7"}  {lesson.xp} XP</p>
                </div>
                {lesson.status === "completed" ? (
                  <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-[#12B76A]">
                    <Check size={14} className="text-[#D1FADF]" />
                  </div>
                ) : lesson.status === "locked" ? (
                  <Lock size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Community Tab ─── */}
      {tab === "community" && (
        <div className="flex flex-col gap-5 md:gap-6">
          {/* Leaderboard */}
          <div>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">Leaderboard</p>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {LEADERBOARD.map((user, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 md:gap-4 px-4 py-3 md:px-5 md:py-4 ${i < LEADERBOARD.length - 1 ? "border-b border-[#F2F4F7]" : ""} ${user.isYou ? "bg-accent" : ""}`}
                >
                  <span className="w-5 md:w-6 text-sm md:text-base font-bold text-muted-foreground">#{i + 1}</span>
                  <div className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-bold ${user.isYou ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-[15px] font-semibold text-foreground">{user.name}</p>
                    <p className="text-[11px] md:text-xs text-muted-foreground">{user.school}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm md:text-[15px] font-bold text-foreground">{user.streak}d</p>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground">Lvl {user.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Tips — grid on desktop */}
          <div>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">Student Tips</p>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4">
              {COMMUNITY_TIPS.map((tip, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 md:p-5 transition-all hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-xs md:text-sm font-bold text-foreground">
                      {tip.user[0]}
                    </div>
                    <span className="text-sm md:text-[15px] font-semibold text-foreground">{tip.user}</span>
                  </div>
                  <p className="mt-2 md:mt-3 text-sm md:text-[15px] leading-relaxed text-secondary-foreground">
                    {"\u201C"}{tip.tip}{"\u201D"}
                  </p>
                  <div className="mt-2 md:mt-3 flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                    <Users size={12} className="md:hidden" /><Users size={14} className="hidden md:block" />
                    <span>{tip.likes} students found this helpful</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card py-4 md:py-5 text-sm md:text-[15px] font-semibold text-muted-foreground transition-all hover:border-primary hover:text-primary active:border-primary active:text-primary">
            <Plus size={18} className="md:hidden" /><Plus size={20} className="hidden md:block" />
            Share Your Tip
          </button>
        </div>
      )}
    </div>
  )
}
