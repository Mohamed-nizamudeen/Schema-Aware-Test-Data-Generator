import os
import sys
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

sys.path.insert(0, os.path.dirname(__file__))

from src.ddl_parser import parse_ddl, summarise_schema
from src.dependency_resolver import resolve_generation_order, describe_dependencies
from src.agent import DataGeneratorAgent
from src.data_generator import generate_all_data
from src.validators import run_all_validations
from src.exporters import (
    export_csv_files,
    export_sql_inserts,
    export_report,
)

app = FastAPI(title="Schema-Aware Test Data Generator API")

# Add CORS middleware to allow the frontend to interact with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    ddl: str

class GenerateRequest(BaseModel):
    ddl: str
    num_rows: int
    preserve_integrity: bool = True

class ExplainRequest(BaseModel):
    ddl: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@app.post("/api/parse")
def parse_schema(req: ParseRequest):
    try:
        schema = parse_ddl(req.ddl)
        order = resolve_generation_order(schema)
        tables_info = []
        for tname, table in schema.tables.items():
            tables_info.append({
                "name": tname,
                "columns": [{"name": c.name, "type": c.data_type, "pk": c.is_primary_key, "fk": next((fk.ref_table for fk in table.foreign_keys if fk.column == c.name), None)} for c in table.columns],
                "foreign_keys": [fk.column for fk in table.foreign_keys]
            })
        return {
            "success": True,
            "tables": tables_info,
            "generation_order": order,
            "summary": summarise_schema(schema)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ai/explain-schema")
def explain_schema(req: ExplainRequest):
    try:
        schema = parse_ddl(req.ddl)
        summary = summarise_schema(schema)
        agent = DataGeneratorAgent(schema, 10)
        # Mocking an explanation using the agent or just standard summarization
        explanation = f"This schema contains {len(schema.tables)} tables. {summary}\n\nThe system has detected the foreign key relationships and understands the optimal generation order."
        return {
            "success": True,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate")
def generate_data(req: GenerateRequest):
    try:
        schema = parse_ddl(req.ddl)
        generation_order = resolve_generation_order(schema)
        
        agent = DataGeneratorAgent(schema, req.num_rows)
        agent.observe()
        agent.think()
        agent.plan(generation_order)
        
        all_data = generate_all_data(schema, generation_order, req.num_rows, agent)
        
        agent.validate_start()
        passed, issues = run_all_validations(schema, all_data, req.num_rows)
        agent.validate_result(passed, issues)
        
        agent.report(all_data)
        
        ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        out_dir = os.path.join(ROOT_DIR, "sample_data", "output")
        os.makedirs(out_dir, exist_ok=True)
        os.makedirs(os.path.join(out_dir, "csv"), exist_ok=True)
        
        export_csv_files(all_data, out_dir)
        sql_path = os.path.join(out_dir, "generated_inserts.sql")
        export_sql_inserts(schema, all_data, generation_order, sql_path)
        rpt_path = os.path.join(out_dir, "generation_report.md")
        export_report(
            schema, all_data, generation_order,
            passed, issues, agent.get_full_log(), rpt_path
        )
        
        return {
            "success": True,
            "generation_order": generation_order,
            "all_data": all_data,
            "passed": passed,
            "issues": issues,
            "agent_log": agent.get_full_log()
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

@app.get("/api/download/sql")
def download_sql():
    path = os.path.join(ROOT_DIR, "sample_data", "output", "generated_inserts.sql")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="SQL file not found")
    return FileResponse(path, filename="generated_inserts.sql", media_type="application/sql")

@app.get("/api/download/csv")
def download_csv():
    csv_dir = os.path.join(ROOT_DIR, "sample_data", "output", "csv")
    if not os.path.exists(csv_dir):
        raise HTTPException(status_code=404, detail="CSV directory not found")
    zip_path = os.path.join(ROOT_DIR, "sample_data", "output", "generated_csvs.zip")
    shutil.make_archive(zip_path.replace('.zip', ''), 'zip', csv_dir)
    return FileResponse(zip_path, filename="generated_csvs.zip", media_type="application/zip")

@app.get("/api/download/report")
def download_report():
    path = os.path.join(ROOT_DIR, "sample_data", "output", "generation_report.md")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(path, filename="generation_report.md", media_type="text/markdown")
