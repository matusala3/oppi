"use client"

import { Home, Bell, Target, Calculator, User, BookOpen } from "lucide-react"

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "spending", label: "Activity", icon: Bell },
  { id: "goals", label: "Grow", icon: Target },
  { id: "profile", label: "Profile", icon: User },
] as const

export type TabId = (typeof navItems)[number]["id"]

interface SideNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onOpenSimulator: () => void
}

export function SideNav({ activeTab, onTabChange, onOpenSimulator }: SideNavProps) {
  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 border-r border-border bg-card h-dvh sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-7 pt-8 pb-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <span className="text-base font-extrabold tracking-tight text-primary-foreground">Op</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">Oppi</span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1.5 px-4" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-all ${
                isActive
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="text-[15px]">{item.label}</span>
              {item.id === "spending" && (
                <span className="ml-auto flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#F04438] text-[11px] font-bold text-[#FFFFFF]">
                  3
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Separator */}
      <div className="mx-7 my-5 h-px bg-border" />

      {/* Tools */}
      <div className="flex flex-col gap-1.5 px-4">
        <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tools</p>
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <Calculator size={22} strokeWidth={1.7} />
          <span className="text-[15px]">Loan Calculator</span>
        </button>
        <button className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
          <BookOpen size={22} strokeWidth={1.7} />
          <span className="text-[15px]">Lessons</span>
        </button>
      </div>

      {/* Bottom profile card */}
      <div className="mt-auto px-4 pb-6">
        <button
          onClick={() => onTabChange("profile")}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:bg-muted"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground truncate">Antti</p>
            <p className="text-xs text-muted-foreground truncate">CS, University of Helsinki</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
