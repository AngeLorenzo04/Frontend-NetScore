'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="fixed inset-x-0 bottom-24 z-50 mx-auto flex w-fit max-w-[90%] items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-5 py-3 text-sm font-medium text-foreground shadow-[0_0_24px_oklch(0.86_0.24_145_/_0.4)] backdrop-blur-xl"
          role="status"
        >
          <CheckCircle2 className="size-5 text-primary" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
