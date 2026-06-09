# Schema-Aware Test Data Generator — Complete Team Explanation

> **For:** Infinite Computer Solutions Tech Round AI Prototype Challenge  
> **Read this if:** You want to understand the ENTIRE project from scratch

---

## PART 1 — THE PROBLEM STATEMENT

### What is a Database Schema?

A database schema is a blueprint of your database. It defines what tables exist, what columns each table has, and how tables are connected to each other.

Example schema for an online shopping app:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    status VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

The `FOREIGN KEY` line means: every `user_id` value in `orders` MUST exist as an `id` in the `users` table. This is called **Referential Integrity**.

---

### What is Test Data and Why Do We Need It?

When developers build an app, they need fake/sample rows in the database to:
- Test if their API returns the right data
- Test if the UI displays correctly
- Test edge cases (NULL values, long strings, zero quantities)
- Demo the product to a client

---

### The Actual Problem

Imagine your database has 6 tables with 40+ columns and 5 foreign key relationships:

```
users ──────────────────────► orders ──────► order_items
                                                   ▲
products ──────────────────────────────────────────┘
departments ────► employees ──► payroll
```

To insert test data manually:
1. You must insert `users` BEFORE `orders` (FK rule)
2. You must insert `products` BEFORE `order_items` (FK rule)
3. Every `user_id` in `orders` must be a real user ID
4. Every `product_id` in `order_items` must be a real product ID
5. You must repeat this for ALL tables in the CORRECT order

**This is painful, slow, and error-prone.** If you get the order wrong or use a wrong ID, the database throws a Foreign Key Violation error and rejects your data.

---

### The Business Impact

| Problem | Impact |
|---------|--------|
| Manual data creation | 2–4 hours wasted per developer per sprint |
| Wrong FK values | Tests fail, debugging wastes time |
| Inconsistent test data | Bugs hide in production |
| No realistic data | Demos look unprofessional |

---

## PART 2 — OUR SOLUTION

We built a tool that:

1. **Reads** your SQL `CREATE TABLE` statements
2. **Understands** the structure — columns, types, primary keys, foreign keys, constraints
3. **Figures out** the correct generation order (parents before children)
4. **Generates** realistic fake data using AI-like column classification + Faker library
5. **Validates** that all foreign key values are correct
6. **Exports** SQL INSERT statements + CSV files + a report

**Time to generate 40 rows across 4 tables: Under 2 seconds.**

---

## PART 3 — TECH STACK AND WHY WE CHOSE EACH

| Technology | What It Is | Why We Used It |
|-----------|-----------|----------------|
| **Python 3.10+** | Programming language | Industry standard for data tools, easy to read |
| **Streamlit** | Web UI framework | Build a full web app in pure Python, no HTML/JS needed, perfect for 1-2 day prototype |
| **Faker** | Python library | Generates realistic fake data — names, emails, phone numbers, addresses, dates |
| **pandas** | Data manipulation library | Convert row dictionaries to CSV files easily |
| **pytest** | Testing framework | Write and run automated test cases |
| **regex (re)** | Python built-in | Parse SQL DDL without any external SQL library |
| **Custom Topological Sort** | Algorithm | Determine correct table generation order from FK graph — no networkx needed |

### Why Streamlit over Flask/FastAPI+HTML?

- **Streamlit** = write Python code, get a web UI automatically
- **FastAPI+HTML** = write Python backend + separate HTML/CSS/JS frontend
- For a 1-2 day prototype, Streamlit saves 6-8 hours of frontend work
- Streamlit has built-in download buttons, file uploaders, data tables, progress bars

### Why No External SQL Parser?

Libraries like `sqlparse` are heavy and have inconsistent behavior across SQL dialects. Our custom regex parser is:
- Lightweight (zero extra dependencies)
- Transparent (you can read and understand it)
- Tuned exactly for what we need

---

## PART 4 — DO WE USE ANY LLM OR API KEY?

### Short Answer: NO — and that is intentional.

### Long Answer:

The challenge requires demonstrating an **AI capability**. We chose the **Agent Loop** pattern.

**What most teams do (paid approach):**
```
Column name "email" → Send to OpenAI API → GPT says "use email generator" → Generate data
Cost: $0.002 per call × thousands of columns = expensive
Requires: API key, internet connection, rate limits
```

**What we did (free approach):**
```
Column name "email" → Match against our keyword rules → "email" hint → fake.email()
Cost: $0.00
Requires: Nothing
```

Our agent uses **35+ semantic keyword rules** to classify columns — exactly what an LLM would do, but using zero-cost pattern matching:

```python
"email"           →  fake.email()           # sarah@example.com
"phone/mobile"    →  fake.phone_number()    # 555-0142
"city/town"       →  fake.city()            # Chicago
"price/amount"    →  random decimal         # 149.99
"status"          →  ["active","pending"]   # active
"created_at"      →  fake.date_time_this_year()
"date_of_birth"   →  fake.date_of_birth()
"department"      →  ["Engineering","Finance","HR"]
"product_name"    →  ["Wireless Mouse","Webcam HD"]
```

