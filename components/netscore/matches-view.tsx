'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MatchCard } from './match-card'
import { UPCOMING_MATCHES, type Match, mapBackendMatch } from './data'
import { cn } from '@/lib/utils'

export function MatchesView({
  user,
  onSubmitPrediction,
}: {
  user: any
  onSubmitPrediction: (matchId: string, home: number, away: number, leagueId?: string) => Promise<void>
}) {
  const [matches, setMatches] = useState<Match[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)

  // Initialize selectedLeagueId with user's first league if not set
  useEffect(() => {
    if (user?.leagues && user.leagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(user.leagues[0].id)
    }
  }, [user, selectedLeagueId])

  useEffect(() => {
    if (!user || !user.token) return

    let active = true
    setLoading(true)
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const url = selectedLeagueId
      ? `${apiUrl}/api/matches?leagueId=${selectedLeagueId}`
      : `${apiUrl}/api/matches`

    fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && active) {
          setMatches(data.map(mapBackendMatch))
        }
      })
      .catch((err) => console.error('Error fetching matches:', err))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.token, selectedLeagueId])

  // Find all unique phases in defined order
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
    const unique = Array.from(new Set(matches.map((m) => m.phase)))
    return order.filter((p) => unique.includes(p))
  }, [matches])

  const [selectedPhase, setSelectedPhase] = useState<string>('Gironi (G1)')

  // Sync selected phase with available phases if needed
  useEffect(() => {
    if (phases.length > 0 && !phases.includes(selectedPhase)) {
      setSelectedPhase(phases[0])
    }
  }, [phases, selectedPhase])

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => m.phase === selectedPhase)
  }, [matches, selectedPhase])

  return (
    <section className="px-5 py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">
            FIFA World Cup 26™ Matches
          </h1>
          <p className="text-sm text-muted-foreground">
            Lock in your scores for each tournament stage before kickoff.
          </p>
        </motion.div>

        {/* League Selector */}
        {user?.leagues && user.leagues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:max-w-xs shrink-0"
          >
            <select
              value={selectedLeagueId || ''}
              onChange={(e) => {
                setSelectedLeagueId(e.target.value)
                setExpandedId(null)
              }}
              className="w-full h-11 rounded-xl border border-border bg-card pl-3.5 pr-10 text-sm font-semibold text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {user.leagues.map((l: any) => (
                <option key={l.id} value={l.id}>
                  Lega: {l.name}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* Matchday Tabs / Sub-nav */}
      {phases.length > 0 && (
        <div className="mb-6 flex gap-2 border-b border-border/40 pb-2 overflow-x-auto no-scrollbar">
          {phases.map((phase) => {
            const isActive = selectedPhase === phase
            return (
              <button
                key={phase}
                type="button"
                onClick={() => {
                  setSelectedPhase(phase)
                  setExpandedId(null) // collapse open cards when switching days
                }}
                className={cn(
                  'relative px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap rounded-xl',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="matchday-glow"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{phase}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Matches Grid */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={selectedPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto list-none pl-0 w-full"
        >
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)]" />
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Nessuna partita in programma per la fase {selectedPhase}.
            </div>
          ) : (
            filteredMatches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                index={index}
                expanded={expandedId === match.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === match.id ? null : match.id))
                }
                onSubmit={(mId, h, a) => onSubmitPrediction(mId, h, a, selectedLeagueId || undefined)}
              />
            ))
          )}
        </motion.ul>
      </AnimatePresence>
    </section>
  )
}
