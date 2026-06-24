'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Goal, Trophy, Users, ShieldAlert, ArrowRight, Activity, Award, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomepageProps {
  user: any
  onEnter: () => void
  onShowLogin: () => void
  onLogout: () => void
}

export function Homepage({ user, onEnter, onShowLogin, onLogout }: HomepageProps) {
  // Mock match prediction state for interactive demo on landing page
  const [demoHomeScore, setDemoHomeScore] = useState(2)
  const [demoAwayScore, setDemoAwayScore] = useState(1)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Dynamic Glowing Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] size-[50vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[10%] size-[50vw] rounded-full bg-neon-green/5 blur-[120px]" />
        <div className="absolute left-[30%] top-[40%] size-[40vw] rounded-full bg-neon-magenta/5 blur-[100px]" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 backdrop-blur-sm border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.58_0.23_250_/_0.4)]">
            <Goal className="size-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-wider">
            NetScore<span className="text-primary font-extrabold">26</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-muted-foreground">Logged in as</span>
                <span className="text-sm font-black text-foreground">{user.name}</span>
              </div>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-9 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary text-xs font-black">
                  {user.avatar}
                </div>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-border/40 bg-secondary/30 px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-destructive hover:text-white"
              >
                Esci
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onShowLogin}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.3)] transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Accedi / Registrati
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
        {/* Hero Section */}
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary"
            >
              <Trophy className="size-4" /> Unisciti alla Lega Globale dei Mondiali 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]"
            >
              Predici i Risultati.<br />
              Crea le tue <span className="bg-gradient-to-r from-primary to-neon-green bg-clip-text text-transparent drop-shadow-[0_0_24px_oklch(0.58_0.23_250_/_0.2)]">Leghe Private</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              NetScore è la piattaforma definitiva per i pronostici calcistici. Inserisci i tuoi pronostici per i match dei mondiali in tempo reale, sfida i tuoi amici in leghe dedicate e scala le classifiche.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={user ? onEnter : onShowLogin}
                className="group relative flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-[0_0_24px_oklch(0.58_0.23_250_/_0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Entra nella Piattaforma
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Interactive Predictor Widget Demo */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card/75 p-6 shadow-2xl backdrop-blur-md overflow-hidden"
            >
              {/* Decorative Glow inside Widget */}
              <div className="absolute -right-16 -top-16 size-36 rounded-full bg-primary/10 blur-2xl" />

              <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
                <span className="text-xs font-extrabold tracking-wider text-primary uppercase flex items-center gap-1.5">
                  <Activity className="size-3.5 animate-pulse" /> Giornata 1
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">DEMO INTERATTIVA</span>
              </div>

              {/* Match Card Layout */}
              <div className="flex flex-col gap-6 py-4">
                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇮🇹</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-tight text-foreground">Italia</span>
                      <span className="text-[10px] text-muted-foreground">ITA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDemoHomeScore(Math.max(0, demoHomeScore - 1))}
                      className="flex size-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-xs font-black transition-all hover:bg-secondary"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-lg font-black">{demoHomeScore}</span>
                    <button
                      type="button"
                      onClick={() => setDemoHomeScore(demoHomeScore + 1)}
                      className="flex size-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-xs font-black transition-all hover:bg-secondary"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="relative flex justify-center py-1">
                  <span className="absolute top-1/2 left-0 right-0 h-px bg-border/20 -translate-y-1/2" />
                  <span className="relative z-10 bg-card px-3 text-[10px] font-black text-muted-foreground tracking-widest uppercase">VS</span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇫🇷</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-tight text-foreground">Francia</span>
                      <span className="text-[10px] text-muted-foreground">FRA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDemoAwayScore(Math.max(0, demoAwayScore - 1))}
                      className="flex size-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-xs font-black transition-all hover:bg-secondary"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-lg font-black">{demoAwayScore}</span>
                    <button
                      type="button"
                      onClick={() => setDemoAwayScore(demoAwayScore + 1)}
                      className="flex size-7 items-center justify-center rounded-lg border border-border bg-secondary/50 text-xs font-black transition-all hover:bg-secondary"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Save CTA */}
              <button
                type="button"
                onClick={user ? onEnter : onShowLogin}
                className="mt-4 flex w-full h-11 items-center justify-center gap-1.5 rounded-2xl bg-secondary/80 text-xs font-bold text-foreground border border-border/60 hover:bg-secondary transition-all"
              >
                {user ? 'Salva Pronostico' : 'Accedi per Pronosticare'}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Caratteristiche Principali</h2>
            <p className="text-muted-foreground text-sm max-w-lg">NetScore è stato progettato per regalarti un'esperienza immersiva e competitiva durante tutto il torneo.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative rounded-3xl border border-border bg-card/45 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/70 hover:shadow-xl">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Trophy className="size-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Classifiche in Tempo Reale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Le classifiche si aggiornano istantaneamente tramite WebSockets. Guarda i tuoi punti salire live a ogni gol segnato.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-3xl border border-border bg-card/45 p-6 backdrop-blur-sm transition-all hover:border-neon-green/30 hover:bg-card/70 hover:shadow-xl">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-neon-green/10 text-neon-green group-hover:scale-110 transition-transform">
                <Users className="size-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Crea & Unisciti alle Leghe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Genera un codice d'invito unico, invita i tuoi amici o colleghi e crea la tua lega privata con un tabellone classificato dedicato.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-3xl border border-border bg-card/45 p-6 backdrop-blur-sm transition-all hover:border-neon-magenta/30 hover:bg-card/70 hover:shadow-xl">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-neon-magenta/10 text-neon-magenta group-hover:scale-110 transition-transform">
                <Award className="size-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Punteggi Dinamici</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guadagna punti indovinando il risultato esatto, l'esito finale (1X2) o la differenza reti del match. Ogni punto fa la differenza.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/10 bg-secondary/10 py-10 mt-16">
        <div className="mx-auto max-w-7xl px-6 text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            NetScore &copy; {new Date().getFullYear()} — Creato con passione per il calcio.
          </p>
          <div className="flex justify-center gap-2 text-[10px] text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
            <ShieldAlert className="size-3.5 shrink-0" />
            <p>
              Disclaimer: NetScore è una piattaforma di pronostici sportivi amatoriale non affiliata a FIFA o ad alcun organismo ufficiale.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
