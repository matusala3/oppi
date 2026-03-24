"use client"

import { useState } from "react"
import {
  ChevronRight, Bell, Moon, Shield, HelpCircle, LogOut, Star,
  BookOpen, Target, Flame, ExternalLink, Users, Sparkles,
} from "lucide-react"

export function ProfileScreen() {
  const [notificationsOn, setNotificationsOn] = useState(true)

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4 md:gap-6 md:px-8 md:pt-10 lg:px-12 xl:px-16">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 md:gap-4 rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary text-xl md:text-2xl font-bold text-primary-foreground">
          A
        </div>
        <div className="text-center">
          <h1 className="text-[22px] md:text-[28px] font-bold text-foreground">Antti</h1>
          <p className="text-sm md:text-base text-muted-foreground">CS, 2nd year &middot; University of Helsinki</p>
        </div>
        <button className="mt-1 rounded-lg border border-primary bg-accent px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-[15px] font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground">
          Edit Profile
        </button>
      </div>

      {/* Stats row — grid for proper spacing on desktop */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Flame, value: "5", label: "Day Streak", color: "text-[#F79009]", bg: "bg-[#FEF0C7]" },
          { icon: Target, value: "3", label: "Challenges", color: "text-primary", bg: "bg-accent" },
          { icon: BookOpen, value: "2", label: "Lessons", color: "text-[#027A48]", bg: "bg-[#D1FADF]" },
          { icon: Sparkles, value: "130", label: "XP", color: "text-[#F79009]", bg: "bg-[#FEF0C7]" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1 md:gap-2 rounded-xl border border-border bg-card p-3 md:p-5">
            <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon size={14} className={`${stat.color} md:hidden`} />
              <stat.icon size={18} className={`${stat.color} hidden md:block`} />
            </div>
            <span className="text-base md:text-xl font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* IQ + Ranking side by side on desktop */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
        {/* Financial IQ Score */}
        <div className="rounded-xl bg-[#0E3460] p-5 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-[#86B9F7]/50">Financial IQ Score</p>
              <p className="mt-1 text-[36px] md:text-[44px] font-extrabold tracking-tight text-[#FFFFFF]">72</p>
              <p className="text-xs md:text-sm text-[#86B9F7]/60">Above average for your age</p>
            </div>
            <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-16 w-16 md:h-20 md:w-20 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#4490F0" strokeWidth="3" strokeDasharray="72 28" strokeLinecap="round" />
              </svg>
              <Star size={16} className="absolute text-[#4490F0] md:hidden" fill="#4490F0" />
              <Star size={20} className="absolute text-[#4490F0] hidden md:block" fill="#4490F0" />
            </div>
          </div>
          <button className="mt-4 md:mt-5 flex items-center gap-2 rounded-lg bg-[#FFFFFF]/15 px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-[15px] font-semibold text-[#FFFFFF] transition-all hover:bg-[#FFFFFF]/25 active:bg-[#FFFFFF]/25">
            Retake IQ Test <ChevronRight size={14} className="md:hidden" /><ChevronRight size={16} className="hidden md:block" />
          </button>
        </div>

        {/* Peer comparison */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Users size={14} className="text-primary md:hidden" />
            <Users size={18} className="text-primary hidden md:block" />
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Ranking</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-muted-foreground">Among CS students</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">#3 of 47</p>
            </div>
            <div className="text-right">
              <p className="text-sm md:text-base text-muted-foreground">Helsinki area</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">#12 of 156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings — side by side groups on desktop */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
        <div>
          <h2 className="mb-2 md:mb-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-[#F2F4F7] px-4 py-3 md:px-5 md:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-accent">
                  <Bell size={14} className="text-primary md:hidden" />
                  <Bell size={18} className="text-primary hidden md:block" />
                </div>
                <span className="text-sm md:text-[15px] font-medium text-foreground">Notifications</span>
              </div>
              <button
                role="switch"
                aria-checked={notificationsOn}
                onClick={() => setNotificationsOn(!notificationsOn)}
                className={`relative h-6 w-11 md:h-7 md:w-12 rounded-full transition-colors ${notificationsOn ? "bg-primary" : "bg-[#D0D5DD]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 md:h-6 md:w-6 rounded-full bg-[#FFFFFF] shadow-sm transition-transform ${notificationsOn ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <button className="flex w-full items-center justify-between border-b border-[#F2F4F7] px-4 py-3 md:px-5 md:py-4 text-left hover:bg-muted active:bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                  <Moon size={14} className="text-foreground md:hidden" />
                  <Moon size={18} className="text-foreground hidden md:block" />
                </div>
                <span className="text-sm md:text-[15px] font-medium text-foreground">Appearance</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm text-muted-foreground">Light</span>
                <ChevronRight size={14} className="text-muted-foreground md:hidden" />
                <ChevronRight size={16} className="text-muted-foreground hidden md:block" />
              </div>
            </button>
            <button className="flex w-full items-center justify-between px-4 py-3 md:px-5 md:py-4 text-left hover:bg-muted active:bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                  <Shield size={14} className="text-foreground md:hidden" />
                  <Shield size={18} className="text-foreground hidden md:block" />
                </div>
                <span className="text-sm md:text-[15px] font-medium text-foreground">Privacy & Data</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground md:hidden" />
              <ChevronRight size={16} className="text-muted-foreground hidden md:block" />
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-2 md:mb-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <button className="flex w-full items-center justify-between border-b border-[#F2F4F7] px-4 py-3 md:px-5 md:py-4 text-left hover:bg-muted active:bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                  <HelpCircle size={14} className="text-foreground md:hidden" />
                  <HelpCircle size={18} className="text-foreground hidden md:block" />
                </div>
                <span className="text-sm md:text-[15px] font-medium text-foreground">Help & FAQ</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground md:hidden" />
              <ChevronRight size={16} className="text-muted-foreground hidden md:block" />
            </button>
            <button className="flex w-full items-center justify-between px-4 py-3 md:px-5 md:py-4 text-left hover:bg-muted active:bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                  <ExternalLink size={14} className="text-foreground md:hidden" />
                  <ExternalLink size={18} className="text-foreground hidden md:block" />
                </div>
                <span className="text-sm md:text-[15px] font-medium text-foreground">Debt Help Resources</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground md:hidden" />
              <ChevronRight size={16} className="text-muted-foreground hidden md:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="flex items-center justify-center gap-2 rounded-xl border border-[#FEE4E2] bg-[#FEE4E2]/10 py-3 md:py-3.5 text-sm md:text-[15px] font-semibold text-[#B42318] transition-all hover:bg-[#FEE4E2]/30 active:bg-[#FEE4E2]/30 md:max-w-xs">
        <LogOut size={16} className="md:hidden" /><LogOut size={18} className="hidden md:block" />
        Log Out
      </button>

      <div className="pb-2 text-center">
        <p className="text-[11px] md:text-xs text-muted-foreground">Oppi v1.0.0 &middot; Made in Finland</p>
      </div>
    </div>
  )
}
