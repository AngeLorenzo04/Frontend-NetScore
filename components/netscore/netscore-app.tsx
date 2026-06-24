'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TopBar } from './top-bar'
import { BottomNav, type TabId, TABS } from './bottom-nav'
import { MatchesView } from './matches-view'
import { LeaderboardView } from './leaderboard-view'
import { ProfileView, type League } from './profile-view'
import { AuthFormView } from './auth-form-view'
import { Toast } from './toast'
import { cn } from '@/lib/utils'

interface UserProfile {
  name: string
  email: string
  avatar: string
  points: number
  leagues: League[]
}

const DEFAULT_LEAGUES: League[] = [
  { id: 'l1', name: 'Global Fans League', code: 'GLOBAL26', membersCount: 12450, rank: 342, createdBy: 'NetScore' },
  { id: 'l2', name: 'Family & Friends', code: 'FAM2026', membersCount: 8, rank: 2, createdBy: 'Kai R.' }
]

export function NetScoreApp() {
  const [tab, setTab] = useState<TabId>('matches')
  const [toast, setToast] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  // Load user session on mount
  useEffect(() => {
    const saved = localStorage.getItem('netscore_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading session:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save session when updated
  const saveUser = useCallback((newUser: UserProfile | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('netscore_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('netscore_user')
    }
  }, [])

  const handleJoinLeague = useCallback((code: string) => {
    if (!user) return 'Not authenticated'
    const cleanCode = code.trim().toUpperCase()

    if (user.leagues.some((l) => l.code === cleanCode)) {
      return 'You are already a member of this league'
    }

    // Mock league database resolution
    let name = `League ${cleanCode}`
    if (cleanCode === 'COPA26') name = 'Copa de Amigos'
    if (cleanCode === 'MILAN26') name = 'Rossoneri Predictors'
    if (cleanCode === 'FANS2026') name = 'World Cup 26 Fans'

    const newLeague: League = {
      id: `l_${Date.now()}`,
      name,
      code: cleanCode,
      membersCount: Math.floor(Math.random() * 45) + 6,
      rank: Math.floor(Math.random() * 6) + 2,
      createdBy: 'Other player',
    }

    const updated = {
      ...user,
      leagues: [...user.leagues, newLeague],
    }
    saveUser(updated)
    showToast(`Joined league: ${name}`)
    return null
  }, [user, saveUser, showToast])

  const handleCreateLeague = useCallback((name: string) => {
    if (!user) return
    const randomCode = 'NET-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    const newLeague: League = {
      id: `l_${Date.now()}`,
      name,
      code: randomCode,
      membersCount: 1,
      rank: 1,
      createdBy: 'You',
    }

    const updated = {
      ...user,
      leagues: [...user.leagues, newLeague],
    }
    saveUser(updated)
    showToast(`Created league: ${name}`)
  }, [user, saveUser, showToast])

  const handleLogout = useCallback(() => {
    saveUser(null)
    showToast('Logged out successfully')
  }, [saveUser, showToast])

  // Mock submitPrediction: simulates an API call with a loading delay.
  const submitPrediction = useCallback(
    async (matchId: string, home: number, away: number) => {
      // TODO: Connect to backend API (POST /api/predictions)
      await new Promise((resolve) => setTimeout(resolve, 1300))
      showToast(`Prediction locked in: ${home} – ${away}`)
    },
    [showToast],
  )

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.86_0.24_145_/_0.3)]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <AuthFormView
          onLogin={(name, email) => {
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'US'
            saveUser({
              name,
              email,
              avatar: initials,
              points: 1320,
              leagues: DEFAULT_LEAGUES,
            })
            setTab('matches')
            showToast(`Welcome back, ${name}!`)
          }}
        />
        <Toast message={toast} />
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-dvh flex-col bg-background md:flex-row">
      <nav className="hidden w-64 border-r border-border p-4 md:block bg-card/40 backdrop-blur-md">
        <h2 className="text-xl font-black tracking-wider text-foreground px-3 mb-6">
          NetScore<span className="text-primary font-extrabold">26</span>
        </h2>
        <ul className="space-y-2">
          {TABS.map((tabItem) => (
            <li key={tabItem.id}>
              <button
                type="button"
                onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-3.5 text-left text-sm font-bold transition-colors',
                  tab === tabItem.id
                    ? 'bg-primary text-primary-foreground shadow-[0_0_14px_oklch(0.86_0.24_145_/_0.4)]'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
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
        <TopBar avatar={user.avatar} />

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
              {tab === 'profile' && (
                <ProfileView
                  user={user}
                  onLogout={handleLogout}
                  onJoinLeague={handleJoinLeague}
                  onCreateLeague={handleCreateLeague}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Toast message={toast} />
        <BottomNav active={tab} onChange={setTab} className="md:hidden" />
      </div>
    </div>
  )
}
