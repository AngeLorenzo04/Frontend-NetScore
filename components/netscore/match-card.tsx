'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, Minus, Plus, Clock, MapPin, Check } from 'lucide-react'
import type { Match } from './data'
import { cn } from '@/lib/utils'

function TeamBadge({
  flag,
  name,
  align,
}: {
  flag: string
  name: string
  align: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-3',
        align === 'right' && 'flex-row-reverse text-right',
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl">
        {flag}
      </span>
      <div className={cn('min-w-0', align === 'right' && 'items-end')}>
        <p className="truncate text-sm font-bold">{name}</p>
      </div>
    </div>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <motion.button
          type="button"
          aria-label={`Decrease ${label} goals`}
          whileTap={{ scale: 0.8 }}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground active:bg-muted"
        >
          <Minus className="size-4" />
        </motion.button>
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-background">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="text-2xl font-extrabold text-primary"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.button
          type="button"
          aria-label={`Increase ${label} goals`}
          whileTap={{ scale: 0.8 }}
          onClick={() => onChange(value + 1)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground active:bg-muted"
        >
          <Plus className="size-4" />
        </motion.button>
      </div>
    </div>
  )
}

export function MatchCard({
  match,
  index,
  expanded,
  onToggle,
  onSubmit,
}: {
  match: Match & {
    status?: string
    homeGoals?: number | null
    awayGoals?: number | null
    prediction?: {
      predictedHome: number
      predictedAway: number
      pointsEarned: number | null
    } | null
  }
  index: number
  expanded: boolean
  onToggle: () => void
  onSubmit: (matchId: string, home: number, away: number) => Promise<void>
}) {
  const initialHome = match.prediction ? match.prediction.predictedHome : 0
  const initialAway = match.prediction ? match.prediction.predictedAway : 0
  const initialStatus = match.prediction ? 'done' : 'idle'

  const [home, setHome] = useState(initialHome)
  const [away, setAway] = useState(initialAway)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>(initialStatus)

  // Sync state if prediction prop updates externally
  useEffect(() => {
    if (match.prediction) {
      setHome(match.prediction.predictedHome)
      setAway(match.prediction.predictedAway)
      setStatus('done')
    } else {
      if (status === 'done') {
        setHome(0)
        setAway(0)
        setStatus('idle')
      }
    }
  }, [match.prediction])

  async function handleSubmit() {
    setStatus('loading')
    try {
      await onSubmit(match.id, home, away)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
    }
  }

  const isFinished = match.status === 'FINISHED'

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
        delay: index * 0.07,
      }}
      className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {match.stage}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-accent">
          <Clock className="size-3" />
          {isFinished ? 'Terminata' : match.kickoff}
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        <TeamBadge flag={match.home.flag} name={match.home.name} align="left" />
        <span className="px-1 text-sm font-black text-muted-foreground">
          {isFinished ? `${match.homeGoals} - ${match.awayGoals}` : 'VS'}
        </span>
        <TeamBadge flag={match.away.flag} name={match.away.name} align="right" />
      </div>

      <div className="flex items-center gap-1 px-4 text-[11px] text-muted-foreground">
        <MapPin className="size-3" />
        {match.venue}
      </div>

      <div className="p-4">
        {isFinished ? (
          <div className="flex flex-col gap-2">
            {match.prediction ? (
              <div className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold",
                match.prediction.pointsEarned && match.prediction.pointsEarned > 0
                  ? "border-primary/20 bg-primary/5 text-primary shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.1)]"
                  : "border-border bg-secondary/35 text-muted-foreground"
              )}>
                <span className="truncate">Predizione: {match.prediction.predictedHome} – {match.prediction.predictedAway}</span>
                <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-black shrink-0">
                  +{match.prediction.pointsEarned ?? 0} {match.prediction.pointsEarned === 1 ? 'Punto' : 'Punti'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/30 py-3 text-xs text-muted-foreground">
                Nessuna predizione effettuata
              </div>
            )}
          </div>
        ) : status === 'done' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-sm font-bold text-primary">
              <Check className="size-4" /> Predetto {home} – {away}
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setStatus('idle')
                if (!expanded) {
                  onToggle()
                }
              }}
              className="w-full rounded-2xl border border-border bg-secondary/40 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
            >
              Modifica Predizione
            </motion.button>
          </div>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onToggle}
            className={cn(
              'w-full rounded-2xl py-3 text-sm font-bold transition-colors',
              expanded
                ? 'bg-secondary text-foreground'
                : 'bg-primary text-primary-foreground shadow-[0_0_18px_oklch(0.58_0.23_250_/_0.4)]',
            )}
          >
            {expanded ? 'Annulla' : 'Predici Ora'}
          </motion.button>
        )}

        <AnimatePresence initial={false}>
          {expanded && status !== 'done' && !isFinished && (
            <motion.div
              key="predict"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center gap-1 rounded-2xl border border-border bg-background/60 px-3 py-4">
                <Stepper label={match.home.short} value={home} onChange={setHome} />
                <span className="shrink-0 px-0.5 text-xl font-black text-muted-foreground">
                  :
                </span>
                <Stepper label={match.away.short} value={away} onChange={setAway} />
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={status === 'loading'}
                onClick={handleSubmit}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-accent-foreground shadow-[0_0_18px_oklch(0.7_0.27_340_/_0.45)] disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Invio in corso…
                  </>
                ) : (
                  'Salva Predizione'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
