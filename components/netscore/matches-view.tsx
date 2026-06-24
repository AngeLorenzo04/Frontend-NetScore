'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MatchCard } from './match-card'
import { UPCOMING_MATCHES, type Match } from './data'
import { cn } from '@/lib/utils'

export function MatchesView({
  onSubmitPrediction,
}: {
  onSubmitPrediction: (matchId: string, home: number, away: number) => Promise<void>
}) {
  const [matches, setMatches] = useState<Match[]>(UPCOMING_MATCHES)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Connect to backend API (GET /api/matches/upcoming)
    setMatches(UPCOMING_MATCHES)
  }, [])

  // Find all unique matchdays
  const matchdays = useMemo(() => {
    const days = matches.map((m) => m.matchday)
    return Array.from(new Set(days)).sort((a, b) => a - b)
  }, [matches])

  const [selectedMatchday, setSelectedMatchday] = useState<number>(1)

  // Sync selected matchday with available matchdays if needed
  useEffect(() => {
    if (matchdays.length > 0 && !matchdays.includes(selectedMatchday)) {
      setSelectedMatchday(matchdays[0])
    }
  }, [matchdays, selectedMatchday])

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => m.matchday === selectedMatchday)
  }, [matches, selectedMatchday])

  return (
    <section className="px-5 py-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">
          FIFA World Cup 26™ Matches
        </h1>
        <p className="text-sm text-muted-foreground">
          Lock in your scores for each Matchday (Giornata) before kickoff.
        </p>
      </motion.div>

      {/* Matchday Tabs / Sub-nav */}
      {matchdays.length > 0 && (
        <div className="mb-6 flex gap-2 border-b border-border/40 pb-2 overflow-x-auto no-scrollbar">
          {matchdays.map((day) => {
            const isActive = selectedMatchday === day
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedMatchday(day)
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
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_12px_oklch(0.86_0.24_145_/_0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Giornata {day}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Matches Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMatchday}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredMatches.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No matches scheduled for Giornata {selectedMatchday}.
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
                onSubmit={onSubmitPrediction}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
