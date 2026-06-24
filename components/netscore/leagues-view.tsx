'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, Users, Award, ArrowLeft, Key, Plus, Copy, Check, AlertCircle, Sparkles, ChevronRight, CalendarDays } from 'lucide-react'
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
}

export function LeaguesView({
  user,
  onSubmitPrediction,
  onJoinLeague,
  onCreateLeague,
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
    fetch(`${API_URL}/api/leagues/${selectedLeagueId}/leaderboard`, {
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
    fetch(`${API_URL}/api/matches?leagueId=${selectedLeagueId}`, {
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

  // Group matches by matchday (giornata) for the predictions sub-tab
  const matchdays = useMemo(() => {
    const days = leagueMatches.map((m) => m.matchday)
    return Array.from(new Set(days)).sort((a, b) => a - b)
  }, [leagueMatches])

  const [selectedMatchday, setSelectedMatchday] = useState<number>(1)
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

  // Sync selected matchday with available matchdays if needed
  useEffect(() => {
    if (matchdays.length > 0 && !matchdays.includes(selectedMatchday)) {
      setSelectedMatchday(matchdays[0])
    }
  }, [matchdays, selectedMatchday])

  const filteredMatches = useMemo(() => {
    return leagueMatches.filter((m) => m.matchday === selectedMatchday)
  }, [leagueMatches, selectedMatchday])

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
                          className={cn(
                            'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-200',
                            cardClass
                          )}
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
                    {matchdays.length > 0 && (
                      <div className="flex gap-2 border-b border-border/20 pb-2 overflow-x-auto no-scrollbar">
                        {matchdays.map((day) => {
                          const isActive = selectedMatchday === day
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setSelectedMatchday(day)
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
                              <span className="relative z-10">Giornata {day}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Matches Grid inside League */}
                    <ul className="flex flex-col gap-4 max-w-md mx-auto w-full list-none pl-0">
                      {filteredMatches.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
                          Nessuna partita in programma per la Giornata {selectedMatchday}.
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

      {/* Unofficial App Disclaimer */}
      <div className="mt-8 border-t border-border/40 pt-4 text-center">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-pretty">
          *Disclaimer: NetScore è una piattaforma amatoriale non affiliata a FIFA® o alla FIFA World Cup 26™. Marchi, nomi e loghi sono di proprietà esclusiva dei legittimi titolari.
        </p>
      </div>
    </section>
  )
}
