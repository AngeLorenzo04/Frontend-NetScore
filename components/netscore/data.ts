export type Team = {
  name: string
  short: string
  flag: string
  color: string
}

export type Match = {
  id: string
  home: Team
  away: Team
  kickoff: string
  venue: string
  stage: string
  matchday: number
}

export type LeaderUser = {
  id: string
  name: string
  avatar: string
  points: number
  trend: 'up' | 'down' | 'same'
}

export const TEAMS: Record<string, Team> = {
  ARG: { name: 'Argentina', short: 'ARG', flag: '🇦🇷', color: '#75AADB' },
  FRA: { name: 'France', short: 'FRA', flag: '🇫🇷', color: '#0055A4' },
  BRA: { name: 'Brazil', short: 'BRA', flag: '🇧🇷', color: '#009C3B' },
  ESP: { name: 'Spain', short: 'ESP', flag: '🇪🇸', color: '#C60B1E' },
  ENG: { name: 'England', short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF142B' },
  POR: { name: 'Portugal', short: 'POR', flag: '🇵🇹', color: '#006600' },
  GER: { name: 'Germany', short: 'GER', flag: '🇩🇪', color: '#DD0000' },
  NED: { name: 'Netherlands', short: 'NED', flag: '🇳🇱', color: '#AE1C28' },
  USA: { name: 'USA', short: 'USA', flag: '🇺🇸', color: '#3C3B6E' },
  MEX: { name: 'Mexico', short: 'MEX', flag: '🇲🇽', color: '#006847' },
}

export const UPCOMING_MATCHES: Match[] = [
  {
    id: 'm1',
    home: TEAMS.ARG,
    away: TEAMS.FRA,
    kickoff: 'Today · 20:00',
    venue: 'MetLife Stadium, NJ',
    stage: 'Group A',
    matchday: 1,
  },
  {
    id: 'm2',
    home: TEAMS.BRA,
    away: TEAMS.ESP,
    kickoff: 'Today · 22:30',
    venue: 'SoFi Stadium, LA',
    stage: 'Group C',
    matchday: 1,
  },
  {
    id: 'm3',
    home: TEAMS.ENG,
    away: TEAMS.POR,
    kickoff: 'Tomorrow · 18:00',
    venue: 'AT&T Stadium, Dallas',
    stage: 'Group B',
    matchday: 2,
  },
  {
    id: 'm4',
    home: TEAMS.GER,
    away: TEAMS.NED,
    kickoff: 'Tomorrow · 21:00',
    venue: 'Estadio Azteca, MX',
    stage: 'Group D',
    matchday: 2,
  },
  {
    id: 'm5',
    home: TEAMS.USA,
    away: TEAMS.MEX,
    kickoff: 'Sat · 19:30',
    venue: 'BC Place, Vancouver',
    stage: 'Group F',
    matchday: 3,
  },
]

export const LEADERBOARD: LeaderUser[] = [
  { id: 'u1', name: 'Sofia M.', avatar: 'SM', points: 2480, trend: 'same' },
  { id: 'u2', name: 'Kai R.', avatar: 'KR', points: 2310, trend: 'up' },
  { id: 'u3', name: 'Diego A.', avatar: 'DA', points: 2185, trend: 'down' },
  { id: 'u4', name: 'Amara O.', avatar: 'AO', points: 1990, trend: 'up' },
  { id: 'u5', name: 'Leo P.', avatar: 'LP', points: 1875, trend: 'same' },
  { id: 'u6', name: 'Yuki T.', avatar: 'YT', points: 1740, trend: 'up' },
  { id: 'u7', name: 'Noah B.', avatar: 'NB', points: 1620, trend: 'down' },
  { id: 'u8', name: 'Mia C.', avatar: 'MC', points: 1510, trend: 'same' },
  { id: 'u9', name: 'You', avatar: 'YOU', points: 1320, trend: 'up' },
]
