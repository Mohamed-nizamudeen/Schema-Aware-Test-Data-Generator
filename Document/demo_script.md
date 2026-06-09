# Demo Script — 5 to 7 Minute Video

## Schema-Aware Test Data Generator
### Infinite Computer Solutions — Tech Round AI Prototype Challenge

---

## Pre-Demo Setup Checklist

- [ ] Terminal open at project root
- [ ] `venv` activated and dependencies installed
- [ ] Streamlit app running (`streamlit run app.py`)
- [ ] Browser open at `http://localhost:8501`
- [ ] Sample schemas ready in `sample_data/input_schemas/`

---

## Script

---

### ⏱ 0:00 — Introduction (30 seconds)

> *[Show slide or typed intro]*

"Hello, my name is [Your Name]. Today I'll be demonstrating the **Schema-Aware Test Data Generator** — my submission for the Infinite Computer Solutions Tech Round AI Prototype Challenge.

The core idea is simple: developers waste hours manually creating test data, especially when their database has multiple related tables. Our tool automates this entirely."

---

### ⏱ 0:30 — Problem Statement (45 seconds)

> *[Switch to the app — show the expanded Problem Statement section]*

"Imagine you have an e-commerce database with a `users` table, a `products` table, an `orders` table, and an `order_items` table. To test your application, you need sample rows in all four tables — but you can't just put any `user_id` in `orders`. It has to be a real ID from the `users` table.

This is the **referential integrity problem**. And this is exactly what our tool solves."

---

### ⏱ 1:15 — Show DDL Input (45 seconds)

> *[Point to the DDL text area — the e-commerce schema is pre-loaded]*

"The user simply pastes their SQL DDL schema into this text area. You can see we have four tables: `users`, `products`, `orders`, and `order_items`.

Notice the foreign key constraints: `orders.user_id` references `users.id`, and `order_items` references both `orders` and `products`.

You can also upload a `.sql` file directly, or load one of our sample schemas — here's the college schema for a university database."

---

### ⏱ 2:00 — Generate Data (30 seconds)

> *[Set rows to 10, click 🚀 Generate Test Data button]*

"I'll leave it at 10 rows per table and click Generate. Watch the progress bar — the agent loop is running."

> *[Wait for completion — progress bar reaches 100%]*

"Done in under 2 seconds. Let's explore the results."

---

### ⏱ 2:30 — Schema Summary Tab (45 seconds)

> *[Click the "Schema Summary" tab]*

"The first tab shows our parsed schema. The tool detected all 4 tables, identified 24 columns total, found the primary keys, and mapped all 3 foreign key relationships.

You can expand any table to see a detailed column breakdown — data type, nullable, unique, primary key, max length — all extracted directly from the DDL."

---

### ⏱ 3:15 — Generation Order Tab (30 seconds)

> *[Click the "Generation Order" tab]*

"This tab shows the **topological generation order** — the sequence in which tables are populated.

You can see: `users` and `products` first — they have no foreign keys. Then `orders` which depends on `users`. Finally `order_items` which depends on both `orders` and `products`.

This guarantees that when we generate child rows, all valid parent IDs already exist."

---

### ⏱ 3:45 — Generated Data Preview (45 seconds)

> *[Click the "Generated Data" tab]*

"Here's the preview of our generated rows. For `users`, every row has a realistic name, a unique email address, a phone number, a city — all from Faker.

Let's check `orders` — every `user_id` value corresponds to a real user ID from the users table. That's referential integrity working automatically.

And `order_items` has valid `order_id` and `product_id` values from their respective parent tables."

---

### ⏱ 4:30 — Agent Log (45 seconds)

> *[Click the "Agent Log" tab — show the terminal-style green log panel]*

"This is the heart of the AI capability. The agent loop has 6 steps:

- **OBSERVE** — reads the schema, counts tables and FK relationships
- **THINK** — classifies each column semantically. For example, it sees a column named `email` and maps it to `fake.email()`. A column named `created_at` maps to `fake.date_time_this_year()`. A column named `status` maps to one of our status choices.
- **PLAN** — confirms the topological generation order
- **ACT** — generates rows for each table using Faker
- **VALIDATE** — checks all FK values, PK uniqueness, and NOT NULL compliance
- **REPORT** — confirms the row counts and export status"

---

### ⏱ 5:15 — Downloads (30 seconds)

> *[Click the "Downloads" tab — click each download button briefly]*

"From the downloads tab, you can grab:
- The **SQL INSERT file** — ready to paste into any database client
- A **ZIP of all CSV files** — one per table, ready for import or testing
- The **Markdown generation report** with the full agent log and validation results

Individual CSV download buttons are also available per table."

---

### ⏱ 5:45 — Tests and Code Quality (30 seconds)

> *[Switch to terminal — run `pytest tests/ -v`]*

"Our test suite has 4 test files with comprehensive coverage:
- `test_parser.py` — DDL parsing correctness
- `test_dependency_order.py` — topological sort and cycle detection
- `test_data_generation.py` — row counts, PK uniqueness, column classification
- `test_fk_validation.py` — FK consistency including deliberate violation injection

All tests pass."

---

### ⏱ 6:15 — GitHub and Submission (30 seconds)

> *[Show GitHub repo or folder structure]*

"The complete project is on GitHub at [your-link]. The repository includes:
- Full source code in `src/`
- Sample schemas in `sample_data/input_schemas/`
- Generated outputs in `sample_data/outputs/`
- README, AI usage note, and prompt documentation
- All test files and this architecture documentation"

---

### ⏱ 6:45 — Closing (15 seconds)

"To summarise: this tool reads any SQL DDL, understands FK dependencies, classifies columns intelligently, generates referentially consistent test data, and exports everything you need — all in under 2 seconds, entirely open-source, no paid APIs.

Thank you for watching."

---

## Key Talking Points Summary

| Topic | What to say |
|-------|------------|
| Problem | Developers manually create test data → tedious, error-prone |
| Solution | AI agent loop + Faker + FK graph |
| AI Capability | Agent Loop: OBSERVE → THINK → PLAN → ACT → VALIDATE → REPORT |
| Tech Stack | Python, Streamlit, Faker, pandas, pytest |
| No Paid APIs | All free, open-source |
| Test Coverage | 4 test files, all pass |
| Export | SQL INSERTs + CSV ZIP + Markdown report |
