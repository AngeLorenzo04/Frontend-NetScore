'use client'

import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TopBar } from './top-bar'
import { BottomNav, type TabId, TABS } from './bottom-nav'
import { MatchesView } from './matches-view'
import { LeaderboardView } from './leaderboard-view'
import { ProfileView } from './profile-view'
import { Toast } from './toast'

export function NetScoreApp() {
  const [tab, setTab] = useState<TabId>('matches')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  // Mock submitPrediction: simulates an API call with a loading delay.
  const submitPrediction = useCallback(
    async (matchId: string, home: number, away: number) => {
      // TODO: Connect to backend API (POST /api/predictions)
      await new Promise((resolve) => setTimeout(resolve, 1300))
      showToast(`Prediction locked in: ${home} – ${away}`)
    },
    [showToast],
  )

  return (
    <div className="relative mx-auto flex min-h-dvh flex-col bg-background md:flex-row">
      <nav className="hidden w-64 border-r border-border p-4 md:block">
        {/* Desktop Navigation Placeholder */}
        <h2 className="text-xl font-bold">NetScore</h2>
        <ul className="mt-4 space-y-2">
          {TABS.map((tabItem) => (
            <li key={tabItem.id}>
              <button
                type="button"
                onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                  tab === tabItem.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <tabItem.icon className="size-5" />
                {tabItem.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-1 flex-col">
        <TopBar avatar="YOU" />

        <main className="no-scrollbar flex-1 overflow-y-auto pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'matches' && (
              <MatchesView onSubmitPrediction={submitPrediction} />
            )}
            {tab === 'leaderboard' && <LeaderboardView />}
            {tab === 'profile' && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toast message={toast} />
      <BottomNav active={tab} onChange={setTab} className="md:hidden" />
    </div>
  )
}
