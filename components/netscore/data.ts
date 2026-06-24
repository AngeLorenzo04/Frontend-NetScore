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

export function getTeamByName(name: string): Team {
  const normalized = name.trim().toLowerCase();
  
  const mapping: Record<string, { short: string, flag: string, color: string }> = {
    'argentina': { short: 'ARG', flag: '🇦🇷', color: '#75AADB' },
    'france': { short: 'FRA', flag: '🇫🇷', color: '#0055A4' },
    'brazil': { short: 'BRA', flag: '🇧🇷', color: '#009C3B' },
    'spain': { short: 'ESP', flag: '🇪🇸', color: '#C60B1E' },
    'england': { short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF142B' },
    'portugal': { short: 'POR', flag: '🇵🇹', color: '#006600' },
    'germany': { short: 'GER', flag: '🇩🇪', color: '#DD0000' },
    'netherlands': { short: 'NED', flag: '🇳🇱', color: '#AE1C28' },
    'usa': { short: 'USA', flag: '🇺🇸', color: '#3C3B6E' },
    'united states': { short: 'USA', flag: '🇺🇸', color: '#3C3B6E' },
    'mexico': { short: 'MEX', flag: '🇲🇽', color: '#006847' },
    'italy': { short: 'ITA', flag: '🇮🇹', color: '#0066B2' },
    'south africa': { short: 'RSA', flag: '🇿🇦', color: '#007A4D' },
    'south korea': { short: 'KOR', flag: '🇰🇷', color: '#C21E2E' },
    'czechia': { short: 'CZE', flag: '🇨🇿', color: '#11457E' },
    'canada': { short: 'CAN', flag: '🇨🇦', color: '#FF0000' },
    'japan': { short: 'JPN', flag: '🇯🇵', color: '#000080' },
    'australia': { short: 'AUS', flag: '🇦🇺', color: '#00008F' },
    'morocco': { short: 'MAR', flag: '🇲🇦', color: '#C1272D' },
    'croatia': { short: 'CRO', flag: '🇭🇷', color: '#FF0000' },
    'senegal': { short: 'SEN', flag: '🇸🇳', color: '#00A35C' },
    'uruguay': { short: 'URU', flag: '🇺🇾', color: '#55B355' },
    'switzerland': { short: 'SUI', flag: '🇨🇭', color: '#D52B1E' },
    'belgium': { short: 'BEL', flag: '🇧🇪', color: '#E30613' },
    'denmark': { short: 'DEN', flag: '🇩🇰', color: '#C60C30' },
    'sweden': { short: 'SWE', flag: '🇸🇪', color: '#006AA7' },
    'poland': { short: 'POL', flag: '🇵🇱', color: '#DC143C' },
    'ukraine': { short: 'UKR', flag: '🇺🇦', color: '#FFD700' },
    'turkey': { short: 'TUR', flag: '🇹🇷', color: '#E30A17' },
    'saudi arabia': { short: 'KSA', flag: '🇸🇦', color: '#006C35' },
    'egypt': { short: 'EGY', flag: '🇪🇬', color: '#C09300' },
    'nigeria': { short: 'NGA', flag: '🇳🇬', color: '#008751' },
    'cameroon': { short: 'CMR', flag: '🇨🇲', color: '#43B02A' },
    'ghana': { short: 'GHA', flag: '🇬🇭', color: '#FFD900' },
    'colombia': { short: 'COL', flag: '🇨🇴', color: '#FCD116' },
    'chile': { short: 'CHI', flag: '🇨🇱', color: '#0039A6' },
    'ecuador': { short: 'ECU', flag: '🇪🇨', color: '#FFDD00' },
    'peru': { short: 'PER', flag: '🇵🇪', color: '#D91023' },
    'costa rica': { short: 'CRC', flag: '🇨🇷', color: '#001E62' },
    'jamaica': { short: 'JAM', flag: '🇯🇲', color: '#009739' },
    'panama': { short: 'PAN', flag: '🇵🇦', color: '#005293' },
    'honduras': { short: 'HON', flag: '🇭🇳', color: '#00BCB4' },
    'new zealand': { short: 'NZL', flag: '🇳🇿', color: '#00247D' },
    'bosnia-herzegovina': { short: 'BIH', flag: '🇧🇦', color: '#002F6C' },
    'paraguay': { short: 'PAR', flag: '🇵🇾', color: '#D91818' },
    'qatar': { short: 'QAT', flag: '🇶🇦', color: '#8A1538' },
    'haiti': { short: 'HAI', flag: '🇭🇹', color: '#00209F' },
    'scotland': { short: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#005EB8' },
    'curaçao': { short: 'CUW', flag: '🇨🇼', color: '#002B7F' },
    'ivory coast': { short: 'CIV', flag: '🇨🇮', color: '#FF8200' },
    'tunisia': { short: 'TUN', flag: '🇹🇳', color: '#E70013' },
    'cape verde islands': { short: 'CPV', flag: '🇨🇻', color: '#003893' },
    'cape verde': { short: 'CPV', flag: '🇨🇻', color: '#003893' },
    'iran': { short: 'IRN', flag: '🇮🇷', color: '#239F40' },
    'iraq': { short: 'IRQ', flag: '🇮🇶', color: '#007A3D' },
    'norway': { short: 'NOR', flag: '🇳🇴', color: '#EF2B2D' },
    'algeria': { short: 'ALG', flag: '🇩🇿', color: '#006233' },
    'austria': { short: 'AUT', flag: '🇦🇹', color: '#ED2939' },
    'jordan': { short: 'JOR', flag: '🇯🇴', color: '#1A1A1A' },
    'congo dr': { short: 'COD', flag: '🇨🇩', color: '#007FFF' },
    'uzbekistan': { short: 'UZB', flag: '🇺🇿', color: '#0099B5' },
  };

  if (mapping[normalized]) {
    return {
      name,
      ...mapping[normalized]
    };
  }

  // Fallback for unknown teams
  const short = name.slice(0, 3).toUpperCase();
  return {
    name,
    short,
    flag: '⚽',
    color: '#A0AEC0'
  };
}

function getVenueForTeam(name: string): string {
  const venues: Record<string, string> = {
    'Mexico': 'Estadio Azteca, MX',
    'USA': 'MetLife Stadium, NJ',
    'Canada': 'BC Place, Vancouver',
    'Argentina': 'SoFi Stadium, LA',
    'France': 'AT&T Stadium, Dallas',
    'Brazil': 'Hard Rock Stadium, Miami',
    'Italy': 'MetLife Stadium, NJ',
    'Germany': 'Mercedes-Benz Stadium, Atlanta',
  };
  return venues[name] || 'FIFA World Cup Stadium';
}

function getStageForMatch(date: Date): string {
  // Simple heuristic: before June 25 is Group Stage
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  if (month === 6 && day <= 25) {
    // Generate Group based on day of week or something
    const groups = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'];
    return groups[date.getDay() % groups.length];
  }
  return 'Ottavi di Finale';
}

function getMatchdayForDate(date: Date): number {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // 1-indexed
  if (month === 6) { // June
    if (day <= 17) return 1;
    if (day <= 24) return 2;
    return 3;
  }
  return 1; // default fallback
}

function formatKickoff(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const matchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = matchDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const timeString = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  
  if (diffDays === 0) {
    return `Oggi · ${timeString}`;
  } else if (diffDays === 1) {
    return `Domani · ${timeString}`;
  } else {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const dayName = dayNames[date.getDay()];
    return `${dayName} ${date.getDate()}/${date.getMonth() + 1} · ${timeString}`;
  }
}

export function mapBackendMatch(backendMatch: any): Match & { status: string, homeGoals: number | null, awayGoals: number | null, prediction: any } {
  const start = new Date(backendMatch.startTime);
  return {
    id: backendMatch.id,
    home: getTeamByName(backendMatch.homeTeam),
    away: getTeamByName(backendMatch.awayTeam),
    kickoff: formatKickoff(start),
    venue: getVenueForTeam(backendMatch.homeTeam),
    stage: getStageForMatch(start),
    matchday: getMatchdayForDate(start),
    status: backendMatch.status,
    homeGoals: backendMatch.homeGoals,
    awayGoals: backendMatch.awayGoals,
    prediction: backendMatch.prediction
  };
}
