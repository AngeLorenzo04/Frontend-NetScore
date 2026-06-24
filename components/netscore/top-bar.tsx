'use client'

import { motion } from 'motion/react'
import { Goal } from 'lucide-react'

export function TopBar({ avatar }: { avatar: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-5">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_18px_oklch(0.58_0.23_250_/_0.55)]">
            <Goal className="size-5" strokeWidth={2.5} />
          </span>
          <div className="leading-none">
            <p className="text-lg font-bold tracking-tight">
              NetScore
              <span className="ml-1 text-primary">26</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Predict · Play · Win
            </p>
          </div>
        </motion.div>

        <motion.button
          type="button"
          aria-label="Your profile"
          whileTap={{ scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-extrabold tracking-wide text-foreground shadow-[0_0_14px_oklch(0.58_0.23_250_/_0.35)]"
        >
          {avatar}
        </motion.button>
      </div>
    </header>
  )
}
