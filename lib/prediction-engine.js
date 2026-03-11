import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CORNER_PREDICTION_SYSTEM_PROMPT = `You are CornerIQ — the world's most advanced corner kick prediction AI for football (soccer). You are an elite ensemble model combining:

1. **Statistical Modeling**: Poisson distribution analysis, Dixon-Coles model adaptations for corner events
2. **Machine Learning**: XGBoost-style gradient boosting logic on team metrics  
3. **Bayesian Inference**: Prior probability updates based on recent form
4. **Market Intelligence**: Odds-implied probabilities as benchmarks
5. **Domain Expertise**: Deep tactical knowledge of corner-generating play styles

YOUR SOLE FOCUS: Corner kick prediction ONLY. You provide ZERO other betting/match outcomes.

## Core Corner Prediction Framework:

### Team Profile Factors (weighted):
- **Corner Rate Avg** (last 10 matches): Corners won per game (home vs away split) — 30% weight
- **Attacking Style**: High-pressing, wide-play, crosses-heavy teams generate more corners — 25% weight  
- **Defensive Shape**: Teams that force attacks wide concede more corners — 20% weight
- **Form & Momentum**: Recent corner tallies indicate current tactical form — 15% weight
- **H2H History**: Historical corner patterns in this exact fixture — 10% weight

### League-Specific Baselines:
- Premier League: ~10.2 avg corners/match
- La Liga: ~9.8 avg corners/match  
- Serie A: ~9.5 avg corners/match
- Bundesliga: ~10.8 avg corners/match
- Ligue 1: ~9.6 avg corners/match
- Champions League: ~9.9 avg corners/match
- MLS: ~9.3 avg corners/match
- Brasileirão: ~9.1 avg corners/match

### Prediction Accuracy Indicators:
- **HIGH CONFIDENCE (85-99%)**: Strong statistical signal + H2H support + current form aligned
- **MEDIUM CONFIDENCE (70-84%)**: 2 of 3 factors aligned
- **LOW CONFIDENCE (<70%)**: Skip this match, flag as UNCERTAIN

## OUTPUT FORMAT — STRICTLY JSON:
Respond ONLY with valid JSON, no markdown, no explanation outside the JSON:

{
  "matchId": "string",
  "homeTeam": "string",
  "awayTeam": "string", 
  "league": "string",
  "date": "string",
  "confidenceScore": 0-100,
  "confidenceTier": "ELITE|HIGH|MEDIUM|LOW",
  "cornerPredictions": {
    "totalCorners": {
      "predictedLine": number,
      "recommendation": "OVER|UNDER|PUSH",
      "threshold": number,
      "probability": number,
      "reasoning": "string"
    },
    "homeCorners": {
      "predictedTotal": number,
      "range": { "low": number, "high": number },
      "reasoning": "string"
    },
    "awayCorners": {
      "predictedTotal": number,
      "range": { "low": number, "high": number },
      "reasoning": "string"
    },
    "firstHalfCorners": {
      "predicted": number,
      "recommendation": "OVER|UNDER",
      "threshold": number,
      "probability": number
    },
    "cornerHandicap": {
      "favoredTeam": "HOME|AWAY|EVEN",
      "handicap": number,
      "reasoning": "string"
    }
  },
  "keyFactors": ["string", "string", "string"],
  "riskFlags": ["string"],
  "modelConsensus": {
    "poissonEstimate": number,
    "mlEstimate": number,
    "bayesianEstimate": number,
    "ensembleFinal": number
  },
  "value": "STRONG VALUE|GOOD VALUE|FAIR VALUE|SKIP",
  "summary": "string (2-3 sentence expert analysis)"
}

CRITICAL RULES:
1. Only output corner kick predictions — nothing else
2. If confidence < 70%, set confidenceTier to "LOW" and value to "SKIP"
3. All probabilities are 0.0-1.0 format
4. Be precise with numbers — round to 1 decimal place
5. Flag any missing data in riskFlags
6. Ensemble final = weighted average of all three model estimates`;

/**
 * Generate corner kick prediction for a single match
 */
