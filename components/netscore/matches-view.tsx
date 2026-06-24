'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MatchCard } from './match-card'
import { UPCOMING_MATCHES, type Match } from './data'

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

  return (
    <section className="px-5 py-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">
          Upcoming Matches
        </h1>
        <p className="text-sm text-muted-foreground">
          Lock in your scoreline before kickoff.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((match, index) => (
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
        ))}
      </div>
    </section>
  )
}
