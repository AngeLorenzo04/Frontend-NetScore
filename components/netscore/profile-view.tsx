'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { User, Plus, Key, Trophy, LogOut, Check, Copy, AlertCircle, Sparkles, Users, Award, Settings, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface League {
  id: string
  name: string
  code: string
  membersCount: number
  rank: number
  createdBy: string
}

export function ProfileView({
  user = {
    name: 'You',
    email: 'predictor@netscore.com',
    avatar: 'YOU',
    points: 1320,
    leagues: []
  },
  onLogout = () => {},
  onJoinLeague = async () => null,
  onCreateLeague = async () => null,
  onUpdateProfile = async () => null,
}: {
  user?: {
    name: string
    email: string
    avatar: string
    avatarUrl?: string
    points: number
    leagues: League[]
  }
  onLogout?: () => void
  onJoinLeague?: (code: string) => Promise<string | null>
  onCreateLeague?: (name: string) => Promise<string | null>
  onUpdateProfile?: (nickname: string, email: string, password?: string, avatarUrl?: string) => Promise<string | null>
}) {
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [newLeagueName, setNewLeagueName] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editNickname, setEditNickname] = useState(user.name)
  const [editEmail, setEditEmail] = useState(user.email)
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [zoomAvatar, setZoomAvatar] = useState(false)

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editNickname.trim()) {
      setEditError('Il nickname non può essere vuoto')
      return
    }
    if (!editEmail.trim()) {
      setEditError("L'email non può essere vuota")
      return
    }
    const err = await onUpdateProfile(
      editNickname.trim(),
      editEmail.trim(),
      editPassword.trim() ? editPassword.trim() : undefined
    )
    if (err) {
      setEditError(err)
    } else {
      setIsEditing(false)
      setEditPassword('')
      setEditError(null)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      await onUpdateProfile(user.name, user.email, undefined, base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setJoinError('Please enter a valid league code')
      return
    }
    const err = await onJoinLeague(joinCode.trim().toUpperCase())
    if (err) {
      setJoinError(err)
    } else {
      setJoinCode('')
      setJoinError(null)
      setShowJoinForm(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeagueName.trim()) {
      setCreateError('Please enter a league name')
      return
    }
    if (newLeagueName.trim().length < 3) {
      setCreateError('League name must be at least 3 characters')
      return
    }
    const err = await onCreateLeague(newLeagueName.trim())
    if (err) {
      setCreateError(err)
    } else {
      setNewLeagueName('')
      setCreateError(null)
      setShowCreateForm(false)
    }
  }

  return (
    <section className="px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-md flex-col gap-6"
      >
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/75 p-6 shadow-xl backdrop-blur-md">
          <div className="absolute -right-16 -top-16 size-36 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -left-16 -bottom-16 size-36 rounded-full bg-accent/10 blur-2xl" />

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true)
                setEditNickname(user.name)
                setEditEmail(user.email)
                setEditPassword('')
                setEditError(null)
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
              title="Edit Profile"
            >
              <Settings className="size-5" />
            </button>
          )}

          <div className="relative flex flex-col items-center text-center">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="w-full flex flex-col gap-3 text-left">
                <h3 className="text-base font-bold text-foreground">Modifica Profilo</h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nickname</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nuova Password (opzionale)</label>
                  <input
                    type="password"
                    placeholder="Lascia vuoto per non cambiare"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>
                {editError && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-accent mt-0.5">
                    <AlertCircle className="size-3.5" />
                    {editError}
                  </span>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-9 rounded-xl px-4 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.4)]"
                  >
                    Salva
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Avatar with animated glowing rings and zoom functionality */}
                <div className="relative mb-4">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-sm pointer-events-none"
                  />
                  
                  {/* Click avatar to Zoom */}
                  <div
                    onClick={() => setZoomAvatar(true)}
                    className="relative flex size-20 cursor-zoom-in items-center justify-center rounded-full border-2 border-primary bg-secondary overflow-hidden text-2xl font-black text-foreground shadow-[0_0_20px_oklch(0.58_0.23_250_/_0.3)] hover:opacity-90 transition-opacity group"
                    title="Clicca per ingrandire"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      user.avatar
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="size-5 text-white" />
                    </div>
                  </div>

                  {/* Plus badge on bottom-right to upload new image */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 z-20 flex size-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-115 transition-transform"
                    title="Carica nuova foto"
                  >
                    <Plus className="size-3.5" />
                  </label>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>

                {/* Profile Statistics Grid */}
                <div className="mt-6 grid w-full grid-cols-3 gap-3 rounded-2xl border border-border/40 bg-background/50 p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Points</span>
                    <span className="mt-1 text-lg font-black text-primary tabular-nums">
                      {user.points.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-x border-border/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Rank</span>
                    <span className="mt-1 flex items-center gap-0.5 text-lg font-black text-gold">
                      <Award className="size-4 shrink-0 text-gold" />
                      #{user.leagues.find(l => l.code === 'GLOBAL26')?.rank ?? 1}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy</span>
                    <span className="mt-1 flex items-center gap-0.5 text-lg font-black text-neon-cyan">
                      <Sparkles className="size-3.5 text-neon-cyan" />
                      68%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Leagues Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="size-5 text-gold" />
              Your Leagues
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {user.leagues.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {user.leagues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center">
                <Users className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                <p className="text-sm font-medium text-muted-foreground">
                  You are not part of any leagues yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Create a new league or enter a code to join one.
                </p>
              </div>
            ) : (
              user.leagues.map((league) => (
                <motion.div
                  key={league.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-md hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{league.name}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {league.membersCount} {league.membersCount === 1 ? 'member' : 'members'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          Rank: #{league.rank}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-1 text-xs font-mono font-bold tracking-wide">
                        <span className="text-muted-foreground">CODE:</span>
                        <span className="text-foreground">{league.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(league.code)}
                          className="ml-1 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                          title="Copy league code"
                        >
                          {copiedCode === league.code ? (
                            <Check className="size-3 text-primary" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      {league.createdBy === 'You' && (
                        <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                          Creator
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons & Forms */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowJoinForm(!showJoinForm)
                setShowCreateForm(false)
                setJoinError(null)
              }}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all border border-border",
                showJoinForm 
                  ? "bg-secondary text-foreground" 
                  : "bg-card hover:bg-muted text-foreground shadow-sm"
              )}
            >
              <Key className="size-4" />
              Join League
            </button>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                setShowJoinForm(false)
                setCreateError(null)
              }}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all border border-border",
                showCreateForm 
                  ? "bg-secondary text-foreground" 
                  : "bg-card hover:bg-muted text-foreground shadow-sm"
              )}
            >
              <Plus className="size-4" />
              Create League
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showJoinForm && (
              <motion.form
                key="join-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleJoinSubmit}
                className="overflow-hidden rounded-2xl border border-border bg-card/45 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="join-code" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Invite Code
                  </label>
                  <div className="relative">
                    <Key className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="join-code"
                      type="text"
                      placeholder="e.g. GLOBAL26"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-semibold uppercase tracking-wider text-foreground placeholder:normal-case placeholder:font-normal outline-none focus:border-primary"
                    />
                  </div>
                  {joinError && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent mt-0.5">
                      <AlertCircle className="size-3.5" />
                      {joinError}
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false)
                      setJoinCode('')
                      setJoinError(null)
                    }}
                    className="h-9 rounded-xl px-4 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.4)]"
                  >
                    Submit
                  </button>
                </div>
              </motion.form>
            )}

            {showCreateForm && (
              <motion.form
                key="create-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleCreateSubmit}
                className="overflow-hidden rounded-2xl border border-border bg-card/45 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="league-name" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    League Name
                  </label>
                  <div className="relative">
                    <Trophy className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="league-name"
                      type="text"
                      placeholder="e.g. Office Champions"
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-semibold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  {createError && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent mt-0.5">
                      <AlertCircle className="size-3.5" />
                      {createError}
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewLeagueName('')
                      setCreateError(null)
                    }}
                    className="h-9 rounded-xl px-4 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_0_12px_oklch(0.58_0.23_250_/_0.4)]"
                  >
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <motion.button
          type="button"
          onClick={onLogout}
          whileTap={{ scale: 0.98 }}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 text-sm font-bold text-destructive hover:bg-destructive/20 transition-all"
        >
          <LogOut className="size-4" />
          Logout
        </motion.button>

        {/* Brand Disclaimer Footer */}
        <div className="mt-8 border-t border-border/40 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-pretty">
            *Disclaimer: NetScore is an unofficial fan prediction platform. It is not affiliated with, sponsored by, or endorsed by FIFA® or the FIFA World Cup 26™. All match schedules, names, trademarks and logos are the property of their respective owners and are used descriptively for entertainment/editorial purposes.
          </p>
        </div>
      </motion.div>

      {/* Avatar Zoom Overlay Modal */}
      <AnimatePresence>
        {zoomAvatar && (
          <motion.div
            key="own-avatar-zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomAvatar(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full aspect-square rounded-3xl overflow-hidden border border-border bg-card shadow-2xl"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar Ingrandito" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-secondary text-5xl font-black">
                  {user.avatar}
                </div>
              )}
              <button
                type="button"
                onClick={() => setZoomAvatar(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
