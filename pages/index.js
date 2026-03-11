import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ─── Confidence Tier Config ──────────────────────────────────────────────────
const TIER_CONFIG = {
  ELITE: { color: '#00ff88', bg: 'rgba(0,255,136,0.08)', label: 'ELITE', icon: '◆' },
  HIGH: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', label: 'HIGH', icon: '▲' },
  MEDIUM: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', label: 'MED', icon: '●' },
  LOW: { color: '#6b7280', bg: 'rgba(107,114,128,0.06)', label: 'LOW', icon: '▼' },
};

const VALUE_CONFIG = {
  'STRONG VALUE': { color: '#00ff88', label: 'STRONG VALUE' },
  'GOOD VALUE': { color: '#0ea5e9', label: 'GOOD VALUE' },
  'FAIR VALUE': { color: '#f97316', label: 'FAIR VALUE' },
  'SKIP': { color: '#6b7280', label: 'SKIP' },
};

// ─── Confidence Ring SVG ─────────────────────────────────────────────────────
function ConfidenceRing({ score, tier }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.MEDIUM;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
      <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
        <circle
          cx="45" cy="45" r={radius} fill="none"
          stroke={config.color} strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${config.color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: config.color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: config.color, opacity: 0.7 }}>%</span>
      </div>
    </div>
  );
}

