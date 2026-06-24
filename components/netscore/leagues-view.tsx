'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, Users, Award, ArrowLeft, Key, Plus, Copy, Check, AlertCircle, Sparkles, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { League } from './profile-view'
import { LEADERBOARD, UPCOMING_MATCHES, type Match } from './data'
import { MatchCard } from './match-card'

interface LeaguesViewProps {
  user: {
    name: string
    email: string
    avatar: string
    points: number
    leagues: League[]
  }
  onSubmitPrediction: (matchId: string, home: number, away: number) => Promise<void>
  onJoinLeague: (code: string) => string | null
  onCreateLeague: (name: string) => void
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

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Find the currently selected league
  const selectedLeague = useMemo(() => {
    return user.leagues.find((l) => l.id === selectedLeagueId) || null
  }, [user.leagues, selectedLeagueId])

  // Generate dynamic leaderboard members based on the selected league
  const leagueMembers = useMemo(() => {
    if (!selectedLeague) return []
    if (selectedLeague.code === 'GLOBAL26') {
      // Map the global leaderboard from data.ts
      return LEADERBOARD.map((item) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        points: item.points,
        trend: item.trend,
        isYou: item.name === 'You',
      }))
    }

    // Default mock members list including the current user
    const baseMembers = [
      { id: 'm_you', name: 'You', avatar: user.avatar, points: user.points, isYou: true },
      { id: 'm_1', name: 'Sofia M.', avatar: 'SM', points: 1420, isYou: false },
      { id: 'm_2', name: 'Kai R.', avatar: 'KR', points: 1350, isYou: false },
      { id: 'm_3', name: 'Diego A.', avatar: 'DA', points: 1180, isYou: false },
      { id: 'm_4', name: 'Amara O.', avatar: 'AO', points: 980, isYou: false },
      { id: 'm_5', name: 'Leo P.', avatar: 'LP', points: 850, isYou: false },
    ]

    // Slice or filter based on membersCount
    const actualCount = selectedLeague.membersCount
    let sliced = baseMembers.slice(0, Math.max(1, actualCount))

    // Ensure the current user "You" is always included in the list
    if (!sliced.some((m) => m.isYou)) {
      sliced.push({ id: 'm_you', name: 'You', avatar: user.avatar, points: user.points, isYou: true })
    }

    // Sort by points descending
    sliced.sort((a, b) => b.points - a.points)

    return sliced.map((m, index) => ({
      ...m,
      rank: index + 1,
      trend: 'same' as const,
    }))
  }, [selectedLeague, user])

  // Group matches by matchday (giornata) for the predictions sub-tab
  const matchdays = useMemo(() => {
    const days = UPCOMING_MATCHES.map((m) => m.matchday)
    return Array.from(new Set(days)).sort((a, b) => a - b)
  }, [])

  const [selectedMatchday, setSelectedMatchday] = useState<number>(1)
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

  const filteredMatches = useMemo(() => {
    return UPCOMING_MATCHES.filter((m) => m.matchday === selectedMatchday)
  }, [selectedMatchday])

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setJoinError('Please enter a valid league code')
      return
    }
    const err = onJoinLeague(joinCode.trim().toUpperCase())
    if (err) {
      setJoinError(err)
    } else {
      setJoinCode('')
      setJoinError(null)
      setShowJoinForm(false)
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeagueName.trim()) {
      setCreateError('Please enter a league name')
      return
    }
    if (newLeagueName.trim().length < 3) {
      setCreateError('League name must be at least 3 characters')
      return
    }
    onCreateLeague(newLeagueName.trim())
    setNewLeagueName('')
    setCreateError(null)
    setShowCreateForm(false)
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
                <ul className="flex flex-col gap-2">
                  {leagueMembers.map((member) => {
                    const isCurrentUser = member.isYou
                    return (
                      <motion.li
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-4 py-3',
                          isCurrentUser
                            ? 'border-primary/50 bg-primary/10 shadow-[0_0_12px_oklch(0.86_0.24_145_/_0.2)]'
                            : 'border-border bg-card/50'
                        )}
                      >
                        <span className="w-5 text-center text-xs font-black text-muted-foreground">
                          {member.rank}
                        </span>
                        <span
                          className={cn(
                            'flex size-9 items-center justify-center rounded-full border text-[10px] font-black',
                            isCurrentUser
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-border bg-secondary text-muted-foreground'
                          )}
                        >
                          {member.avatar}
                        </span>
                        <span
                          className={cn(
                            'flex-1 truncate text-xs font-bold',
                            isCurrentUser && 'text-primary'
                          )}
                        >
                          {member.name}
                        </span>
                        <span className="text-xs font-black tabular-nums">
                          {member.points.toLocaleString()} pts
                        </span>
                      </motion.li>
                    )
                  })}
                </ul>
              ) : (
                /* Predizioni (Match List) */
                <div className="flex flex-col gap-4">
                  {/* Matchday Select in League */}
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

                  {/* Matches Grid inside League */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredMatches.map((match, idx) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        index={idx}
                        expanded={expandedMatchId === match.id}
                        onToggle={() =>
                          setExpandedMatchId((prev) => (prev === match.id ? null : match.id))
                        }
                        onSubmit={onSubmitPrediction}
                      />
                    ))}
                  </div>
                </div>
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
