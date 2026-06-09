# Architecture Overview

## Schema-Aware Test Data Generator

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STREAMLIT UI (app.py)                    │
│  DDL Input (text/upload) → Generate Button → Tabs → Downloads   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     ddl_parser.py        │
                    │  Regex-based SQL parser  │
                    │  → SchemaModel           │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  dependency_resolver.py   │
                    │  FK graph (adjacency map) │
                    │  Kahn's topological sort  │
                    │  → Generation Order       │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │       agent.py            │
                    │   DataGeneratorAgent      │
                    │   OBSERVE → THINK         │
                    │   PLAN → ACT              │
                    │   VALIDATE → REPORT       │
                    │   → Column Hints Dict     │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │    data_generator.py      │
                    │  Faker + column hints     │
                    │  PK counter / FK lookup   │
                    │  UNIQUE set tracker       │
                    │  → all_data dict          │
                    └────────────┬──────────────┘
                          ┌──────┴──────┐
                          │             │
             ┌────────────▼──┐   ┌──────▼──────────┐
             │ validators.py │   │  exporters.py   │
             │ PK uniqueness │   │  CSV files      │
             │ FK consistency│   │  SQL INSERTs    │
             │ NOT NULL check│   │  MD Report      │
             └───────────────┘   └─────────────────┘
```

---

### Data Flow

1. **Input:** User pastes or uploads SQL DDL text.
2. **Parsing:** `ddl_parser.parse_ddl()` extracts `SchemaModel` containing `TableModel` and `ColumnModel` objects with all constraint metadata.
3. **Dependency Analysis:** `dependency_resolver.resolve_generation_order()` builds a directed FK graph and applies Kahn's algorithm to compute the safe generation sequence.
4. **Agent Reasoning:** `DataGeneratorAgent` runs the 6-step loop, classifying each column semantically and logging its reasoning.
5. **Generation:** `data_generator.generate_all_data()` uses Faker to produce rows in the correct order, respecting PKs, FKs, NOT NULL, and UNIQUE constraints.
6. **Validation:** `validators.run_all_validations()` verifies referential integrity and constraint compliance.
7. **Export:** `exporters.py` produces CSV files, a combined SQL INSERT file, and a Markdown report.
8. **Output:** Files are available for download via Streamlit buttons and saved to `sample_data/outputs/`.

---

### Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `schema_models.py` | Data classes: `SchemaModel`, `TableModel`, `ColumnModel`, `ForeignKeyModel` |
| `ddl_parser.py` | Regex parsing of `CREATE TABLE` DDL statements |
| `dependency_resolver.py` | FK dependency graph + Kahn's topological sort |
| `agent.py` | 6-step agent loop + semantic column classification |
| `data_generator.py` | Faker-based row generation respecting all constraints |
| `validators.py` | PK uniqueness, FK consistency, NOT NULL, row count checks |
| `exporters.py` | CSV, SQL INSERT, and Markdown report generation |
| `utils.py` | Shared helpers (file loading, formatting, stats) |
| `app.py` | Streamlit UI orchestration |

---

### Key Design Decisions

1. **No external SQL parser** — A custom regex-based parser is simpler, more transparent, and avoids a heavy dependency. It supports the common DDL patterns needed for the prototype.

2. **Kahn's algorithm over DFS** — Kahn's BFS-based topological sort naturally detects cycles (unprocessed nodes remain) and produces a deterministic order, making it easier to debug.

3. **Agent as a Coordinator, not a Generator** — The agent classifies columns and logs reasoning but delegates actual generation to `data_generator.py`. This separation of concerns makes each module independently testable.

4. **Faker seed for reproducibility** — `Faker.seed(42)` ensures test runs produce consistent data, enabling reliable pytest assertions.

5. **Streamlit over FastAPI+HTML** — Streamlit delivers a complete interactive UI in a single Python file, ideal for a 1–2 day prototype.
