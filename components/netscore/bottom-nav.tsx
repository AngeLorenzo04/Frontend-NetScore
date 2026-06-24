'use client'

import { motion } from 'motion/react'
import { CalendarDays, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'matches' | 'leagues' | 'profile'

export const TABS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'matches', label: 'Matches', icon: CalendarDays },
  { id: 'leagues', label: 'Leghe', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
]

export function BottomNav({
  active,
  onChange,
  className,
}: {
  active: TabId
  onChange: (tab: TabId) => void
  className?: string
}) {
  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/80 backdrop-blur-xl",
      className
    )}>
      <div className="mx-auto flex max-w-md items-stretch justify-around px-4 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-1 flex-col items-center gap-1 py-3"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute -top-px h-0.5 w-10 rounded-full bg-primary shadow-[0_0_12px_oklch(0.86_0.24_145_/_0.9)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'size-6 transition-colors',
                  isActive
                    ? 'text-primary drop-shadow-[0_0_8px_oklch(0.86_0.24_145_/_0.7)]'
                    : 'text-muted-foreground',
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
