import { 
  getLiveMatches, 
  getUpcomingMatches, 
  getTeamCornerStats,
  getH2HStats,
  formatMatchForAnalysis,
  LEAGUES
} from '../../lib/football-api';
import { 
  batchPredictCorners, 
  generateDemoPrediction 
} from '../../lib/prediction-engine';

export const config = {
  api: {
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode = 'live', matchIds } = req.method === 'POST' 
    ? req.body 
    : req.query;

  // Demo mode if no API keys configured
  if (!process.env.ANTHROPIC_API_KEY || !process.env.RAPIDAPI_KEY) {
    const demoPredictions = generateDemoPrediction();
    return res.status(200).json({
      ...demoPredictions,
      notice: 'Running in DEMO MODE. Add ANTHROPIC_API_KEY and RAPIDAPI_KEY environment variables for live predictions.',
    });
  }

  try {
    // Step 1: Fetch matches
    let rawMatches = [];
    
    if (mode === 'live') {
      rawMatches = await getLiveMatches();
      // Filter to supported leagues
      rawMatches = rawMatches.filter(m => 
        Object.keys(LEAGUES).includes(String(m.league?.id))
      ).slice(0, 8);
    } else {
      rawMatches = await getUpcomingMatches();
      rawMatches = rawMatches.slice(0, 10);
    }

    if (rawMatches.length === 0) {
      // No live matches — return demo with notice
      const demoPredictions = generateDemoPrediction();
      return res.status(200).json({
        ...demoPredictions,
        notice: mode === 'live' 
          ? 'No live matches found in top leagues right now. Showing sample predictions.'
          : 'No upcoming matches found. Showing sample predictions.',
      });
    }

    // Step 2: Enrich matches with team stats & H2H
    const enrichedMatches = [];
    
    for (const fixture of rawMatches.slice(0, 6)) {
      const homeId = fixture.teams?.home?.id;
      const awayId = fixture.teams?.away?.id;
      const leagueId = fixture.league?.id;
      
      const [homeStats, awayStats, h2h] = await Promise.allSettled([
        getTeamCornerStats(homeId, leagueId),
        getTeamCornerStats(awayId, leagueId),
        getH2HStats(homeId, awayId),
      ]);
      
      const formatted = formatMatchForAnalysis(
        fixture,
        homeStats.status === 'fulfilled' ? homeStats.value : null,
        awayStats.status === 'fulfilled' ? awayStats.value : null,
        h2h.status === 'fulfilled' ? h2h.value : [],
      );
      
      enrichedMatches.push(formatted);
      
      // Rate limiting delay
      await new Promise(r => setTimeout(r, 200));
    }

    // Step 3: AI prediction
    const predictions = await batchPredictCorners(enrichedMatches);

    return res.status(200).json({
      ...predictions,
      matchCount: enrichedMatches.length,
      mode,
    });

  } catch (error) {
    console.error('Prediction pipeline error:', error);
    
    // Graceful fallback to demo
    const demoPredictions = generateDemoPrediction();
    return res.status(200).json({
      ...demoPredictions,
      notice: `Live prediction encountered an error. Showing demo data. Error: ${error.message}`,
    });
  }
}
