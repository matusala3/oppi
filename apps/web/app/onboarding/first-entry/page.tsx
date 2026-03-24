'use client'

// TODO: Add auth guard — redirect to /login if no valid session token exists

import { useRouter } from 'next/navigation'
import { Upload, Tag, LayoutDashboard } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { FirstEntryStep } from '@/components/onboarding/steps/FirstEntryStep'
import type { FirstEntryData } from '@/components/onboarding/steps/FirstEntryStep'

const FEATURES = [
  { Icon: Upload,          text: 'Import from OP, Nordea, S-Pankki, or Danske' },
  { Icon: Tag,             text: 'Transactions auto-categorised on import' },
  { Icon: LayoutDashboard, text: 'See your dashboard come alive instantly' },
]

export default function FirstEntryPage() {
  const router = useRouter()

  function handleComplete(data: FirstEntryData) {
    // TODO: POST /api/transactions with data.transactions
    console.log('First entry data:', data)
    router.push('/dashboard')
  }

  return (
    <AuthShell
      brandTitle={'Your First\nEntries'}
      brandSubtitle="Add spending manually or import from your bank to see your dashboard come alive."
      features={FEATURES}
    >
      <FirstEntryStep onNext={handleComplete} />
    </AuthShell>
  )
}
