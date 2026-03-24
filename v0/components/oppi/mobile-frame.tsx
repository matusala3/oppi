"use client"

import { useState } from "react"
import { BottomNav } from "./bottom-nav"
import { SideNav } from "./side-nav"
import { ContextPanel } from "./context-panel"
import { HomeScreen } from "./screens/home-screen"
import { SpendingScreen } from "./screens/spending-screen"
import { GoalsScreen } from "./screens/goals-screen"
import { ProfileScreen } from "./screens/profile-screen"
import { OnboardingFlow } from "./screens/onboarding-flow"
import { SimulatorScreen } from "./screens/simulator-screen"
import type { TabId } from "./side-nav"

export function MobileFrame() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showSimulator, setShowSimulator] = useState(false)

  /* ─── Onboarding: manages its own responsive layout ─── */
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
  }

  /* ─── Simulator: full-screen on mobile, full content area on desktop ─── */
  if (showSimulator) {
    return (
      <div className="flex min-h-dvh bg-background">
        <SideNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setShowSimulator(false)
            setActiveTab(tab)
          }}
          onOpenSimulator={() => {}}
        />
        <div className="flex flex-1 flex-col">
          <SimulatorScreen onBack={() => setShowSimulator(false)} />
        </div>
      </div>
    )
  }

  /* ─── Main App: responsive layout ─── */
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Left: Side navigation (hidden on mobile, shown md+) */}
      <SideNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSimulator={() => setShowSimulator(true)}
      />

      {/* Center: Main content area — full width, no max-w cap */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {activeTab === "home" && (
          <HomeScreen onOpenSimulator={() => setShowSimulator(true)} />
        )}
        {activeTab === "spending" && <SpendingScreen />}
        {activeTab === "goals" && <GoalsScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      {/* Right: Context panel (hidden until lg+) */}
      <ContextPanel
        activeTab={activeTab}
        onOpenSimulator={() => setShowSimulator(true)}
      />

      {/* Bottom nav (mobile only) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}
