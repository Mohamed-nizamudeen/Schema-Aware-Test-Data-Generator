# 👥 Team Information

This repository was created and maintained for the **Placement Technical Round Prototype Challenge** by a collaborative team of four. Below is the breakdown of responsibilities and contributions:

---

## 🔴 Team Lead & Core Engine (Priority 1)
*   **Member:** Mohamed Nizamudeen
*   **Role:** Core Engine & Backend Developer
*   **Key Contributions:**
    *   Designed and built the FastAPI backend server architecture.
    *   Developed the custom SQL DDL regex parser (`ddl_parser.py`).
    *   Implemented Kahn's topological sort for ordering database schema generation based on foreign key relationships (`dependency_resolver.py`).
    *   Designed the hybrid LLM-Faker generation logic and smart caching value pools (`hybrid_generator.py`).
    *   Implemented REST client integration with Google Gemini and OpenAI-compatible (Groq) endpoints.

---

## 🟡 Frontend UI Developer (Priority 2)
*   **Member:** Mamathi
*   **Role:** Frontend Developer
*   **Key Contributions:**
    *   Created the multi-step synthetic data generation wizard interface.
    *   Integrated Zustand state management to sync schema, steps, and generated output tables.
    *   Built the interactive data viewer grids displaying Faker and AI-generated records.
    *   Implemented responsive UI forms for schema upload, AI recommendations, and export configurations.

---

## 🟢 QA & Testing Developer (Priority 3)
*   **Member:** [Teammate 3 Name]
*   **Role:** Test Automation Engineer
*   **Key Contributions:**
    *   Developed the backend test suite verifying topological sort and DDL parsing edge cases.
    *   Wrote 100 mocked-API test cases for data generators, foreign key constraints, and model fallbacks.
    *   Configured pytest pipeline execution to ensure codebase integrity and regression safety.

---

## 🔵 Documentation & Video (Priority 4)
*   **Member:** [Teammate 4 Name]
*   **Role:** Technical Writer & Presenter
*   **Key Contributions:**
    *   Created project documentation including setup manuals, architecture walkthroughs, and prompt engineering logs.
    *   Wrote the detailed project pitch and user manuals for non-technical evaluation.
    *   Recorded the 5-minute project demonstration video.
