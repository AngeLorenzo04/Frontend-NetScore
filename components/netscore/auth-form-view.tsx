'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, Mail, Lock, User, ArrowRight, Goal, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function FloatingInput({
  id,
  label,
  type,
  icon: Icon,
  value,
  onChange,
}: {
  id: string
  label: string
  type: string
  icon: typeof Mail
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer h-14 w-full rounded-2xl border border-border bg-card/70 pl-11 pr-4 pt-4 text-sm font-medium text-foreground outline-none backdrop-blur-md transition-colors focus:border-primary focus:shadow-[0_0_16px_oklch(0.58_0.23_250_/_0.3)]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all peer-focus:top-4 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
      >
        {label}
      </label>
    </div>
  )
}

export function AuthFormView({ onLogin }: { onLogin: (user: any, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const url = mode === 'login'
        ? `${apiUrl}/api/auth/login`
        : `${apiUrl}/api/auth/register`
      
      const body = mode === 'login'
        ? { email, password }
        : { email, nickname: name, password }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Si è verificato un errore.')
      }

      onLogin(data.user, data.token)
    } catch (err: any) {
      setError(err.message || 'Errore di connessione al server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-sm flex-col items-center"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.58_0.23_250_/_0.5)]">
            <Goal className="size-8" strokeWidth={2.5} />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Join NetScore 26'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to keep your streak alive.'
              : 'Create an account and start predicting.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex w-full rounded-2xl border border-border bg-card/70 p-1 backdrop-blur-md">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="relative flex-1 rounded-xl py-2.5 text-sm font-bold capitalize"
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-toggle"
                  className="absolute inset-0 rounded-xl bg-primary shadow-[0_0_14px_oklch(0.58_0.23_250_/_0.4)]"
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors',
                  mode === m ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {m}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <AnimatePresence initial={false}>
            {mode === 'register' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <FloatingInput
                  id="name"
                  label="Username"
                  type="text"
                  icon={User}
                  value={name}
                  onChange={setName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <FloatingInput
            id="email"
            label="Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={setEmail}
          />
          <FloatingInput
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={setPassword}
          />


          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive mt-1">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            className="mt-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_20px_oklch(0.58_0.23_250_/_0.45)] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="size-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-muted-foreground text-pretty">
            By continuing you agree to the NetScore 26 fair-play rules and privacy
            policy.
          </p>
          <div className="pt-4 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed text-pretty">
              *Disclaimer: NetScore is an unofficial fan prediction platform. It is not affiliated with, sponsored by, or endorsed by FIFA® or the FIFA World Cup 26™. All trademarks, brand names, and logos are the property of their respective owners.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