**This is a valid AI pattern.** Rule-based expert systems are a form of AI — they encode domain knowledge to make decisions, exactly like an LLM would.

---

## PART 5 — THE AGENT LOOP (Core AI Feature)

The Agent Loop is the reason this is an AI prototype, not just a script.

### What is an Agent Loop?

An agent loop is a design pattern where an AI system:
1. **Observes** its environment
2. **Thinks** about what it sees
3. **Plans** what to do
4. **Acts** on that plan
5. **Validates** the result
6. **Reports** what happened

Our `DataGeneratorAgent` class in `src/agent.py` implements all 6 steps:

```
[OBSERVE]  Read the schema
           "4 tables detected. users has 6 columns, orders has 5 columns..."

[THINK]    Classify every column semantically
           "users.email (VARCHAR) -> email hint"
           "orders.total_amount (DECIMAL) -> decimal_amount hint"
           "orders.status (VARCHAR) -> status hint"

[PLAN]     Decide generation order
           "Order: users -> products -> orders -> order_items"

[ACT]      Generate fake rows for each table
           "Generating 10 rows for users..."
           "[OK] 10 rows generated."

[VALIDATE] Check all FK values, PKs, NOT NULLs
           "[PASS] All checks passed."

[REPORT]   Print final summary
           "40 total rows across 4 tables. Outputs ready."
```

This entire trace is shown live in the **Agent Log tab** of the UI.

---

## PART 6 — HOW THE SYSTEM WORKS (Step by Step)

```
USER opens browser at http://localhost:8501
          │
          ▼
     [app.py — Streamlit UI]
     User pastes SQL DDL or uploads .sql file
          │
          ▼
     [src/ddl_parser.py]
     Regex reads CREATE TABLE blocks
     Extracts: table names, column names, data types,
               PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE
     Returns: SchemaModel object
          │
          ▼
     [src/dependency_resolver.py]
     Builds FK dependency graph
     Runs Kahn's topological sort
     Returns: ["users", "products", "orders", "order_items"]
          │
          ▼
     [src/agent.py — Agent Loop]
     OBSERVE: reads schema
     THINK: classifies each column with a hint
     PLAN: records generation order
          │
          ▼
     [src/data_generator.py]
     ACT step: for each table in order:
       - PK columns → sequential integers (1,2,3...)
       - FK columns → random valid parent ID
       - Nullable columns → 12% chance of NULL
       - Other columns → Faker call based on hint
     Returns: dict of {table_name: [row, row, ...]}
          │
          ▼
     [src/validators.py]
     VALIDATE step:
       - PK uniqueness check
       - FK consistency check
       - NOT NULL check
       - Row count check
          │
          ▼
     [src/exporters.py]
     REPORT step:
       - Write CSV files (one per table)
       - Write SQL INSERT file (all tables, correct order)
       - Write Markdown generation report
          │
          ▼
     [app.py — Streamlit UI]
     Show: metric cards, schema summary, generation order,
           data preview, agent log, download buttons
```

---

## PART 7 — FILE STRUCTURE EXPLAINED

```
schema-aware-test-data-generator/
│
├── app.py                     ← Streamlit web UI (what you see in browser)
├── requirements.txt           ← pip install these 4 packages
├── README.md                  ← Project documentation
├── AI_USAGE_NOTE.md           ← Transparency: how AI was used
├── prompts_used.md            ← Development prompts documentation
├── TEAM_EXPLANATION.md        ← THIS FILE
├── .gitignore                 ← Git ignore rules
│
├── src/                       ← All core logic lives here
│   ├── __init__.py            ← Makes src/ a Python package
│   ├── schema_models.py       ← Data classes: Table, Column, FK, Schema
│   ├── ddl_parser.py          ← Reads SQL DDL text → SchemaModel
│   ├── dependency_resolver.py ← FK graph + topological sort
│   ├── agent.py               ← Agent loop + column classification
│   ├── data_generator.py      ← Faker-based row generation
│   ├── validators.py          ← PK, FK, NOT NULL, row count checks
│   ├── exporters.py           ← CSV, SQL, Markdown export
│   └── utils.py               ← Shared helper functions
│
├── sample_data/
│   ├── input_schemas/
│   │   ├── ecommerce_schema.sql   ← Sample: users, products, orders
│   │   └── college_schema.sql     ← Sample: departments, students, courses
│   └── outputs/
│       ├── generated_inserts.sql  ← Auto-generated after running
│       ├── generation_report.md   ← Auto-generated after running
│       └── csv/                   ← Auto-generated CSV files
│
├── tests/                     ← Automated test suite
│   ├── test_parser.py         ← 17 tests for DDL parser
│   ├── test_dependency_order.py ← 10 tests for topological sort
│   ├── test_data_generation.py  ← 20 tests for data generator
│   └── test_fk_validation.py    ← 12 tests for FK validation
│
└── docs/
    ├── architecture.md        ← System architecture diagram
    ├── demo_script.md         ← 5-7 minute demo video script
    └── assumptions_limitations.md ← Known limitations
```

