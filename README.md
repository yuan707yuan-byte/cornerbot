# ⚽ CornerIQ — AI Corner Kick Predictor

> AI-powered corner kick predictions for global football leagues. Powered by Claude AI + API-Football.

## 🎯 What It Does

CornerIQ is a **corner kicks-only** prediction bot that uses:
- **Poisson Distribution Modeling** — Statistical goal/corner rate estimation
- **XGBoost-Style Ensemble ML** — Feature-rich gradient boosting analysis  
- **Bayesian Inference** — Probability updates from historical priors
- **Claude AI** — Ensemble synthesis and expert analysis

It covers **15+ leagues** including Premier League, La Liga, Serie A, Bundesliga, Champions League, MLS, Brasileirão, J1 League, and more.

---

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Clone & Push to GitHub
```bash
git clone <your-repo> && cd corner-kick-bot
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/corner-kick-bot.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no config needed

### Step 3: Add Environment Variables
In Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | [console.anthropic.com](https://console.anthropic.com) |
| `RAPIDAPI_KEY` | Your key | [rapidapi.com](https://rapidapi.com/api-sports/api/api-football) |

### Step 4: Deploy!
Click **Deploy** — your app will be live at `https://your-app.vercel.app`

---

## 🔑 API Keys Setup

### Anthropic API Key (Required)
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys → Create Key
3. Copy and add to Vercel env vars

### RapidAPI / API-Football Key (Required for live data)
1. Sign up at [rapidapi.com](https://rapidapi.com)
2. Search for **API-Football** (by API-Sports)
3. Subscribe to the **Basic (Free)** plan: 100 requests/day
4. Copy your RapidAPI key from the dashboard

> **Note**: The app runs in **Demo Mode** if keys aren't configured — showing sample predictions. Demo mode is fully functional for UI testing.

---

## 📊 Features

- **Corner kick predictions only** — Total corners, home/away split, 1st half, handicap
- **Multi-model ensemble** — Poisson + ML + Bayesian consensus
- **Confidence tiers** — ELITE (88-99%), HIGH (75-87%), MEDIUM (70-74%)
- **Value assessment** — Strong Value / Good Value / Fair Value / Skip
- **Live & upcoming modes** — Switch between in-play and scheduled matches
- **Filter system** — Filter by tier or value rating
- **Expandable cards** — Click any prediction for full model breakdown
- **Real-time clock** — Live timestamp display

---

## 🏗️ Local Development

```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local
# Edit .env.local with your API keys

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## 📁 File Structure

```
corner-kick-bot/
├── pages/
│   ├── index.js          # Main dashboard UI
│   ├── _app.js           # App wrapper
│   └── api/
│       ├── predict.js    # AI prediction endpoint
│       └── matches.js    # Match data endpoint
├── lib/
│   ├── football-api.js   # API-Football integration
│   └── prediction-engine.js  # Claude AI prediction logic
├── styles/
│   └── globals.css       # Dark tactical theme
├── vercel.json           # Vercel config
├── next.config.mjs       # Next.js config
└── .env.example          # Environment variables template
```

---

## ⚙️ How the Prediction Engine Works

1. **Data Ingestion**: Fetches live/upcoming matches from API-Football
2. **Enrichment**: Pulls team statistics, H2H history, and form data
3. **Feature Engineering**: Computes corner rates, attacking style metrics, venue effects
4. **AI Analysis**: Claude AI runs ensemble synthesis:
   - Poisson model estimate
   - ML/XGBoost estimate  
   - Bayesian estimate
   - Weighted ensemble final
5. **Filtering**: Only surfaces predictions with 75%+ confidence
6. **Ranking**: Sorts by confidence score descending

---

## 🔧 Customization

**Change leagues monitored**: Edit `LEAGUES` in `lib/football-api.js`

**Adjust confidence threshold**: Edit the filter in `lib/prediction-engine.js`:
```js
const topPredictions = predictions.filter(p => p.confidenceScore >= 75); // Change 75
```

**Modify prediction prompt**: Edit `CORNER_PREDICTION_SYSTEM_PROMPT` in `lib/prediction-engine.js`

---

## 📝 License

MIT — Build freely, deploy anywhere.
