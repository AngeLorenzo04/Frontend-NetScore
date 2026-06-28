'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, Users, Award, ArrowLeft, Key, Plus, Copy, Check, AlertCircle, Sparkles, ChevronRight, CalendarDays, X, Maximize2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { League } from './profile-view'
import { LEADERBOARD, UPCOMING_MATCHES, type Match, mapBackendMatch } from './data'
import { MatchCard } from './match-card'
import { io } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface LeaguesViewProps {
  user: {
    id: string
    name: string
    email: string
    avatar: string
    points: number
    leagues: League[]
    token: string
  }
  onSubmitPrediction: (matchId: string, home: number, away: number, leagueId?: string) => Promise<void>
  onJoinLeague: (code: string) => Promise<string | null>
  onCreateLeague: (name: string) => Promise<string | null>
  onDeleteLeague?: (leagueId: string) => Promise<string | null>
}

export function LeaguesView({
  user,
  onSubmitPrediction,
  onJoinLeague,
  onCreateLeague,
  onDeleteLeague,
}: LeaguesViewProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [leagueSubTab, setLeagueSubTab] = useState<'classifica' | 'predizioni'>('classifica')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [newLeagueName, setNewLeagueName] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [confirmDeleteLeagueId, setConfirmDeleteLeagueId] = useState<string | null>(null)

  // Other user profile modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null)
  const [userProfileLoading, setUserProfileLoading] = useState(false)
  const [zoomOtherAvatar, setZoomOtherAvatar] = useState(false)

  // Fetch selected user's profile details
  useEffect(() => {
    if (!selectedUserId || !user.token) {
      setSelectedUserProfile(null)
      return
    }

    let active = true
    setUserProfileLoading(true)
    fetch(`${API_URL}/api/users/profile/${selectedUserId}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          if (data && !data.error) {
            setSelectedUserProfile(data)
          } else {
            console.error('Error fetching user profile:', data.error)
          }
        }
      })
      .catch((err) => console.error('Error fetching user profile:', err))
      .finally(() => {
        if (active) setUserProfileLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedUserId, user.token])

  // Real-time states
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leagueMatches, setLeagueMatches] = useState<Match[]>([])
  const [matchesLoading, setMatchesLoading] = useState(false)

  // Find the currently selected league
  const selectedLeague = useMemo(() => {
    return user.leagues.find((l) => l.id === selectedLeagueId) || null
  }, [user.leagues, selectedLeagueId])

  // Fetch leaderboard data when selected league changes
  useEffect(() => {
    if (!selectedLeagueId || !user.token) {
      setLeaderboard([])
      return
    }

    let active = true
    setLeaderboardLoading(true)
    fetch(`${API_URL}/api/leagues/${selectedLeagueId}/leaderboard?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && active) {
          setLeaderboard(data)
        }
      })
      .catch((err) => console.error('Error fetching leaderboard:', err))
      .finally(() => {
        if (active) setLeaderboardLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedLeagueId, user.token])

  // Socket connection for real-time updates
  useEffect(() => {
    if (!selectedLeagueId) return

    const socket = io(API_URL)

    socket.emit('joinLeague', selectedLeagueId)

    socket.on('leaderboardUpdate', (updatedLeaderboard: any) => {
      setLeaderboard(
        updatedLeaderboard.map((m: any, index: number) => {
          const initials = m.nickname
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'US'

          return {
            id: m.userId,
            name: m.nickname,
            avatar: initials,
            points: m.totalPoints,
            rank: index + 1,
            trend: 'same',
            isYou: m.userId === user.id,
          }
        })
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedLeagueId, user.id])

  // Fetch matches for the selected league
  useEffect(() => {
    if (!selectedLeagueId || !user.token || leagueSubTab !== 'predizioni') {
      return
    }

    let active = true
    setMatchesLoading(true)
    fetch(`${API_URL}/api/matches?leagueId=${selectedLeagueId}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && active) {
          setLeagueMatches(data.map(mapBackendMatch))
        }
      })
      .catch((err) => console.error('Error fetching league matches:', err))
      .finally(() => {
        if (active) setMatchesLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedLeagueId, user.token, leagueSubTab])

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Group matches by phase for the predictions sub-tab
  const phases = useMemo(() => {
    const order = [
      'Gironi (G1)',
      'Gironi (G2)',
      'Gironi (G3)',
      'Sedicesimi',
      'Ottavi',
      'Quarti',
      'Semifinale',
      'Finale'
    ]
    const unique = Array.from(new Set(leagueMatches.map((m) => m.phase)))
    return order.filter((p) => unique.includes(p))
  }, [leagueMatches])

  const [selectedPhase, setSelectedPhase] = useState<string>('Gironi (G1)')
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

  // Sync selected phase with available phases if needed
  useEffect(() => {
    if (phases.length > 0 && !phases.includes(selectedPhase)) {
      setSelectedPhase(phases[0])
    }
  }, [phases, selectedPhase])

  const filteredMatches = useMemo(() => {
    return leagueMatches.filter((m) => m.phase === selectedPhase)
  }, [leagueMatches, selectedPhase])

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setJoinError('Please enter a valid league code')
      return
    }
    const err = await onJoinLeague(joinCode.trim().toUpperCase())
    if (err) {
      setJoinError(err)
    } else {
      setJoinCode('')
      setJoinError(null)
      setShowJoinForm(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeagueName.trim()) {
      setCreateError('Please enter a league name')
      return
    }
    if (newLeagueName.trim().length < 3) {
      setCreateError('League name must be at least 3 characters')
      return
    }
    const err = await onCreateLeague(newLeagueName.trim())
    if (err) {
      setCreateError(err)
    } else {
      setNewLeagueName('')
      setCreateError(null)
      setShowCreateForm(false)
    }
  }

  return (
    <section className="px-5 py-5">
      <AnimatePresence mode="wait">
        {!selectedLeague ? (
          /* Leagues List Page */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Le Mie Leghe</h1>
              <p className="text-sm text-muted-foreground">
                Gestisci le tue leghe o unisciti a una nuova per sfidare altri tifosi.
              </p>
            </div>

            {/* Join / Create Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(!showJoinForm)
                  setShowCreateForm(false)
                  setJoinError(null)
                }}
                className={cn(
                  'flex h-11 items-center justify-center gap-2 rounded-2xl text-xs font-bold border border-border transition-colors',
                  showJoinForm ? 'bg-secondary text-foreground' : 'bg-card hover:bg-muted text-foreground'
                )}
              >
                <Key className="size-3.5" />
                Entra in una Lega
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(!showCreateForm)
                  setShowJoinForm(false)
                  setCreateError(null)
                }}
                className={cn(
                  'flex h-11 items-center justify-center gap-2 rounded-2xl text-xs font-bold border border-border transition-colors',
                  showCreateForm ? 'bg-secondary text-foreground' : 'bg-card hover:bg-muted text-foreground'
                )}
              >
                <Plus className="size-3.5" />
                Crea una Lega
              </button>
            </div>

            {/* Forms Dropdown */}
            <AnimatePresence initial={false}>
              {showJoinForm && (
                <motion.form
                  key="join"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleJoinSubmit}
                  className="overflow-hidden rounded-2xl border border-border bg-card/50 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Codice Invito
                    </label>
                    <input
                      type="text"
                      placeholder="ES. GLOBAL26"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary"
                    />
                    {joinError && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-accent mt-1">
                        <AlertCircle className="size-3.5" />
                        {joinError}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="h-8 rounded-lg px-3 text-xs font-bold text-muted-foreground hover:bg-secondary"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm"
                    >
                      Invia
                    </button>
                  </div>
                </motion.form>
              )}

              {showCreateForm && (
                <motion.form
                  key="create"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleCreateSubmit}
                  className="overflow-hidden rounded-2xl border border-border bg-card/50 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nome della Lega
                    </label>
                    <input
                      type="text"
                      placeholder="ES. Campioni del Bar"
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    />
                    {createError && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-accent mt-1">
                        <AlertCircle className="size-3.5" />
                        {createError}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="h-8 rounded-lg px-3 text-xs font-bold text-muted-foreground hover:bg-secondary"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm"
                    >
                      Crea
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List */}
            <div className="flex flex-col gap-2.5">
              {user.leagues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/20 p-8 text-center text-muted-foreground">
                  <Trophy className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  Non fai ancora parte di nessuna lega.
                </div>
              ) : (
                user.leagues.map((league) => (
                  <motion.div
                    key={league.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedLeagueId(league.id)
                      setLeagueSubTab('classifica')
                    }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/65 backdrop-blur-md cursor-pointer hover:border-primary/45 hover:bg-card transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-foreground truncate text-sm sm:text-base">
                        {league.name}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {league.membersCount}
                        </span>
                        <span className="text-primary font-bold">Rango: #{league.rank}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-0.5 text-[10px] font-mono font-bold">
                        <span>{league.code}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(league.code, e)}
                          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                        >
                          {copiedCode === league.code ? (
                            <Check className="size-3 text-primary" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* League Detail Page */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Header / Back */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setSelectedLeagueId(null)}
                className="flex w-fit items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                Torna a Tutte le Leghe
              </button>

              <div className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-4 sm:p-5 backdrop-blur-md">
                <div className="absolute -right-8 -top-8 size-20 rounded-full bg-primary/10 blur-xl" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">
                      {selectedLeague.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {selectedLeague.membersCount} partecipanti
                      </span>
                      <span className="font-semibold text-primary">Rango: #{selectedLeague.rank}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-1 text-xs font-mono font-bold tracking-wide">
                      <span className="text-muted-foreground">CODE:</span>
                      <span>{selectedLeague.code}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(selectedLeague.code, e)}
                        className="ml-1 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      >
                        {copiedCode === selectedLeague.code ? (
                          <Check className="size-3 text-primary" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {selectedLeague.creatorId === user.id && onDeleteLeague && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteLeagueId(selectedLeague.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition-all active:scale-95"
                        title="Elimina definitivamente questa lega"
                      >
                        <Trash2 className="size-3.5" />
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Classifica vs Predizioni */}
            <div className="flex border-b border-border/40 p-1 bg-card/40 backdrop-blur-md rounded-2xl border">
              {(['classifica', 'predizioni'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLeagueSubTab(tab)}
                  className="relative flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider"
                >
                  {leagueSubTab === tab && (
                    <motion.span
                      layoutId="league-tab-glow"
                      className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 transition-colors',
                      leagueSubTab === tab ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {tab}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-tab Content */}
            <div>
              {leagueSubTab === 'classifica' ? (
                /* Classifica (Leaderboard) */
                leaderboardLoading && leaderboard.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)]" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
                    Nessun partecipante in questa lega.
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2.5 max-w-md mx-auto w-full list-none pl-0">
                    {leaderboard.map((member) => {
                      const isCurrentUser = member.isYou
                      const isImage = member.avatar?.startsWith('http') || member.avatar?.startsWith('data:image')
                      
                      let rankBadge = null
                      let cardClass = 'border-border bg-card/50 hover:bg-card/75'
                      
                      if (member.rank === 1) {
                        rankBadge = (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.15)]">
                            <Trophy className="size-4" strokeWidth={2.5} />
                          </div>
                        )
                        cardClass = 'border-amber-400/25 bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-card/50'
                      } else if (member.rank === 2) {
                        rankBadge = (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-slate-300/15 text-slate-300">
                            <Award className="size-4" strokeWidth={2.5} />
                          </div>
                        )
                        cardClass = 'border-slate-400/20 bg-gradient-to-r from-slate-400/8 via-slate-400/3 to-card/50'
                      } else if (member.rank === 3) {
                        rankBadge = (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-700/20 text-amber-600">
                            <Award className="size-4" strokeWidth={2.5} />
                          </div>
                        )
                        cardClass = 'border-amber-700/20 bg-gradient-to-r from-amber-700/8 via-amber-700/3 to-card/50'
                      } else {
                        rankBadge = (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-secondary/80 text-xs font-black text-muted-foreground">
                            {member.rank}
                          </div>
                        )
                      }

                      if (isCurrentUser && member.rank > 3) {
                        cardClass = 'border-primary/45 bg-primary/8 shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.12)]'
                      }

                      return (
                        <motion.li
                          key={member.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedUserId(member.id)}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-200 cursor-pointer hover:bg-muted/10',
                            cardClass
                          )}
                          title="Clicca per vedere il profilo"
                        >
                          {rankBadge}
                          
                          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary overflow-hidden text-[10px] font-black">
                            {isImage ? (
                              <img src={member.avatar} alt="Avatar" className="size-full object-cover" />
                            ) : (
                              member.avatar
                            )}
                          </div>
                          
                          <span
                            className={cn(
                              'flex-1 truncate text-xs font-bold text-foreground',
                              isCurrentUser && 'text-primary font-black'
                            )}
                          >
                            {member.name} {isCurrentUser && <span className="ml-1 text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">Tu</span>}
                          </span>
                          
                          <span className="text-xs font-black tabular-nums text-foreground/95 bg-background/50 border border-border/40 px-2.5 py-1 rounded-xl">
                            {member.points.toLocaleString()} pts
                          </span>
                        </motion.li>
                      )
                    })}
                  </ul>
                )
              ) : (
                /* Predizioni (Match List) */
                matchesLoading && leagueMatches.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)]" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Matchday Select in League */}
                    {phases.length > 0 && (
                      <div className="flex gap-2 border-b border-border/20 pb-2 overflow-x-auto no-scrollbar">
                        {phases.map((phase) => {
                          const isActive = selectedPhase === phase
                          return (
                            <button
                              key={phase}
                              type="button"
                              onClick={() => {
                                setSelectedPhase(phase)
                                setExpandedMatchId(null)
                              }}
                              className={cn(
                                'relative px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap rounded-lg',
                                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="league-matchday-glow"
                                  className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{phase}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Matches Grid inside League */}
                    <ul className="flex flex-col gap-4 max-w-md mx-auto w-full list-none pl-0">
                      {filteredMatches.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
                          Nessuna partita in programma per la fase {selectedPhase}.
                        </div>
                      ) : (
                        filteredMatches.map((match, idx) => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            index={idx}
                            expanded={expandedMatchId === match.id}
                            onToggle={() =>
                              setExpandedMatchId((prev) => (prev === match.id ? null : match.id))
                            }
                            onSubmit={(mId, h, a) => onSubmitPrediction(mId, h, a, selectedLeague.id)}
                          />
                        ))
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other User Profile Modal */}
      <AnimatePresence>
        {selectedUserId && (
          <motion.div
            key="member-profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUserId(null)}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors z-50"
              >
                <X className="size-4" />
              </button>

              {userProfileLoading ? (
                <div className="flex justify-center py-12">
                  <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)]" />
                </div>
              ) : selectedUserProfile ? (
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-4 group cursor-pointer" onClick={() => setZoomOtherAvatar(true)}>
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-colors"
                    />
                    <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-primary bg-secondary overflow-hidden text-2xl font-black text-foreground shadow-[0_0_20px_oklch(0.58_0.23_250_/_0.3)] hover:opacity-95 transition-opacity">
                      {selectedUserProfile.avatarUrl ? (
                        <img src={selectedUserProfile.avatarUrl} alt="Avatar" className="size-full object-cover" />
                      ) : (
                        selectedUserProfile.nickname
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'US'
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="size-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                    {selectedUserProfile.nickname}
                  </h3>
                  <p className="text-xs text-muted-foreground">Profilo Giocatore</p>

                  {/* Profile Statistics Grid */}
                  <div className="mt-5 grid w-full grid-cols-2 gap-3 rounded-2xl border border-border/40 bg-background/50 p-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Punti</span>
                      <span className="mt-1 text-lg font-black text-primary tabular-nums">
                        {(selectedUserProfile.totalPoints ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-l border-border/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rango Global</span>
                      <span className="mt-1 flex items-center gap-0.5 text-lg font-black text-amber-500">
                        <Award className="size-4 shrink-0 text-amber-500" />
                        #{selectedUserProfile.leagues?.find((l: any) => l.name === 'Global League' || l.id === 'GLOBAL26')?.rank ?? 1}
                      </span>
                    </div>
                  </div>

                  {/* Leagues list */}
                  <div className="mt-5 w-full text-left">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Partecipazioni Leghe
                    </h4>
                    <div className="max-h-40 overflow-y-auto no-scrollbar space-y-2">
                      {!selectedUserProfile.leagues || selectedUserProfile.leagues.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Non fa parte di nessuna lega.</p>
                      ) : (
                        selectedUserProfile.leagues.map((l: any) => (
                          <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/40 text-xs">
                            <span className="font-bold text-foreground truncate max-w-[180px]">{l.name}</span>
                            <span className="text-muted-foreground">Rango: <strong className="text-primary">#{l.rank}</strong> ({l.points} pts)</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Impossibile caricare il profilo dell'utente.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Zoomed Avatar overlay for other user */}
        {zoomOtherAvatar && selectedUserProfile && (
          <motion.div
            key="member-avatar-zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOtherAvatar(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full aspect-square rounded-3xl overflow-hidden border border-border bg-card shadow-2xl"
            >
              {selectedUserProfile.avatarUrl ? (
                <img src={selectedUserProfile.avatarUrl} alt="Avatar Ingrandito" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-secondary text-5xl font-black">
                  {selectedUserProfile.nickname
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'US'}
                </div>
              )}
              <button
                type="button"
                onClick={() => setZoomOtherAvatar(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete League Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteLeagueId && (
          <motion.div
            key="delete-league-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteLeagueId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-destructive/20 bg-card p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                  <AlertCircle className="size-6" />
                </div>

                <h3 className="text-lg font-black text-foreground tracking-tight">
                  Elimina Lega
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Sei sicuro di voler eliminare definitivamente questa lega? Questa azione è irreversibile e comporterà la perdita di tutti i partecipanti e delle loro predizioni.
                </p>

                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteLeagueId(null)}
                    className="flex-1 rounded-xl border border-border bg-secondary/30 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (onDeleteLeague && confirmDeleteLeagueId) {
                        const err = await onDeleteLeague(confirmDeleteLeagueId)
                        if (!err) {
                          setSelectedLeagueId(null)
                        } else {
                          console.error(err)
                        }
                      }
                      setConfirmDeleteLeagueId(null)
                    }}
                    className="flex-1 rounded-xl bg-destructive py-2.5 text-xs font-bold text-white hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unofficial App Disclaimer */}
      <div className="mt-8 border-t border-border/40 pt-4 text-center">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-pretty">
          *Disclaimer: NetScore è una piattaforma amatoriale non affiliata a FIFA® o alla FIFA World Cup 26™. Marchi, nomi e loghi sono di proprietà esclusiva dei legittimi titolari.
        </p>
      </div>
    </section>
  )
}