// ─── Corner Bar ───────────────────────────────────────────────────────────────
function CornerBar({ home, away, homeTeam, awayTeam }) {
  const total = home + away;
  const homeWidth = total > 0 ? (home / total) * 100 : 50;

  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#0ea5e9' }}>
          {homeTeam?.split(' ').slice(-1)[0]} <strong>{home}</strong>
        </span>
        <span style={{ fontFamily: 'Rajdhani', fontSize: 10, color: '#3d6080', letterSpacing: 2 }}>CORNERS</span>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#f97316' }}>
          <strong>{away}</strong> {awayTeam?.split(' ').slice(-1)[0]}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${homeWidth}%`,
          background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
          borderRadius: '3px 0 0 3px',
          boxShadow: '0 0 8px rgba(14,165,233,0.5)',
          transition: 'width 1.2s ease',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, height: '100%',
          width: `${100 - homeWidth}%`,
          background: 'linear-gradient(90deg, #ea580c, #f97316)',
          borderRadius: '0 3px 3px 0',
          boxShadow: '0 0 8px rgba(249,115,22,0.5)',
        }} />
      </div>
    </div>
  );
}

// ─── Prediction Card ─────────────────────────────────────────────────────────
function PredictionCard({ prediction, index }) {
  const [expanded, setExpanded] = useState(false);
  const tier = TIER_CONFIG[prediction.confidenceTier] || TIER_CONFIG.MEDIUM;
  const value = VALUE_CONFIG[prediction.value] || VALUE_CONFIG['FAIR VALUE'];
  const cp = prediction.cornerPredictions;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(6,15,25,0.95) 0%, rgba(5,13,20,0.98) 100%)',
        border: `1px solid ${tier.color}22`,
        borderLeft: `3px solid ${tier.color}`,
        borderRadius: 8,
        padding: '20px',
        marginBottom: 16,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        animation: `slide-up 0.4s ease ${index * 0.1}s both`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)`,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${tier.color}44`;
        e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${tier.color}10`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${tier.color}22`;
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)`;
      }}
    >
      {/* Scan line effect */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${tier.color}33, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
        <ConfidenceRing score={prediction.confidenceScore} tier={prediction.confidenceTier} />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* League badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: 'Share Tech Mono', fontSize: 10, letterSpacing: 2,
              color: '#3d6080', textTransform: 'uppercase',
            }}>
              {prediction.league}
            </span>
            <span style={{
              background: tier.bg, color: tier.color, padding: '1px 8px',
              borderRadius: 3, fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
              letterSpacing: 1, border: `1px solid ${tier.color}33`,
            }}>
              {tier.icon} {tier.label}
            </span>
          </div>
          
          {/* Match title */}
          <h3 style={{
            fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1,
            color: '#e2f0ff', lineHeight: 1, marginBottom: 4,
          }}>
            {prediction.homeTeam} <span style={{ color: '#3d6080' }}>vs</span> {prediction.awayTeam}
          </h3>
          
          {/* Date */}
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#3d6080' }}>
            {prediction.date ? new Date(prediction.date).toLocaleString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }) : '—'}
          </div>
        </div>

        {/* Value badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            color: value.color, fontFamily: 'Rajdhani', fontWeight: 700,
            fontSize: 12, letterSpacing: 1, border: `1px solid ${value.color}44`,
            padding: '4px 10px', borderRadius: 4, background: `${value.color}0a`,
            marginBottom: 4,
          }}>
            {value.label}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080' }}>
            {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
          </div>
        </div>
      </div>

      {/* Corner bar */}
      {cp?.homeCorners && cp?.awayCorners && (
        <CornerBar
          home={cp.homeCorners.predictedTotal}
          away={cp.awayCorners.predictedTotal}
          homeTeam={prediction.homeTeam}
          awayTeam={prediction.awayTeam}
        />
      )}

      {/* Main prediction pill */}
      {cp?.totalCorners && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          marginTop: 10, padding: '10px 14px',
          background: 'rgba(0,0,0,0.3)', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#3d6080', letterSpacing: 2 }}>
              TOTAL CORNERS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{
                fontFamily: 'Bebas Neue', fontSize: 28,
                color: cp.totalCorners.recommendation === 'OVER' ? '#00ff88' : '#f97316',
                lineHeight: 1, textShadow: cp.totalCorners.recommendation === 'OVER' 
                  ? '0 0 20px rgba(0,255,136,0.5)' : '0 0 20px rgba(249,115,22,0.5)',
              }}>
                {cp.totalCorners.recommendation} {cp.totalCorners.threshold}
              </span>
              <span style={{
                fontFamily: 'Rajdhani', fontSize: 13, color: '#7aa0bf',
              }}>
                Predicted: <strong style={{ color: '#e2f0ff' }}>{cp.totalCorners.predictedLine}</strong>
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#3d6080' }}>PROBABILITY</div>
            <div style={{
              fontFamily: 'Bebas Neue', fontSize: 26, lineHeight: 1,
              color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.4)',
            }}>
              {Math.round((cp.totalCorners.probability || 0) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16 }}>
          
          {/* Model consensus */}
          {prediction.modelConsensus && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, letterSpacing: 2, color: '#3d6080', marginBottom: 8 }}>
                ── MODEL CONSENSUS ──
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'POISSON', value: prediction.modelConsensus.poissonEstimate, color: '#0ea5e9' },
                  { label: 'ML/XGB', value: prediction.modelConsensus.mlEstimate, color: '#a855f7' },
                  { label: 'BAYES', value: prediction.modelConsensus.bayesianEstimate, color: '#f97316' },
                  { label: 'ENSEMBLE', value: prediction.modelConsensus.ensembleFinal, color: '#00ff88' },
                ].map(({ label, value: val, color }) => (
                  <div key={label} style={{
                    background: `${color}08`, border: `1px solid ${color}22`,
                    borderRadius: 6, padding: '8px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, color, lineHeight: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* First half + handicap */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {cp?.firstHalfCorners && (
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080', letterSpacing: 1, marginBottom: 4 }}>
                  1ST HALF CORNERS
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#e2f0ff' }}>
                  {cp.firstHalfCorners.recommendation} {cp.firstHalfCorners.threshold}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#7aa0bf' }}>
                  {Math.round((cp.firstHalfCorners.probability || 0) * 100)}% prob
                </div>
              </div>
            )}
            {cp?.cornerHandicap && (
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080', letterSpacing: 1, marginBottom: 4 }}>
                  CORNER HANDICAP
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#0ea5e9' }}>
                  {cp.cornerHandicap.favoredTeam === 'HOME' ? prediction.homeTeam?.split(' ').slice(-1)[0] :
                   cp.cornerHandicap.favoredTeam === 'AWAY' ? prediction.awayTeam?.split(' ').slice(-1)[0] : 'EVEN'}
                  {cp.cornerHandicap.handicap > 0 ? ` -${cp.cornerHandicap.handicap}` : ''}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#7aa0bf' }}>
                  corner advantage
                </div>
              </div>
            )}
          </div>

          {/* Key factors */}
          {prediction.keyFactors?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, letterSpacing: 2, color: '#3d6080', marginBottom: 8 }}>
                ── KEY FACTORS ──
              </div>
              {prediction.keyFactors.map((factor, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, marginBottom: 4,
                  fontFamily: 'Rajdhani', fontSize: 13, color: '#7aa0bf',
                }}>
                  <span style={{ color: '#00ff88', flexShrink: 0 }}>▶</span>
                  {factor}
                </div>
              ))}
            </div>
          )}

          {/* Risk flags */}
          {prediction.riskFlags?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, letterSpacing: 2, color: '#f97316', marginBottom: 6 }}>
                ── RISK FLAGS ──
              </div>
              {prediction.riskFlags.map((flag, i) => (
                <div key={i} style={{
                  fontFamily: 'Rajdhani', fontSize: 12, color: '#f97316',
                  opacity: 0.8, display: 'flex', gap: 6,
                }}>
                  <span>⚠</span> {flag}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {prediction.summary && (
            <div style={{
              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)',
              borderRadius: 6, padding: '10px 14px',
              fontFamily: 'Rajdhani', fontSize: 14, color: '#b8d4ec', lineHeight: 1.5,
            }}>
              <span style={{ color: '#00ff88', marginRight: 6 }}>◈</span>
              {prediction.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ predictions }) {
  const total = predictions?.length || 0;
  const elite = predictions?.filter(p => p.confidenceTier === 'ELITE').length || 0;
  const high = predictions?.filter(p => p.confidenceTier === 'HIGH').length || 0;
  const strongValue = predictions?.filter(p => p.value === 'STRONG VALUE').length || 0;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24,
    }}>
      {[
        { label: 'TOTAL PICKS', value: total, color: '#e2f0ff' },
        { label: 'ELITE TIER', value: elite, color: '#00ff88' },
        { label: 'HIGH TIER', value: high, color: '#0ea5e9' },
        { label: 'STRONG VALUE', value: strongValue, color: '#fbbf24' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          background: 'rgba(6,15,25,0.8)', borderRadius: 8, padding: '14px',
          border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080', letterSpacing: 2, marginTop: 2 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('live');
  const [notice, setNotice] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const fetchPredictions = useCallback(async (selectedMode) => {
    setLoading(true);
    setError(null);
    setPredictions(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/predict?mode=${selectedMode}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPredictions(data.topPicks || data.all || []);
        setIsDemo(data.isDemo || false);
        if (data.notice) setNotice(data.notice);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredPredictions = predictions?.filter(p => {
    if (filter === 'elite') return p.confidenceTier === 'ELITE';
    if (filter === 'high') return ['ELITE', 'HIGH'].includes(p.confidenceTier);
    if (filter === 'value') return ['STRONG VALUE', 'GOOD VALUE'].includes(p.value);
    return true;
  }) || [];

  return (
    <>
      <Head>
        <title>CornerIQ — AI Corner Kick Predictor</title>
        <meta name="description" content="AI-powered corner kick predictions for global football leagues" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>" />
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header style={{ paddingTop: 40, paddingBottom: 32, borderBottom: '1px solid rgba(0,255,136,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: 'Share Tech Mono', fontSize: 11, color: '#00ff88',
                letterSpacing: 4, marginBottom: 4,
              }}>
                ⚽ CORNER KICK INTELLIGENCE SYSTEM v2.0
              </div>
              <h1 style={{
                fontFamily: 'Bebas Neue', fontSize: 64, letterSpacing: 3,
                color: '#e2f0ff', lineHeight: 0.9, marginBottom: 8,
                textShadow: '0 0 40px rgba(0,255,136,0.1)',
              }}>
                CORNER<span style={{ color: '#00ff88' }}>IQ</span>
              </h1>
              <p style={{
                fontFamily: 'Rajdhani', fontSize: 14, color: '#3d6080',
                letterSpacing: 1, maxWidth: 400,
              }}>
                Ensemble AI · Poisson + XGBoost + Bayesian · Global Coverage
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'Share Tech Mono', fontSize: 18, color: '#00ff88',
                textShadow: '0 0 10px rgba(0,255,136,0.4)',
              }}>
                {currentTime}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#3d6080', marginTop: 2 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              {predictions && (
                <div className="live-indicator" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <div className="live-dot" />
                  <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#00ff88' }}>
                    {isDemo ? 'DEMO' : 'LIVE'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Leagues ticker */}
          <div style={{
            marginTop: 20, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.03)',
            display: 'flex', gap: 16, overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {['PL 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'La Liga 🇪🇸', 'Serie A 🇮🇹', 'Bundesliga 🇩🇪', 'Ligue 1 🇫🇷', 'UCL 🇪🇺', 'MLS 🇺🇸', 'Brasileirão 🇧🇷', 'J1 🇯🇵', 'K League 🇰🇷'].map(l => (
              <span key={l} style={{
                fontFamily: 'Share Tech Mono', fontSize: 10, color: '#3d6080',
                whiteSpace: 'nowrap', letterSpacing: 1,
              }}>
                {l}
              </span>
            ))}
          </div>
        </header>

        {/* ── Controls ───────────────────────────────────────────────── */}
        <div style={{ padding: '24px 0', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Mode buttons */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(6,15,25,0.8)', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
            {['live', 'upcoming'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: mode === m ? 'rgba(0,255,136,0.1)' : 'transparent',
                  border: mode === m ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
                  color: mode === m ? '#00ff88' : '#3d6080',
                  fontFamily: 'Share Tech Mono', fontSize: 11, cursor: 'pointer',
                  letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.2s',
                }}
              >
                {m === 'live' ? '◉ LIVE' : '◷ UPCOMING'}
              </button>
            ))}
          </div>

          {/* Analyze button */}
          <button
            onClick={() => fetchPredictions(mode)}
            disabled={loading}
            style={{
              padding: '8px 24px', borderRadius: 6, cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'rgba(0,255,136,0.05)' : 'rgba(0,255,136,0.1)',
              border: `1px solid ${loading ? 'rgba(0,255,136,0.2)' : 'rgba(0,255,136,0.4)'}`,
              color: loading ? '#3d6080' : '#00ff88',
              fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14,
              letterSpacing: 2, transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,136,0.1)',
            }}
          >
            {loading ? '⟳ ANALYZING...' : '▶ RUN ANALYSIS'}
          </button>

          {/* Filter buttons */}
          {predictions && predictions.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {[
                { id: 'all', label: 'ALL' },
                { id: 'elite', label: '◆ ELITE' },
                { id: 'high', label: '▲ HIGH+' },
                { id: 'value', label: '★ VALUE' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  style={{
                    padding: '4px 10px', borderRadius: 4,
                    background: filter === id ? 'rgba(14,165,233,0.1)' : 'transparent',
                    border: `1px solid ${filter === id ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    color: filter === id ? '#0ea5e9' : '#3d6080',
                    fontFamily: 'Share Tech Mono', fontSize: 10, cursor: 'pointer',
                    letterSpacing: 1, transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Notice banner ──────────────────────────────────────────── */}
        {notice && (
          <div style={{
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 6, padding: '10px 14px', marginBottom: 20,
            fontFamily: 'Rajdhani', fontSize: 13, color: '#fbbf24',
          }}>
            ⚠ {notice}
          </div>
        )}

        {/* ── Demo badge ─────────────────────────────────────────────── */}
        {isDemo && predictions && (
          <div style={{
            background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)',
            borderRadius: 6, padding: '10px 14px', marginBottom: 20,
            fontFamily: 'Rajdhani', fontSize: 13, color: '#0ea5e9',
          }}>
            🔬 <strong>DEMO MODE</strong> — Showing sample predictions. Configure <code style={{ fontFamily: 'Share Tech Mono', fontSize: 11 }}>ANTHROPIC_API_KEY</code> and <code style={{ fontFamily: 'Share Tech Mono', fontSize: 11 }}>RAPIDAPI_KEY</code> in Vercel environment variables for live AI predictions.
          </div>
        )}

        {/* ── Loading state ─────────────────────────────────────────── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div className="loading-ring" />
            </div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: '#00ff88', letterSpacing: 3, marginBottom: 8 }}>
              ANALYZING CORNER PATTERNS
            </div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#3d6080', letterSpacing: 2 }}>
              INGESTING MATCH DATA · RUNNING ENSEMBLE MODELS · COMPUTING PROBABILITIES
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20 }}>
              {['POISSON MODEL', 'ML ENSEMBLE', 'BAYESIAN NET'].map((step, i) => (
                <div key={step} style={{
                  fontFamily: 'Share Tech Mono', fontSize: 9, color: '#3d6080',
                  letterSpacing: 1, animation: `slide-up 0.4s ease ${i * 0.2}s both`,
                }}>
                  ⟳ {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error state ───────────────────────────────────────────── */}
        {error && !loading && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: '#ef4444', marginBottom: 6 }}>
              ANALYSIS ERROR
            </div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#7aa0bf' }}>{error}</div>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!loading && !error && !predictions && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: '#e2f0ff', letterSpacing: 2, marginBottom: 8 }}>
              CORNER KICK INTELLIGENCE
            </div>
            <div style={{
              fontFamily: 'Rajdhani', fontSize: 15, color: '#3d6080', maxWidth: 480, margin: '0 auto 24px',
              lineHeight: 1.6,
            }}>
              AI-powered corner kick predictions using ensemble models — Poisson distribution, XGBoost, 
              and Bayesian inference — covering football leagues worldwide.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 500, margin: '0 auto 32px' }}>
              {[
                { icon: '📊', label: 'Statistical Models', desc: 'Poisson + XGBoost ensemble' },
                { icon: '🌍', label: 'Global Coverage', desc: '15+ leagues worldwide' },
                { icon: '🎯', label: 'Corner Focus', desc: 'Dedicated to corners only' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{
                  background: 'rgba(6,15,25,0.8)', borderRadius: 8, padding: '14px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: '#e2f0ff', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#3d6080' }}>{desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => fetchPredictions(mode)}
              style={{
                padding: '12px 36px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.4)',
                color: '#00ff88', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 16,
                letterSpacing: 2, boxShadow: '0 0 30px rgba(0,255,136,0.1)',
                transition: 'all 0.2s',
              }}
            >
              ▶ START PREDICTION ENGINE
            </button>
          </div>
        )}

        {/* ── Predictions ───────────────────────────────────────────── */}
        {!loading && predictions && predictions.length > 0 && (
          <>
            <StatsBar predictions={predictions} />
            
            {filteredPredictions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#3d6080', fontFamily: 'Rajdhani' }}>
                No predictions match the current filter. Try a broader filter.
              </div>
            ) : (
              <div>
                {filteredPredictions.map((p, i) => (
                  <PredictionCard key={p.matchId || i} prediction={p} index={i} />
                ))}
              </div>
            )}
            
            {/* Footer */}
            <div style={{
              marginTop: 32, padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#1e3a4f', letterSpacing: 2 }}>
                CORNERIQ · ENSEMBLE MODEL · PREDICTIONS GENERATED AT {predictions[0]?.generatedAt 
                  ? new Date(predictions[0].generatedAt).toLocaleTimeString() : '—'}
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#1e3a4f', marginTop: 4 }}>
                For informational purposes only. Statistical models have inherent uncertainty.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
