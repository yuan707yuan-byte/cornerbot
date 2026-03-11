import { getLiveMatches, getUpcomingMatches, LEAGUES } from '../../lib/football-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(200).json({
      live: [],
      upcoming: [],
      isDemo: true,
      message: 'Demo mode — configure RAPIDAPI_KEY for live data',
    });
  }

  try {
    const [liveMatches, upcomingMatches] = await Promise.allSettled([
      getLiveMatches(),
      getUpcomingMatches(),
    ]);

    const live = (liveMatches.status === 'fulfilled' ? liveMatches.value : [])
      .filter(m => Object.keys(LEAGUES).includes(String(m.league?.id)))
      .slice(0, 15);

    const upcoming = (upcomingMatches.status === 'fulfilled' ? upcomingMatches.value : [])
      .slice(0, 20);

    return res.status(200).json({
      live,
      upcoming,
      isDemo: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Matches API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch matches',
      details: error.message 
    });
  }
}