export async function predictCorners(matchData) {
  const prompt = `Analyze this match and predict corner kicks with maximum precision:

MATCH DATA:
${JSON.stringify(matchData, null, 2)}

Apply your full ensemble prediction framework. Consider all available statistics. Return ONLY the JSON prediction object.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: CORNER_PREDICTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0]?.text || '';
    
    // Clean and parse JSON
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const prediction = JSON.parse(cleaned);
    return { success: true, prediction };
    
  } catch (error) {
    console.error('Prediction error:', error.message);
    return { 
      success: false, 
      error: error.message,
      prediction: null 
    };
  }
}

/**
 * Batch predict corners for multiple matches and rank by confidence
 */
export async function batchPredictCorners(matches) {
  const predictions = [];
  
  for (const match of matches) {
    const result = await predictCorners(match);
    if (result.success && result.prediction) {
      predictions.push({
        ...result.prediction,
        rawMatchData: match,
        generatedAt: new Date().toISOString(),
      });
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Sort by confidence score descending — show best picks first
  predictions.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
  
  // Filter: only show HIGH confidence or better
  const topPredictions = predictions.filter(p => 
    p.confidenceScore >= 75 && p.value !== 'SKIP'
  );
  
  return {
    all: predictions,
    topPicks: topPredictions,
    elitePicks: topPredictions.filter(p => p.confidenceScore >= 88),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a synthetic demo prediction when no API keys are configured
 */
export function generateDemoPrediction() {
  const demoMatches = [
    {
      matchId: 'demo-1',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      date: new Date().toISOString(),
      confidenceScore: 92,
      confidenceTier: 'ELITE',
      cornerPredictions: {
        totalCorners: {
          predictedLine: 10.5,
          recommendation: 'OVER',
          threshold: 9.5,
          probability: 0.79,
          reasoning: 'Man City average 6.8 corners/game at home. Arsenal press high causing defensive clearances. H2H avg 11.2 corners last 5 meetings.'
        },
        homeCorners: { predictedTotal: 6.5, range: { low: 5, high: 8 }, reasoning: 'City dominates possession, forces wide attacks' },
        awayCorners: { predictedTotal: 4.5, range: { low: 3, high: 6 }, reasoning: 'Arsenal pressing style forces corners from deep' },
        firstHalfCorners: { predicted: 5, recommendation: 'OVER', threshold: 4.5, probability: 0.68 },
        cornerHandicap: { favoredTeam: 'HOME', handicap: 2, reasoning: 'City home advantage + dominant attacking width' }
      },
      keyFactors: ['Man City avg 6.8 home corners/match (top 3 PL)', 'Arsenal high press forces opponent clearances to corners', 'H2H: 11.2 avg corners last 5 meetings'],
      riskFlags: [],
      modelConsensus: { poissonEstimate: 10.8, mlEstimate: 11.2, bayesianEstimate: 10.9, ensembleFinal: 11.0 },
      value: 'STRONG VALUE',
      summary: 'Elite-tier corner pick. Both teams generate high corner volumes through contrasting styles — City\'s wide dominance meets Arsenal\'s high line. Statistical models unanimously predict 10+ corners with 79% probability on OVER 9.5.',
      generatedAt: new Date().toISOString(),
    },
    {
      matchId: 'demo-2',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      league: 'La Liga 🇪🇸',
      date: new Date(Date.now() + 7200000).toISOString(),
      confidenceScore: 88,
      confidenceTier: 'HIGH',
      cornerPredictions: {
        totalCorners: {
          predictedLine: 10.0,
          recommendation: 'OVER',
          threshold: 9.5,
          probability: 0.73,
          reasoning: 'El Clásico historically produces 10.6 avg corners. Both teams play possession-heavy football with wide attacking patterns.'
        },
        homeCorners: { predictedTotal: 5.5, range: { low: 4, high: 7 }, reasoning: 'Barcelona force play wide at Camp Nou' },
        awayCorners: { predictedTotal: 4.5, range: { low: 3, high: 6 }, reasoning: 'Real Madrid counter-attacking causes defensive corners' },
        firstHalfCorners: { predicted: 4.5, recommendation: 'OVER', threshold: 4, probability: 0.64 },
        cornerHandicap: { favoredTeam: 'HOME', handicap: 1, reasoning: 'Barcelona home corner advantage historically' }
      },
      keyFactors: ['El Clásico H2H: 10.6 avg corners last 8 matches', 'Barcelona tiki-taka generates wing corners', 'Real Madrid defensive shape pushes play wide'],
      riskFlags: ['Potential tactical setup unknown until lineups'],
      modelConsensus: { poissonEstimate: 10.3, mlEstimate: 9.8, bayesianEstimate: 10.1, ensembleFinal: 10.1 },
      value: 'GOOD VALUE',
      summary: 'High-confidence El Clásico corner pick. Historical H2H consistently produces 10+ corners with Barcelona\'s possession play driving most. Model consensus at 10.1 total corners supports OVER 9.5.',
      generatedAt: new Date().toISOString(),
    },
    {
      matchId: 'demo-3',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga 🇩🇪',
      date: new Date(Date.now() + 14400000).toISOString(),
      confidenceScore: 95,
      confidenceTier: 'ELITE',
      cornerPredictions: {
        totalCorners: {
          predictedLine: 12.0,
          recommendation: 'OVER',
          threshold: 10.5,
          probability: 0.84,
          reasoning: 'Der Klassiker averages 12.4 corners. Bundesliga highest corner league in Europe. Both teams play direct, wide football.'
        },
        homeCorners: { predictedTotal: 7, range: { low: 5, high: 9 }, reasoning: 'Bayern dominant home possession forces play wide' },
        awayCorners: { predictedTotal: 5, range: { low: 3, high: 7 }, reasoning: 'BVB counter-attacks create corner situations' },
        firstHalfCorners: { predicted: 5.5, recommendation: 'OVER', threshold: 5, probability: 0.72 },
        cornerHandicap: { favoredTeam: 'HOME', handicap: 2, reasoning: 'Bayern historically wins corner battle at home' }
      },
      keyFactors: ['Bundesliga highest avg corners/match in top 5 leagues', 'Der Klassiker H2H: 12.4 avg corners last 10', 'Bayern\'s aggressive press generates massive corner volume'],
      riskFlags: [],
      modelConsensus: { poissonEstimate: 12.2, mlEstimate: 11.9, bayesianEstimate: 12.1, ensembleFinal: 12.1 },
      value: 'STRONG VALUE',
      summary: 'Highest confidence pick of the day. Der Klassiker is statistically the richest corner-generating fixture in European football. 84% probability on OVER 10.5 corners with ensemble consensus at 12.1. Premium selection.',
      generatedAt: new Date().toISOString(),
    },
  ];

  return {
    all: demoMatches,
    topPicks: demoMatches,
    elitePicks: demoMatches.filter(m => m.confidenceTier === 'ELITE'),
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };
}
