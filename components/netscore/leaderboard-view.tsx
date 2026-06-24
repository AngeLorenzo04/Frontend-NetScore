'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Crown, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LEADERBOARD, type LeaderUser } from './data'
import { cn } from '@/lib/utils'

const PODIUM_STYLES = [
  {
    ring: 'border-gold',
    glow: 'shadow-[0_0_28px_oklch(0.85_0.16_90_/_0.6)]',
    text: 'text-gold',
    height: 'h-28',
    order: 'order-2',
  },
  {
    ring: 'border-silver',
    glow: 'shadow-[0_0_20px_oklch(0.85_0.02_280_/_0.5)]',
    text: 'text-silver',
    height: 'h-20',
    order: 'order-1',
  },
  {
    ring: 'border-bronze',
    glow: 'shadow-[0_0_20px_oklch(0.7_0.12_55_/_0.5)]',
    text: 'text-bronze',
    height: 'h-16',
    order: 'order-3',
  },
]

function TrendIcon({ trend }: { trend: LeaderUser['trend'] }) {
  if (trend === 'up') return <TrendingUp className="size-4 text-primary" />
  if (trend === 'down') return <TrendingDown className="size-4 text-destructive" />
  return <Minus className="size-4 text-muted-foreground" />
}

export function LeaderboardView() {
  const [users, setUsers] = useState<LeaderUser[]>(LEADERBOARD)

  useEffect(() => {
    // TODO: Listen to socket.io event 'leaderboardUpdate'
    setUsers(LEADERBOARD)
  }, [])

  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <section className="px-5 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Global rankings</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5">
          <motion.span
            className="size-2 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Live
          </span>
        </span>
      </div>

      {/* Podium */}
      <div className="mb-6 flex items-end justify-center gap-3">
        {top3.map((user, i) => {
          const s = PODIUM_STYLES[i]
          return (
            <motion.div
              key={user.id}
              className={cn('flex flex-1 flex-col items-center', s.order)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1 + i * 0.1,
              }}
            >
              {i === 0 && (
                <Crown className="mb-1 size-6 text-gold drop-shadow-[0_0_8px_oklch(0.85_0.16_90_/_0.8)]" />
              )}
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-full border-2 bg-secondary text-sm font-extrabold tracking-wide',
                  s.ring,
                  s.glow,
                  s.text,
                )}
              >
                {user.avatar}
              </div>
              <p className="mt-2 max-w-full truncate text-xs font-bold">
                {user.name}
              </p>
              <p className={cn('text-xs font-extrabold', s.text)}>
                {user.points.toLocaleString()}
              </p>
              <div
                className={cn(
                  'mt-2 flex w-full items-start justify-center rounded-t-xl border border-b-0 bg-card/60 pt-2 text-lg font-black',
                  s.ring,
                  s.height,
                  s.text,
                )}
              >
                {i + 1}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Rest of list */}
      <ul className="flex flex-col gap-2">
        {rest.map((user, i) => {
          const isYou = user.name === 'You'
          return (
            <motion.li
              key={user.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
                delay: 0.3 + i * 0.06,
              }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md',
                isYou
                  ? 'border-primary/50 bg-primary/10 shadow-[0_0_16px_oklch(0.86_0.24_145_/_0.3)]'
                  : 'border-border bg-card/70',
              )}
            >
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                {i + 4}
              </span>
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border text-xs font-extrabold tracking-wide',
                  isYou
                    ? 'border-primary/50 bg-primary/20 text-primary'
                    : 'border-border bg-secondary text-muted-foreground',
                )}
              >
                {user.avatar}
              </span>
              <span
                className={cn(
                  'flex-1 truncate text-sm font-bold',
                  isYou && 'text-primary',
                )}
              >
                {user.name}
              </span>
              <TrendIcon trend={user.trend} />
              <span className="w-16 text-right text-sm font-extrabold tabular-nums">
                {user.points.toLocaleString()}
              </span>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