---

## PART 8 — FEATURES

### Core Features

| Feature | Description |
|---------|-------------|
| DDL Parsing | Reads any standard SQL CREATE TABLE statements |
| FK Detection | Finds FOREIGN KEY ... REFERENCES relationships |
| Topological Sort | Guarantees parent tables generated before child tables |
| Semantic Column Classification | 35+ rules map column names to Faker generators |
| Realistic Data | Names, emails, phones, cities, dates, prices — all realistic |
| PK Auto-increment | Primary keys are sequential integers starting at 1 |
| FK Consistency | Child rows only reference IDs that exist in parent tables |
| NULL Handling | Nullable columns get ~12% NULL rate |
| UNIQUE Enforcement | No duplicate emails, unique fields are tracked |
| Validation Report | Checks PK uniqueness, FK consistency, NOT NULL, row count |

### Output Features

| Output | Description |
|--------|-------------|
| CSV files | One per table, downloadable as ZIP |
| SQL INSERT file | All tables in correct FK order, ready to run |
| Markdown report | Schema summary, agent log, validation results |
| Individual CSV download | Download each table separately |

### UI Features

| UI Element | Description |
|------------|-------------|
| Gradient hero header | Purple gradient with project title |
| Dark sidebar | Deep blue with agent loop step checklist |
| Metric cards | Tables / Columns / Rows / FK count |
| DDL text area | Paste schema directly |
| File uploader | Upload .sql files |
| Row count slider | 1 to 500 rows per table |
| 5 result tabs | Schema, Order, Data, Agent Log, Downloads |
| Agent log panel | Terminal-style green-on-dark log display |
| Generation order flow | Visual cards showing table order with step numbers |

### Sample Schemas Included

| Schema | Tables |
|--------|--------|
| E-Commerce | users, products, orders, order_items |
| College | departments, students, courses, enrollments |

---

## PART 9 — TEST SUITE (59 Tests, All Pass)

```bash
pytest tests/ -v
```

| Test File | What It Tests |
|-----------|--------------|
| `test_parser.py` | Table count, column count, PK detection, FK detection, UNIQUE, NOT NULL, data types, error on invalid SQL |
| `test_dependency_order.py` | Parent before child, all tables included, multi-parent FK, cycle detection |
| `test_data_generation.py` | Row counts, PK sequential, PK unique, NOT NULL enforced, email unique, column hints |
| `test_fk_validation.py` | Valid data passes, injected FK violation detected, NULL in NOT NULL detected |

---

## PART 10 — HOW TO RUN

### First Time Setup

```bash
# 1. Go to project folder
cd schema-aware-test-data-generator

# 2. Activate virtual environment
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# 3. Install packages (already done if venv exists)
pip install -r requirements.txt
```

### Run the App

```bash
streamlit run app.py
# Opens browser at http://localhost:8501
```

### Run Tests

```bash
pytest tests/ -v
# All 59 tests should pass
```

---

## PART 11 — HOW TO USE THE APP

1. **Open** `http://localhost:8501` in your browser
2. **Paste** your SQL DDL in the text area (e-commerce schema is pre-loaded)
3. **Set rows** — use the sidebar slider (default: 10 per table)
4. **Click** the "Generate Test Data" button
5. **Explore tabs:**
   - Schema Summary — see all parsed tables and columns
   - Generation Order — see which table is generated first
   - Generated Data — preview rows in an interactive table
   - Agent Log — see the AI agent's step-by-step reasoning
   - Downloads — get SQL, CSV ZIP, and report files

---

## PART 12 — LIMITATIONS (Be Honest in Demo)

| Limitation | Why |
|------------|-----|
| No circular FK support | A depends on B, B depends on A — unsolvable ordering |
| No composite PK support | Multi-column primary keys handled partially |
| ~12% fixed NULL rate | Cannot customize per column |
| No CHECK constraints | `CHECK (age > 18)` is ignored |
| No PostgreSQL-specific types | JSONB, UUID, ARRAY fall back to random word |
| English locale only | Faker defaults to English names/cities |
| Uniform row count | All tables get same number of rows |

---

## PART 13 — SUMMARY FOR INTERVIEWERS

> "We built a Schema-Aware Test Data Generator that reads SQL DDL, understands foreign key relationships, and generates referentially consistent fake data using an AI-style agent loop. The agent classifies columns semantically — for example, it knows a column named 'email' should get a fake email, and 'total_amount' should get a decimal price. It uses Kahn's topological sort to guarantee parent tables are populated before child tables. The output is SQL INSERT statements, CSV files, and a validation report. Everything is free and open-source — no paid APIs required. We have 59 automated tests covering the parser, dependency resolver, data generator, and FK validator."

---

*Schema-Aware Test Data Generator — Built for Infinite Computer Solutions Tech Round AI Prototype Challenge*
