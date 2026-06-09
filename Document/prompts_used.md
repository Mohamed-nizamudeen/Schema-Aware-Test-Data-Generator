# Prompts Used During Development

## Schema-Aware Test Data Generator
### Development Prompt Documentation

This document captures the key prompts used during the development of this project.
These prompts demonstrate the iterative AI-assisted workflow.

---

## Prompt 1 — Architecture Design

**Prompt:**
> "I want to build a Python prototype for a placement challenge at Infinite Computer Solutions. The project is a Schema-Aware Test Data Generator. It should read SQL DDL, parse tables and FK relationships, generate realistic fake data using Faker, maintain referential integrity (parents before children), and export SQL INSERTs and CSV files. It should also include an agent loop as the AI capability. Suggest a clean modular folder structure and describe each module's responsibility."

**Result:**
Produced the `src/` module breakdown with `ddl_parser`, `schema_models`, `dependency_resolver`, `agent`, `data_generator`, `validators`, and `exporters`.

---

## Prompt 2 — DDL Parser

**Prompt:**
> "Write a Python function that uses regex to parse SQL CREATE TABLE statements. It should extract: table name, column name, data type (INTEGER, VARCHAR, DECIMAL, DATE, DATETIME, BOOLEAN, TEXT), PRIMARY KEY (inline and table-level), FOREIGN KEY with referenced table and column, NOT NULL constraint, UNIQUE constraint, and DEFAULT value. Handle commas inside parentheses like DECIMAL(10,2) correctly. Do not use any external SQL parsing library."

**Result:**
Generated initial `ddl_parser.py` with the `CREATE_TABLE_PATTERN`, `FK_PATTERN`, and `split_table_body()` function.

---

## Prompt 3 — Dependency Resolver

**Prompt:**
> "Implement a topological sort in Python for a foreign key dependency graph. Input: a dict where keys are table names and values are sets of table names they depend on. Output: list of table names ordered so parents appear before children. Use Kahn's algorithm. Raise a custom CircularDependencyError if a cycle is detected. Do not use networkx."

**Result:**
Produced the `topological_sort()` function and `CircularDependencyError` exception in `dependency_resolver.py`.

---

## Prompt 4 — Agent Loop

**Prompt:**
> "Design a Python class called DataGeneratorAgent with 6 methods representing an AI agent loop: observe(), think(), plan(), act_start(), act_done(), validate_result(), and report(). Each method should log a step-prefixed message like [OBSERVE], [THINK], etc., to an internal list. The agent should classify columns semantically using keyword matching on column names and return hints like 'email', 'phone_number', 'decimal_amount', 'status', 'datetime_recent' etc. that will be consumed by the Faker-based data generator."

**Result:**
Generated `agent.py` with `DataGeneratorAgent` class and `COLUMN_HINTS` dictionary with 35+ pattern-to-hint mappings.

---

## Prompt 5 — FK Validation Debug

**Prompt:**
> "I have a FK validation function in Python that checks if every value in a child table's FK column exists in the parent table's PK column. The function is producing false positives — it says FK violations exist even though the data was generated with valid parent IDs. Possible bug: the parent ID lookup uses a dict but the generated IDs might be integers while the FK values are stored as strings. Write defensive code to handle this type mismatch and add a test case that deliberately injects a bad FK value and verifies the issue is detected."

**Result:**
Identified type coercion as a latent bug, added string-safe comparison in validator, and wrote `test_invalid_fk_detected` in `test_fk_validation.py`.

---

## Prompt 6 — Streamlit UI Design

**Prompt:**
> "Design a professional Streamlit UI for a test data generator tool. Include: a gradient hero header with project title, metric cards showing tables/columns/rows/FK count, tabs for schema summary, generation order, data preview, agent log, and downloads. Add custom CSS for a dark agent log panel (terminal-style green-on-black text), styled download button strips, and a purple-gradient sidebar. Make it look polished, not like a default Streamlit app."

**Result:**
Produced the custom CSS block and tab layout in `app.py`.

---

## Prompt 7 — README

**Prompt:**
> "Write a professional README.md for a Python project called 'Schema-Aware Test Data Generator'. Include: problem statement, solution overview, feature table, architecture diagram (ASCII), tech stack table, folder structure, setup instructions (venv, pip install), run instructions, how to use the app, sample input/output, AI agent capability explanation with step table, test instructions, assumptions and limitations, future enhancements, and a team information placeholder. Make it suitable for a placement evaluation."

**Result:**
Generated the full `README.md`.

---

## Prompt 8 — Test Cases

**Prompt:**
> "Write pytest test cases for a DDL parser module. Tests should cover: correct table count extraction, column count per table, PRIMARY KEY detection (the column's is_primary_key should be True and is_nullable should be False), UNIQUE constraint detection, NOT NULL detection, VARCHAR max_length extraction, data type normalisation (INT → INTEGER), FOREIGN KEY column and referenced table/column, error on invalid DDL input, comments stripped correctly, and multiple FK detection."

**Result:**
Generated `test_parser.py` with classes `TestTableDetection`, `TestColumnAttributes`, `TestForeignKeyDetection`, and `TestEdgeCases`.

---

## Prompt 9 — Export Module

**Prompt:**
> "Write Python functions to: (1) export a list of row dicts to a CSV file using pandas, (2) generate SQL INSERT statements from generated rows with proper NULL, integer, and string escaping, (3) create a ZIP archive of all CSV files in memory using io.BytesIO and return as bytes for Streamlit download buttons, (4) generate a Markdown report summarising the schema, generation order, validation result, and agent log."

**Result:**
Generated `exporters.py` with `export_csv_files`, `get_csv_zip_bytes`, `export_sql_inserts`, and `export_report` functions.

---

*These prompts are documented as part of the transparent AI usage policy for this prototype challenge submission.*
