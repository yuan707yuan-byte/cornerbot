import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};

// Top leagues monitored globally
export const LEAGUES = {
  // Europe
  39: { name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  140: { name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  135: { name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  78: { name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  61: { name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  94: { name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹' },
  88: { name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱' },
  144: { name: 'Pro League', country: 'Belgium', flag: '🇧🇪' },
  2: { name: 'UEFA Champions League', country: 'Europe', flag: '🇪🇺' },
  3: { name: 'UEFA Europa League', country: 'Europe', flag: '🇪🇺' },
  // Americas
  253: { name: 'MLS', country: 'USA', flag: '🇺🇸' },
  71: { name: 'Brasileirão', country: 'Brazil', flag: '🇧🇷' },
  128: { name: 'Liga Profesional', country: 'Argentina', flag: '🇦🇷' },
  // Asia
  292: { name: 'K League 1', country: 'South Korea', flag: '🇰🇷' },
  98: { name: 'J1 League', country: 'Japan', flag: '🇯🇵' },
  169: { name: 'Saudi Pro League', country: 'Saudi Arabia', flag: '🇸🇦' },
  // Africa
  29: { name: 'CAF Champions League', country: 'Africa', flag: '🌍' },
};

/**
 * Fetch live matches currently being played
 */
export async function getLiveMatches() {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures`, {
      headers,
      params: { live: 'all' },
      timeout: 8000,
    });
    return response.data.response || [];
  } catch (error) {
    console.error('Error fetching live matches:', error.message);
    return [];
  }
}

/**
 * Fetch today's scheduled matches for a specific league
 */
export async function getTodayMatches(leagueId, season = 2024) {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await axios.get(`${BASE_URL}/fixtures`, {
      headers,
      params: { league: leagueId, season, date: today },
      timeout: 8000,
    });
    return response.data.response || [];
  } catch (error) {
    console.error(`Error fetching today matches for league ${leagueId}:`, error.message);
    return [];
  }
}

/**
 * Fetch upcoming fixtures for multiple top leagues
 */
export async function getUpcomingMatches() {
  const topLeagues = [39, 140, 135, 78, 61, 2, 94, 253, 71];
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const results = [];
  
  for (const leagueId of topLeagues.slice(0, 5)) {
    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        headers,
        params: { 
          league: leagueId, 
          season: 2024,
          from: today,
          to: tomorrow,
          status: 'NS'
        },
        timeout: 6000,
      });
      const fixtures = response.data.response || [];
      results.push(...fixtures.slice(0, 3));
    } catch (error) {
      console.error(`League ${leagueId} fetch error:`, error.message);
    }
  }
  
  return results;
}

/**
 * Get team statistics including corner kick averages
 */
export async function getTeamCornerStats(teamId, leagueId, season = 2024) {
  try {
    const response = await axios.get(`${BASE_URL}/teams/statistics`, {
      headers,
      params: { team: teamId, league: leagueId, season },
      timeout: 8000,
    });
    
    const stats = response.data.response;
    if (!stats) return null;
    
    return {
      teamId,
      teamName: stats.team?.name,
      form: stats.form,
      fixtures: stats.fixtures,
      goals: stats.goals,
      averageGoals: {
        for: stats.goals?.for?.average?.total,
        against: stats.goals?.against?.average?.total,
      },
      lineups: stats.lineups,
    };
  } catch (error) {
    console.error(`Error fetching team stats for ${teamId}:`, error.message);
    return null;
  }
}

/**
 * Fetch head-to-head history between two teams
 */
export async function getH2HStats(team1Id, team2Id) {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures/headtohead`, {
      headers,
      params: { h2h: `${team1Id}-${team2Id}`, last: 10 },
      timeout: 8000,
    });
    return response.data.response || [];
  } catch (error) {
    console.error('Error fetching H2H stats:', error.message);
    return [];
  }
}

/**
 * Get fixture statistics (corners, shots, etc.) for a finished match
 */
export async function getFixtureStats(fixtureId) {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures/statistics`, {
      headers,
      params: { fixture: fixtureId },
      timeout: 8000,
    });
    return response.data.response || [];
  } catch (error) {
    console.error(`Error fetching fixture stats for ${fixtureId}:`, error.message);
    return [];
  }
}

/**
 * Get last N matches for a team with statistics
 */
export async function getTeamLastMatches(teamId, count = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures`, {
      headers,
      params: { team: teamId, last: count, status: 'FT' },
      timeout: 8000,
    });
    return response.data.response || [];
  } catch (error) {
    console.error(`Error fetching last matches for team ${teamId}:`, error.message);
    return [];
  }
}

/**
 * Get player injuries for a fixture
 */
export async function getFixtureInjuries(leagueId, season = 2024) {
  try {
    const response = await axios.get(`${BASE_URL}/injuries`, {
      headers,
      params: { league: leagueId, season },
      timeout: 6000,
    });
    return response.data.response || [];
  } catch (error) {
    return [];
  }
}

/**
 * Parse corner kick statistics from fixture stats response
 */
export function extractCornerStats(fixtureStats) {
  if (!fixtureStats || fixtureStats.length === 0) return null;
  
  const homeStats = fixtureStats[0]?.statistics || [];
  const awayStats = fixtureStats[1]?.statistics || [];
  
  const findStat = (stats, type) => {
    const stat = stats.find(s => s.type === type);
    return stat?.value || 0;
  };
  
  return {
    home: {
      corners: findStat(homeStats, 'Corner Kicks'),
      shots: findStat(homeStats, 'Total Shots'),
      shotsOnTarget: findStat(homeStats, 'Shots on Goal'),
      ballPossession: findStat(homeStats, 'Ball Possession'),
    },
    away: {
      corners: findStat(awayStats, 'Corner Kicks'),
      shots: findStat(awayStats, 'Total Shots'),
      shotsOnTarget: findStat(awayStats, 'Shots on Goal'),
      ballPossession: findStat(awayStats, 'Ball Possession'),
    },
    total: {
      corners: findStat(homeStats, 'Corner Kicks') + findStat(awayStats, 'Corner Kicks'),
    }
  };
}

/**
 * Format match data for AI analysis
 */
export function formatMatchForAnalysis(fixture, homeStats, awayStats, h2hData) {
  return {
    matchInfo: {
      league: fixture.league?.name,
      leagueId: fixture.league?.id,
      season: fixture.league?.season,
      date: fixture.fixture?.date,
      venue: fixture.fixture?.venue?.name,
      referee: fixture.fixture?.referee,
    },
    homeTeam: {
      id: fixture.teams?.home?.id,
      name: fixture.teams?.home?.name,
      stats: homeStats,
    },
    awayTeam: {
      id: fixture.teams?.away?.id,
      name: fixture.teams?.away?.name,
      stats: awayStats,
    },
    odds: fixture.odds || null,
    h2h: h2hData?.slice(0, 5).map(match => ({
      date: match.fixture?.date,
      homeGoals: match.goals?.home,
      awayGoals: match.goals?.away,
      homeTeam: match.teams?.home?.name,
      awayTeam: match.teams?.away?.name,
    })) || [],
  };
}
