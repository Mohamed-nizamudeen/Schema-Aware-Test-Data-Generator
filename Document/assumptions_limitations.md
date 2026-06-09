# Assumptions and Limitations

## Schema-Aware Test Data Generator
### Prototype — Infinite Computer Solutions Tech Round

---

## Assumptions

1. **DDL Dialect:** The parser assumes MySQL / SQLite / standard SQL DDL syntax. Minor variations from PostgreSQL (e.g., `SERIAL` type) are partially handled through type normalisation.

2. **Single-Column Primary Keys:** The primary key for each table is assumed to be a single auto-incrementing integer column. Composite PKs are parsed but the data generator assigns sequential integers to each PK column independently.

3. **Self-Referential FKs:** A table that references itself (e.g., `employees.manager_id REFERENCES employees(id)`) is not supported and will raise a `CircularDependencyError`.

4. **FK Targets Exist:** All referenced tables in `FOREIGN KEY ... REFERENCES` clauses are expected to be defined within the same DDL input. Missing referenced tables trigger a warning but do not stop execution.

5. **Nullable Probability:** Nullable columns have approximately a 12% chance of receiving a `NULL` value. This is a fixed design choice for the prototype.

6. **Row Count is Uniform:** All tables receive the same number of rows (configurable by the user). Differential row counts (e.g., 10 users, 50 orders) are not supported in this version.

7. **English Locale:** Faker is used with the default English locale. Generating locale-specific data (e.g., Indian phone numbers, Chinese names) is possible but not implemented.

---

## Limitations

| Limitation | Impact | Future Fix |
|-----------|--------|-----------|
| No composite PK support | Composite PKs generate simple integers per column, may not be truly unique | Implement tuple-based PK tracking |
| No cyclic FK handling | Cyclic dependencies raise an error | Implement deferred constraint generation |
| No CHECK constraint support | `CHECK (age > 0)` is ignored | Parse and enforce CHECK expressions |
| No vendor-specific types | `JSONB`, `ARRAY`, `UUID`, `ENUM` fall back to `word` | Add type-specific Faker mappings |
| No schema introspection | Cannot connect to a live database | Add SQLAlchemy-based schema reading |
| Fixed NULL probability | 12% NULL rate may not match real data distributions | Make configurable per column |
| No data relationships within a table | E.g., `end_date > start_date` is not guaranteed | Add post-generation constraint fixup |
| No SERIAL / AUTO_INCREMENT handling | These are handled by treating PK as a counter | Parser already normalises these |
| Uniform row count per table | Cannot generate 10 users and 100 orders in one pass | Add per-table row count configuration |
| No referential action support | `ON DELETE CASCADE`, `ON UPDATE SET NULL` not parsed | Add RI action metadata |

---

## Out of Scope (for this Prototype)

- Stored procedures and triggers
- Indexes (non-unique)
- Views
- Materialized views
- Partitioned tables
- Database-specific extensions (PostGIS, etc.)
- Multi-schema (namespace) support
- Binary / BLOB data types
- Sequences / generators

---

## Known Edge Cases

1. **Table names with schema prefix** (e.g., `public.users`) — the parser extracts only the table name part, dropping the schema prefix.
2. **Column names with reserved words** (e.g., `order`, `group`) — must be backtick-quoted in the DDL for correct parsing.
3. **Long VARCHAR max lengths** (e.g., `VARCHAR(4000)`) — values are generated at natural Faker lengths and truncated only if they exceed `max_length`.
4. **DECIMAL precision** (e.g., `DECIMAL(5,2)`) — only the first number (precision) is extracted; the generated value is a random float rounded to 2 decimal places regardless of precision.

---

*This document is part of the project submission for the Infinite Computer Solutions Tech Round AI Prototype Challenge.*
