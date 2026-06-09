# Schema-Aware Test Data Generator

> **A full-stack AI prototype that generates realistic, constraint-aware test data from SQL schemas — built for Infinite Solutions QA Engineer Placement Challenge.**

---

## Problem Statement

QA teams waste hours hand-crafting seed data that respects database constraints. Invalid foreign keys, duplicate primary keys, and unrealistic values constantly break test suites. This tool solves the problem by intelligently parsing your schema and generating production-realistic test data with zero manual effort.

---

## Features

| Feature | Status |
|---------|--------|
| SQL DDL parsing (CREATE TABLE) | ✅ |
| Inline `REFERENCES` FK detection | ✅ |
| Table-level `FOREIGN KEY` detection | ✅ |
| `NOT NULL`, `UNIQUE`, `DEFAULT` constraints | ✅ |
| Topological FK dependency resolution | ✅ |
| AI agent loop (Observe → Think → Plan → Act → Validate → Report) | ✅ |
| Semantic column classification (40+ patterns) | ✅ |
| Faker-powered realistic values | ✅ |
| Multi-table referential integrity | ✅ |
| SQL INSERT export | ✅ |
| CSV export (per-table zip) | ✅ |
| Markdown validation report | ✅ |
| Client-side JSON export | ✅ |
| AI Schema Explanation endpoint | ✅ |
| Modern React dashboard UI | ✅ |
| Live backend connection indicator | ✅ |
| Full test suite (6 tests, 100% pass) | ✅ |

---

## Tech Stack

### Backend
- **Python 3.11+** with **FastAPI**
- **Uvicorn** ASGI server
- **Faker** for realistic data generation
- **Pandas** for CSV export
- Custom regex-based DDL parser (no external SQL parser)
- Agent-loop architecture (zero LLM cost)

### Frontend
- **React 19** + **TypeScript**
- **TanStack Router** (file-based routing)
- **Vite** dev server
- **Zustand** global state management
- **shadcn/ui** component library
- **Tailwind CSS v4**

---

## Architecture

```
┌─────────────────────────────┐       ┌──────────────────────────────────────┐
│  React Frontend (Vite)      │ HTTP  │  FastAPI Backend                     │
│  ─────────────────────────  │ ───►  │  ────────────────────────────────    │
│  /upload   → Schema input   │       │  GET  /health                        │
│  /schema   → Parsed tables  │       │  POST /api/parse                     │
│  /generator→ Data config    │       │  POST /api/generate                  │
│  /data     → Preview table  │       │  POST /api/ai/explain-schema         │
│  /export   → Download files │       │  GET  /api/download/{sql|csv|report} │
│  /ai       → AI Explain     │       │                                      │
│  /validation → QA results   │       │  src/                                │
│                             │       │    ddl_parser.py  ← parses DDL       │
│  lib/api.ts  ← API client   │       │    agent.py       ← AI loop          │
│  lib/store.ts← Zustand      │       │    data_generator.py                 │
└─────────────────────────────┘       │    validators.py                     │
                                      │    exporters.py                      │
                                      └──────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites
- Python 3.11 or 3.12 (recommended) / 3.13+
- Node.js 18+
- npm or bun

### 1. Backend

```bash
cd Project/backend

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn api:app --reload --port 8000
```

The backend will be available at **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd Project/frontend

# Install dependencies
npm install

# Copy environment file (already created)
# .env contains: VITE_API_BASE=http://localhost:8000

# Start dev server
npm run dev
```

The frontend will be available at **http://localhost:5173** (or the port Vite selects)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check backend status |
| `POST` | `/api/parse` | Parse DDL and return table/column/FK metadata |
| `POST` | `/api/generate` | Generate test data from DDL + row count |
| `POST` | `/api/ai/explain-schema` | AI explanation of schema structure |
| `GET` | `/api/download/sql` | Download generated INSERT statements |
| `GET` | `/api/download/csv` | Download CSV files as ZIP |
| `GET` | `/api/download/report` | Download Markdown validation report |

### Sample Request — Parse Schema

```bash
curl -X POST http://localhost:8000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"ddl": "CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL);"}'
```

### Sample Response

```json
{
  "success": true,
  "tables": [
    {
      "name": "users",
      "columns": [
        {"name": "id", "type": "INTEGER", "pk": true, "fk": null},
        {"name": "email", "type": "VARCHAR", "pk": false, "fk": null}
      ],
      "foreign_keys": []
    }
  ],
  "generation_order": ["users"],
  "summary": "Schema Summary -- 1 table(s) detected\n  Table: users\n  ..."
}
```

### Sample Request — Generate Data

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"ddl": "CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL);", "num_rows": 5}'
```

---

## Running Tests

```bash
cd Project/backend
python -m pytest tests/test_api.py -v
```

Expected output:
```
6 passed in 1.36s
```

---

## Sample Data

The `sample_data/` directory contains:
- `sample_schema.sql` — 5-table e-commerce schema
- `outputs/` — Generated SQL, CSV, and report files (created after first generation run)

---

## Limitations

- DDL parser is regex-based; very non-standard SQL may not parse correctly
- `SERIAL` type is treated as `INTEGER` (autoincrement handled internally)
- Nullable columns have ~12% chance of NULL (configurable in `data_generator.py`)
- The AI explanation is rule-based (no external LLM API required)
- Seed is fixed at 42 for reproducibility; change in `data_generator.py` for variety

---

## Future Improvements

- [ ] Add JSON schema input support
- [ ] Add PostgreSQL `pg_dump` parsing
- [ ] Connect to real LLM (Gemini/OpenAI) for smarter AI explanations
- [ ] Add column-level data masking (PII)
- [ ] Add database connection → generate directly into a database
- [ ] Add progress streaming via Server-Sent Events
- [ ] Add schema version comparison
- [ ] Add dark mode toggle

---

## Team

Built for the **Infinite Solutions QA Engineer Placement Challenge**
