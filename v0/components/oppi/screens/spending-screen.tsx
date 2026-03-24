"use client"

import { useState } from "react"
import {
  Bell,
  Wallet,
  Target,
  Users,
  Flame,
  ChevronRight,
  BookOpen,
  Check,
} from "lucide-react"

type NotifType = "nudge" | "alert" | "milestone" | "social"

interface Notification {
  id: number
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  icon: React.ElementType
  iconBg: string
  iconColor: string
  action?: string
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1, type: "alert", title: "Weekly Budget Exceeded",
    body: "You've spent \u20AC287 of your \u20AC200 weekly budget. That's \u20AC87 over.",
    time: "2h ago", read: false, icon: Wallet, iconBg: "bg-[#FEE4E2]", iconColor: "text-[#B42318]", action: "See Breakdown",
  },
  {
    id: 2, type: "nudge", title: "Friday Night Heads-Up",
    body: "Last 3 Fridays, you averaged \u20AC45 going out. Budget only \u20AC15 left for this week.",
    time: "5h ago", read: false, icon: Bell, iconBg: "bg-[#FEF0C7]", iconColor: "text-[#F79009]", action: "Set Spending Limit",
  },
  {
    id: 3, type: "social", title: "Mikael Completed No-Spend Day",
    body: "Your friend Mikael just finished the No-Spend Day challenge. Join in?",
    time: "Yesterday", read: false, icon: Users, iconBg: "bg-accent", iconColor: "text-primary", action: "Start Challenge",
  },
  {
    id: 4, type: "milestone", title: "5-Day Streak!",
    body: "You've logged expenses for 5 days straight. Keep it up to earn the 7-day badge.",
    time: "Yesterday", read: true, icon: Flame, iconBg: "bg-[#FEF0C7]", iconColor: "text-[#F79009]",
  },
  {
    id: 5, type: "nudge", title: "New Lesson Available",
    body: "\"The Instant Loan Trap\" \u2014 learn how 200-1000% APR actually works.",
    time: "2 days ago", read: true, icon: BookOpen, iconBg: "bg-[#D1FADF]", iconColor: "text-[#027A48]", action: "Start Lesson",
  },
  {
    id: 6, type: "milestone", title: "Debt Goal: 5% Complete",
    body: "You've paid \u20AC390 toward your \u20AC7,800 goal. On track for 2028!",
    time: "3 days ago", read: true, icon: Target, iconBg: "bg-accent", iconColor: "text-primary",
  },
]

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "nudge", label: "Nudges" },
  { id: "alert", label: "Alerts" },
  { id: "social", label: "Social" },
]

export function SpendingScreen() {
  const [filter, setFilter] = useState("all")
  const [readIds, setReadIds] = useState<number[]>([])

  const filtered = filter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.type === filter)
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read && !readIds.includes(n.id)).length

  const markRead = (id: number) => {
    if (!readIds.includes(id)) setReadIds([...readIds, id])
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4 md:gap-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold text-foreground">Activity</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} new notifications` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => setReadIds(NOTIFICATIONS.map((n) => n.id))}
            className="text-sm md:text-[15px] font-medium text-primary hover:text-[#0E3460] active:text-[#0E3460]"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:flex-wrap md:gap-3" style={{ scrollbarWidth: "none" }}>
        {FILTER_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 md:px-4 md:py-2 text-[13px] md:text-sm font-medium transition-all ${
              filter === t.id
                ? "border-primary bg-accent text-primary"
                : "border-border bg-card text-foreground hover:bg-muted active:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notification cards — grid on desktop */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {filtered.map((notif) => {
          const isUnread = !notif.read && !readIds.includes(notif.id)
          const Icon = notif.icon
          return (
            <button
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`flex items-start gap-3 md:gap-4 rounded-xl border p-4 md:p-5 text-left transition-all hover:bg-muted active:bg-muted ${
                isUnread ? "border-primary/30 bg-accent hover:bg-accent/70" : "border-border bg-card"
              }`}
            >
              <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg ${notif.iconBg}`}>
                <Icon size={18} className={`${notif.iconColor} md:hidden`} />
                <Icon size={22} className={`${notif.iconColor} hidden md:block`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-[15px] md:text-base font-semibold text-foreground">{notif.title}</p>
                  {isUnread && <span className="h-2 w-2 md:h-2.5 md:w-2.5 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm md:text-[15px] leading-relaxed text-muted-foreground">{notif.body}</p>
                <div className="mt-2 md:mt-3 flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">{notif.time}</span>
                  {notif.action && (
                    <span className="flex items-center gap-1 text-xs md:text-sm font-semibold text-primary">
                      {notif.action} <ChevronRight size={12} className="md:hidden" /><ChevronRight size={14} className="hidden md:block" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Weekly digest card */}
      <div className="rounded-xl bg-[#0E3460] p-5 md:p-7">
        <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-[#86B9F7]/60">Weekly Digest</p>
        <h3 className="mt-1 text-lg md:text-xl font-bold text-[#FFFFFF]">Last Week Summary</h3>
        <div className="mt-3 md:mt-4 flex gap-6 md:gap-10">
          <div>
            <p className="text-xs md:text-sm text-[#86B9F7]/70">Spent</p>
            <p className="text-lg md:text-xl font-bold text-[#FFFFFF]">{"\u20AC287"}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#86B9F7]/70">Saved</p>
            <p className="text-lg md:text-xl font-bold text-[#12B76A]">{"\u20AC51"}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#86B9F7]/70">Streak</p>
            <p className="text-lg md:text-xl font-bold text-[#F79009]">5 days</p>
          </div>
        </div>
        <div className="mt-3 md:mt-4 flex items-center gap-2">
          <Check size={14} className="text-[#12B76A] md:hidden" />
          <Check size={16} className="text-[#12B76A] hidden md:block" />
          <span className="text-sm md:text-[15px] text-[#86B9F7]/80">You logged 23 of 25 expenses</span>
        </div>
      </div>
    </div>
  )
}
