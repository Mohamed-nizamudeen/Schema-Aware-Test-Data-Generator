# Demo Script — AI-Powered Schema-Aware Test Data Generator

## Pre-Demo Setup

1. Start backend: `uvicorn api:app --reload --port 8000`
2. Start frontend: `npm run dev` (in `Project/frontend`)
3. Open `http://localhost:3000`
4. Optionally: set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=your_key` in `Project/backend/.env`

---

## Demo Scenario A: Basic Schema → Hospital AI Regeneration

**Estimated time: 4–5 minutes**

### Step 1 — Schema Upload (30 sec)
- Navigate to **Schema Upload**
- Paste this minimal schema:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20)
);
```
- Click **Analyze schema**
- See: 1 table, 4 columns detected

### Step 2 — AI Recommendation (45 sec)
- Navigate to **AI Recommendation** (sidebar)
- Select **Hospital Management** domain
- Click **Analyze schema**
- See output:
  - Complexity: `basic`
  - Detected domain: `general`
  - Selected domain: `hospital`
  - Recommendation: **AI regeneration recommended**
  - Reason: "Schema is basic and does not match Hospital domain"
- Click **"Yes, regenerate schema"**

### Step 3 — AI Schema Preview (60 sec)
- The AI generates a complete hospital schema with 8+ tables
- Show: `patients`, `doctors`, `departments`, `appointments`, `prescriptions`, `billing`, `rooms`, `medical_records`
- Show the AI explanation of relationships
- Click **"Use this AI-generated schema"**

### Step 4 — Hybrid Data Generation (45 sec)
- Navigate to **Data Generator**
- Set rows to 20, mode to **Hybrid AI+Faker**
- Click **Generate dataset**
- Show progress bar

### Step 5 — Data Viewer (60 sec)
- Navigate to **Data Viewer**
- Point out:
  - 🧠 (brain icon) on `diagnosis`, `treatment_plan`, `clinical_notes` → AI-generated
  - ⚡ (zap icon) on `name`, `email`, `phone`, `date` → Faker-generated
- Show the AI fields summary card at the top

### Step 6 — Export (30 sec)
- Navigate to **Export Center**
- Download SQL / CSV / Report

---

## Demo Scenario B: Existing Complex Schema (Faker-only)

**Estimated time: 2 minutes**

1. Upload the full hospital DDL from `sample_data/schemas/hospital.sql`
2. Go to **AI Recommendation** → classify → shows "Hybrid recommended"
3. Go to **Data Generator** → Faker-only mode → generate
4. Show validation passing in **Validation Center**
5. Export

---

## Key Talking Points

| Point | What to Show |
|---|---|
| Real AI Integration | `/health` endpoint showing `ai_provider: gemini/gemini-1.5-flash` |
| Schema Regeneration | 3-column schema → 8-table hospital schema |
| Hybrid Generation | Brain icon vs zap icon in Data Viewer |
| Agent Loop | Agent log tab in Validation Center |
| Fallback Safety | Works without API key (faker_only mode) |
| Provider Flexibility | `.env.example` — Gemini, Ollama, OpenAI, Groq |
| Zero API Cost | Caching + Faker for 80%+ of fields |

---

## Q&A Preparation

**Q: How does AI schema generation work?**
A: `schema_regenerator.py` builds a domain-specific prompt, sends it to the configured AI provider (Gemini/Ollama/OpenAI), strips the response to clean SQL DDL, validates it with our existing `ddl_parser.py`, and retries once if invalid.

**Q: What if AI is not available?**
A: The system automatically falls back to `FallbackProvider`. All Faker-based generation works normally. The frontend shows a clear warning that AI features require a configured API key.

**Q: How does hybrid generation decide what to use AI for?**
A: `hybrid_generator.py` checks two conditions: (1) column name matches an AI keyword pattern (diagnosis, treatment_plan, review_text, etc.) AND (2) column type is TEXT or VARCHAR. Primary keys, foreign keys, dates, and numbers always use Faker.

**Q: Why not use AI for every field?**
A: AI API calls are slow (200ms–2s each) and have rate limits. For 50 rows × 10 tables, using AI for every field would take minutes and cost significant quota. Caching + selective use keeps generation under 3 seconds for typical schemas.
