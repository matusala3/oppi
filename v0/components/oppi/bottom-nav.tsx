"use client"

import { Home, Bell, Target, User } from "lucide-react"

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "spending", label: "Activity", icon: Bell },
  { id: "goals", label: "Grow", icon: Target },
  { id: "profile", label: "Profile", icon: User },
] as const

export type TabId = (typeof tabs)[number]["id"]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#E4E7EC] bg-card/95 backdrop-blur-sm md:hidden"
      style={{ height: 56, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-150"
            style={{ minHeight: 56 }}
          >
            <div className="relative">
              <tab.icon
                size={24}
                className={isActive ? "text-primary" : "text-muted-foreground"}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {tab.id === "spending" && (
                <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F04438] text-[8px] font-bold text-[#FFFFFF]">
                  3
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
