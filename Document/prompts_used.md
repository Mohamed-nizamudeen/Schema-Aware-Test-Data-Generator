# Prompts Used — AI-Powered Schema-Aware Test Data Generator

## 1. Schema Regeneration Prompt

Used in: `src/schema_regenerator.py → _build_regeneration_prompt()`

```
You are a senior database architect. Generate a complete, production-quality SQL DDL schema.

DOMAIN: {DOMAIN_NAME}
{DOMAIN_CONTEXT}

ORIGINAL SCHEMA (user provided, use as context):
```sql
{original_ddl}
```

REQUIREMENTS:
1. Return ONLY valid SQL DDL — no explanations, no markdown fences, no comments outside SQL.
2. Use standard SQL (compatible with PostgreSQL and MySQL).
3. Every table must have a PRIMARY KEY.
4. All FOREIGN KEY relationships must be explicit and correct.
5. Include appropriate NOT NULL, UNIQUE, and DEFAULT constraints.
6. Use realistic column names and types.
7. Include at least 6-10 tables with proper relational structure.
8. Ensure tables are ordered so parent tables come before child tables.
9. End every CREATE TABLE statement with a semicolon.

Return ONLY the SQL DDL:
```

**Design choices:**
- Strict "Return ONLY SQL DDL" instruction eliminates markdown fences and prose.
- Domain context is provided per-domain (hospital, ecommerce, etc.) as structured guidance.
- Original schema is passed as context so AI can preserve useful columns.
- Table ordering requirement enables our topological sort to work without errors.

---

## 2. Self-Repair / Fix Prompt

Used in: `src/schema_regenerator.py → _build_fix_prompt()`

```
The following SQL DDL has a syntax error. Please fix it.

ERROR: {error_message}

BROKEN DDL:
```sql
{broken_ddl}
```

Return ONLY the corrected SQL DDL with no explanations or markdown fences:
```

**Design choices:**
- Error message from `ddl_parser.py` gives the AI precise feedback on what failed.
- Single retry avoids infinite loops and wasted API quota.
- System returns error with explanation if both attempts fail.

---

## 3. Schema Explanation Prompt

Used in: `src/schema_regenerator.py → _build_explanation_prompt()`

```
Briefly explain this {domain} database schema in 3-5 sentences.
Focus on the main tables, their relationships, and what business workflow they support.
Keep it concise and non-technical enough for a stakeholder to understand.

SQL Schema:
```sql
{ddl}
```

Explanation:
```

**Design choices:**
- 3-5 sentence constraint prevents verbose output.
- "Non-technical" instruction makes the explanation useful to non-DBA users in the UI.

---

## 4. Column Value Generation Prompts

Used in: `src/hybrid_generator.py → _get_ai_values()`

### Example — Medical Diagnosis
```
List 20 short realistic medical diagnosis phrases (e.g., 'Type 2 Diabetes Mellitus', 'Acute Appendicitis'). One per line, no numbering.
```

### Example — Product Description
```
List 20 realistic e-commerce product descriptions (2 sentences each). One per line.
```

### Example — Generic Column
```
List 20 realistic, varied values for a database column named '{col_name}'
in a {domain} application. Keep each value concise (under 20 words).
One value per line, no numbering or bullets.
```

**Design choices:**
- Pool of 20 values cached per (domain, column) — amortizes API cost across all rows.
- "One per line, no numbering" gives clean parsing with `.splitlines()`.
- Specific prompts for known high-value columns; generic fallback for others.
- Pool is sampled randomly for each row, providing natural variation.

---

## Token Usage Estimates

| Prompt | Input tokens | Output tokens | Frequency |
|---|---|---|---|
| Schema regeneration | ~600 | ~2000 | Once per regeneration |
| Self-repair | ~2200 | ~2000 | At most once per failure |
| Schema explanation | ~1500 | ~200 | Once per regeneration |
| Column value pool | ~50 | ~300 | Once per column type (cached) |

With caching, a typical hospital schema + 50-row generation costs approximately **8,000–12,000 tokens total**, well within Gemini's free tier (1M tokens/day).
