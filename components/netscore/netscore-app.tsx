'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TopBar } from './top-bar'
import { BottomNav, type TabId, TABS } from './bottom-nav'
import { MatchesView } from './matches-view'
import { LeaguesView } from './leagues-view'
import { ProfileView, type League } from './profile-view'
import { AuthFormView } from './auth-form-view'
import { Homepage } from './homepage'
import { Toast } from './toast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  avatarUrl?: string
  points: number
  leagues: League[]
  token: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function NetScoreApp() {
  const [tab, setTab] = useState<TabId>('matches')
  const [toast, setToast] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [inPlatform, setInPlatform] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
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

  // Fetch updated user profile and leagues list
  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        const initials =
          data.nickname
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'US'

        const mappedLeagues: League[] = (data.leagues || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          code: l.code,
          membersCount: l.memberCount ?? 1,
          rank: l.rank ?? 1,
          createdBy: l.creatorId === data.id ? 'You' : 'Other player',
        }))

        const profile: UserProfile = {
          id: data.id,
          name: data.nickname,
          email: data.email,
          avatar: initials,
          avatarUrl: data.avatarUrl,
          points: data.totalPoints ?? 0,
          leagues: mappedLeagues,
          token,
        }
        setUser(profile)
        localStorage.setItem('netscore_user', JSON.stringify(profile))
      }
    } catch (e) {
      console.error('Error fetching user profile:', e)
    }
  }, [])

  // Load user session on mount
  useEffect(() => {
    const saved = localStorage.getItem('netscore_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        if (parsed.token) {
          fetchProfile(parsed.token)
        }
      } catch (e) {
        console.error('Error loading session:', e)
      }
    }
    setIsLoaded(true)
  }, [fetchProfile])

  const handleJoinLeague = useCallback(
    async (code: string): Promise<string | null> => {
      if (!user || !user.token) return 'Non autenticato'
      const cleanCode = code.trim().toUpperCase()

      if (user.leagues.some((l) => l.code === cleanCode)) {
        return 'Fai già parte di questa lega'
      }

      try {
        const res = await fetch(`${API_URL}/api/leagues/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ code: cleanCode }),
        })

        const data = await res.json()
        if (!res.ok) {
          return data.error || 'Impossibile unirsi alla lega'
        }

        await fetchProfile(user.token)
        showToast(`Unito alla lega: ${data.name || cleanCode}`)
        return null
      } catch (err) {
        console.error(err)
        return 'Errore di connessione'
      }
    },
    [user, fetchProfile, showToast],
  )

  const handleCreateLeague = useCallback(
    async (name: string): Promise<string | null> => {
      if (!user || !user.token) return 'Non autenticato'

      try {
        const res = await fetch(`${API_URL}/api/leagues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ name }),
        })

        const data = await res.json()
        if (!res.ok) {
          return data.error || 'Impossibile creare la lega'
        }

        await fetchProfile(user.token)
        showToast(`Lega creata: ${name}`)
        return null
      } catch (err) {
        console.error(err)
        return 'Errore di connessione'
      }
    },
    [user, fetchProfile, showToast],
  )

  const handleUpdateProfile = useCallback(
    async (nickname: string, email: string, password?: string, avatarUrl?: string): Promise<string | null> => {
      if (!user || !user.token) return 'Non autenticato'

      try {
        const body: any = { nickname, email }
        if (password) {
          body.password = password
        }
        if (avatarUrl !== undefined) {
          body.avatarUrl = avatarUrl
        }

        const res = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(body),
        })

        const data = await res.json()
        if (!res.ok) {
          return data.error || 'Impossibile aggiornare il profilo'
        }

        await fetchProfile(user.token)
        showToast('Profilo aggiornato con successo')
        return null
      } catch (err) {
        console.error(err)
        return 'Errore di connessione'
      }
    },
    [user, fetchProfile, showToast],
  )

  const handleLogout = useCallback(() => {
    saveUser(null)
    setInPlatform(false)
    showToast('Logged out successfully')
  }, [saveUser, showToast])

  const submitPrediction = useCallback(
    async (matchId: string, home: number, away: number, leagueId?: string) => {
      if (!user || !user.token) return

      try {
        const res = await fetch(`${API_URL}/api/predictions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            matchId,
            predictedHome: home,
            predictedAway: away,
            leagueId,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          showToast(data.error || 'Errore nel salvataggio della predizione')
          throw new Error(data.error || 'Prediction failed')
        }

        showToast(`Predizione salvata: ${home} – ${away}`)
        await fetchProfile(user.token)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    [user, fetchProfile, showToast],
  )

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)]" />
      </div>
    )
  }

  if (!inPlatform || !user) {
    return (
      <>
        <Homepage
          user={user}
          onEnter={() => setInPlatform(true)}
          onShowLogin={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 15 }}
                className="relative w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-2xl backdrop-blur-md overflow-hidden"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors z-50"
                >
                  <X className="size-4" />
                </button>

                <AuthFormView
                  onLogin={(backendUser, token) => {
                    const initials =
                      backendUser.nickname
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'US'

                    const mappedLeagues: League[] = (backendUser.leagues || []).map((l: any) => ({
                      id: l.id,
                      name: l.name,
                      code: l.code,
                      membersCount: l.memberCount ?? 1,
                      rank: l.rank ?? 1,
                      createdBy: l.creatorId === backendUser.id ? 'You' : 'Other player',
                    }))

                    const profile: UserProfile = {
                      id: backendUser.id,
                      name: backendUser.nickname,
                      email: backendUser.email,
                      avatar: initials,
                      avatarUrl: backendUser.avatarUrl,
                      points: backendUser.totalPoints ?? 0,
                      leagues: mappedLeagues,
                      token,
                    }
                    saveUser(profile)
                    setInPlatform(true)
                    setShowAuthModal(false)
                    setTab('matches')
                    showToast(`Benvenuto, ${backendUser.nickname}!`)
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Toast message={toast} />
      </>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-dvh flex-col bg-background md:flex-row">
      <nav className="hidden w-64 border-r border-border p-4 md:block bg-card/40 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setInPlatform(false)}
          className="text-xl font-black tracking-wider text-foreground px-3 mb-6 text-left hover:opacity-85 transition-opacity"
        >
          NetScore<span className="text-primary font-extrabold">26</span>
        </button>
        <ul className="space-y-2">
          {TABS.map((tabItem) => (
            <li key={tabItem.id}>
              <button
                type="button"
                onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-3.5 text-left text-sm font-bold transition-colors',
                  tab === tabItem.id
                    ? 'bg-primary text-primary-foreground shadow-[0_0_14px_oklch(0.58_0.23_250_/_0.4)]'
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
        <TopBar avatar={user.avatarUrl || user.avatar} />

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
                <MatchesView user={user} onSubmitPrediction={submitPrediction} />
              )}
              {tab === 'leagues' && (
                <LeaguesView
                  user={user}
                  onSubmitPrediction={submitPrediction}
                  onJoinLeague={handleJoinLeague}
                  onCreateLeague={handleCreateLeague}
                />
              )}
              {tab === 'profile' && (
                <ProfileView
                  user={user}
                  onLogout={handleLogout}
                  onJoinLeague={handleJoinLeague}
                  onCreateLeague={handleCreateLeague}
                  onUpdateProfile={handleUpdateProfile}
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
