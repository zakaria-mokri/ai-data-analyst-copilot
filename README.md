# AI Data Analyst Copilot

AI Data Analyst Copilot is a full-stack data analysis application that allows users to upload a CSV file, ask questions about the dataset in natural language, and receive structured analysis with a plain-English explanation.

The project uses a deterministic rule-based planner to translate supported natural-language questions into specific Pandas analysis tools.

This keeps the application free to run while demonstrating a planner → tool → result architecture that can later be extended with an LLM-based planner.

## Features

* CSV file upload and validation
* Automatic dataset profiling
* Dataset preview
* Column and data-type inspection
* Missing-value analysis
* Numeric dataset summaries
* Natural-language analysis requests
* Rule-based tool selection
* Automatic column matching
* Numeric summary analysis
* Top-values analysis
* Pearson correlation analysis
* Structured Pydantic API responses
* Plain-English result explanations
* Visual analysis cards and charts
* FastAPI backend
* Next.js frontend
* Interactive FastAPI API documentation
* Health-check endpoint

## How It Works

```text
CSV Dataset
     │
     ▼
 Upload & Profile
     │
     ▼
User Question
     │
     ▼
Rule-Based Planner
     │
     ├── Tool Selection
     └── Column Selection
             │
             ▼
       Analysis Tool
             │
      ┌──────┼───────┐
      ▼      ▼       ▼
   Numeric   Top   Correlation
   Summary  Values
      │      │       │
      └──────┼───────┘
             ▼
     Structured Result
             │
             ▼
    Plain-English Answer
             │
             ▼
        Frontend UI
```

## Analysis Tools

### Numeric Summary

The numeric summary tool analyzes a selected numeric column.

Example questions:

```text
What is the average Sales?

What is the median Revenue?

What is the maximum Price?
```

The tool calculates:

* Count
* Minimum
* Maximum
* Mean
* Median

Example structured result:

```json
{
  "count": 120,
  "min": 15.0,
  "max": 950.0,
  "mean": 384.42,
  "median": 351.0
}
```

## Top Values

The top-values tool analyzes the frequency of values within a selected column.

Example questions:

```text
What are the most common categories?

What are the top values in Region?

What is the most frequent Product?
```

The tool returns up to the 10 most frequent values and their occurrence counts.

Example:

```json
[
  {
    "value": "Technology",
    "count": 48
  },
  {
    "value": "Furniture",
    "count": 36
  }
]
```

## Correlation Analysis

The correlation tool calculates the Pearson correlation coefficient between two numeric columns.

Example question:

```text
What is the correlation between Sales and Advertising?
```

The application returns the correlation value together with a plain-English interpretation of the relationship.

This allows questions about whether two numeric variables appear to move together.

## Rule-Based Planner

The current planner does not call a paid language model.

Instead, it maps keywords in the user's question to supported analysis tools.

For example:

```text
"average"
"mean"
"median"
"minimum"
"maximum"
        │
        ▼
 numeric_summary
```

```text
"top"
"common"
"most frequent"
"popular"
        │
        ▼
    top_values
```

```text
"correlation"
"correlate"
"relationship"
        │
        ▼
   correlation
```

The planner also attempts to identify referenced dataset columns by matching normalized column names against the user's question.

This approach keeps the analysis deterministic and transparent while preserving a clean abstraction for replacing the planner with an LLM in a future version.

## Dataset Profiling

When a CSV file is uploaded, the backend generates basic information about the dataset, including:

* Filename
* Row count
* Column count
* Column names
* Data types
* Missing-value counts
* First five rows
* Numeric column summaries

This allows users to inspect the structure of a dataset before asking analytical questions.

## Screenshots

### Correlation Analysis

<p align="center">
  <img src="screenshots/correlation/01-upload.png" width="620" alt="CSV upload interface">
</p>

<p align="center">
  <em>Choose a CSV dataset to begin the analysis workflow.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/02-answer.png" width="620" alt="Correlation question">
</p>

<p align="center">
  <em>Ask a natural-language question about the relationship between two numeric columns.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/03-result.png" width="620" alt="Correlation analysis result">
</p>

<p align="center">
  <em>The planner selects the correlation tool and returns a structured result, interpretation, and visualization.</em>
</p>

---

### Top Values Analysis

<p align="center">
  <img src="screenshots/top-values/02-answer.png" width="620" alt="Top values question">
</p>

<p align="center">
  <em>Ask which values appear most frequently in a selected dataset column.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/top-values/03-result.png" width="620" alt="Top values result">
</p>

<p align="center">
  <em>The application returns frequency counts and a visual representation of the most common values.</em>
</p>

## Tech Stack

### Backend

* Python
* FastAPI
* Pandas
* Pydantic
* Uvicorn

### Frontend

* Next.js 16
* React 19
* TypeScript 5
* Tailwind CSS 4

### Development

* ESLint
* FastAPI OpenAPI / Swagger documentation

## Backend Architecture

The backend is intentionally separated into small modules.

```text
backend/
├── main.py       # FastAPI application and endpoints
├── models.py     # Pydantic response models
├── planner.py    # Tool and column selection
└── tools.py      # Pandas analysis functions
```

### `main.py`

Handles:

* CSV uploads
* Dataset parsing
* Dataset profiling
* HTTP endpoints
* Analysis orchestration
* Error responses
* CORS configuration

### `planner.py`

Handles:

* Question normalization
* Analysis tool selection
* Single-column matching
* Multi-column matching

### `tools.py`

Contains the actual Pandas-based analysis functions:

```text
numeric_summary()
top_values()
correlation()
```

### `models.py`

Defines typed Pydantic response models such as:

```text
AnalysisPlan
AnalyzeResponse
```

These models provide a predictable contract between the FastAPI backend and frontend.

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

### Upload Dataset

```http
POST /upload
```

Accepts a CSV file and returns a dataset profile.

The response includes:

* Row count
* Column count
* Column names
* Missing values
* Data types
* Dataset preview
* Numeric summaries

### Plan Analysis

```http
POST /plan
```

Accepts a question and list of dataset columns.

The endpoint returns the tool and columns selected by the planner.

Example structure:

```json
{
  "question": "What is the average Sales?",
  "selected_tool": "numeric_summary",
  "selected_column": "Sales",
  "selected_columns": [
    "Sales"
  ]
}
```

### Analyze Dataset

```http
POST /analyze
```

Accepts both:

* CSV file
* Natural-language question

The backend automatically:

1. Reads the CSV.
2. Selects an analysis tool.
3. Identifies the relevant column or columns.
4. Executes the Pandas analysis.
5. Builds a structured result.
6. Returns a plain-English answer.

### Numeric Summary

```http
POST /analyze/numeric-summary
```

Runs numeric summary analysis directly against a selected column.

### Top Values

```http
POST /analyze/top-values
```

Runs frequency analysis directly against a selected column.

## Project Structure

```text
ai-data-analyst-copilot/
│
├── backend/
│   ├── .venv/
│   ├── main.py
│   ├── models.py
│   ├── planner.py
│   └── tools.py
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── screenshots/
│   ├── correlation/
│   ├── numeric-summary/
│   └── top-values/
│
├── .gitignore
└── README.md
```

## Getting Started

### Requirements

Install:

* Python 3
* Node.js
* npm

## 1. Clone the Repository

```bash
git clone https://github.com/zakaria-mokri/ai-data-analyst-copilot.git
cd ai-data-analyst-copilot
```

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Linux or macOS:

```bash
source .venv/bin/activate
```

On Windows:

```bash
.venv\Scripts\activate
```

Install the backend dependencies.

If you add a `requirements.txt` file:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Frontend Scripts

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Error Handling

The API validates uploaded files and analysis requests.

Examples of handled errors include:

* Non-CSV uploads
* Unreadable CSV files
* Missing columns
* Attempting numeric analysis on non-numeric data
* Questions where the planner cannot determine a supported tool
* Questions where the referenced column cannot be determined

Errors are returned with appropriate HTTP status responses so the frontend can display useful feedback.

## Current AI Approach

The current version intentionally uses a deterministic planner rather than a large language model.

The architecture is:

```text
Question
   │
   ▼
Planner
   │
   ▼
Analysis Tool
   │
   ▼
Pandas Execution
   │
   ▼
Structured Result
   │
   ▼
Plain-English Answer
```

This approach has several advantages for the current prototype:

* No paid AI API required
* Predictable behavior
* Easy debugging
* Analysis results come from executed Pandas code
* Clear separation between planning and analysis
* Easy migration to an LLM-based planner later

## Engineering Concepts Demonstrated

This project demonstrates experience with:

* Python backend development
* FastAPI
* REST API design
* Pandas data analysis
* CSV processing
* Pydantic models
* Type-safe API contracts
* Next.js
* React
* TypeScript
* Tailwind CSS
* Full-stack frontend/backend integration
* Natural-language routing
* Rule-based planning
* Tool abstraction
* Data validation
* Error handling
* Data visualization
* Modular application architecture

## Current Limitations

The current version supports a deliberately small set of analysis operations.

It does not yet provide:

* Open-ended statistical reasoning
* Arbitrary Python execution
* SQL generation
* Large-language-model planning
* Multi-turn conversations
* Persistent dataset storage
* Large-file processing

Natural-language understanding is based on deterministic keyword and column matching, so questions outside the supported patterns may not be recognized.

## Future Improvements

Potential improvements include:

* LLM-powered planner
* Semantic column matching
* Additional statistical analysis tools
* Scatter plots
* Histograms
* Time-series analysis
* Grouped aggregations
* Automatic chart selection
* More robust CSV parsing
* Excel and JSON support
* Conversation history
* Dataset persistence
* Larger dataset support
* Streaming file processing
* Automated backend tests
* Frontend component tests
* Docker support
* GitHub Actions CI/CD
* Deployment of both frontend and backend

## Status

**v0.1 — Working Local Prototype**

The current release provides a functional full-stack CSV analysis workflow with deterministic natural-language tool selection, Pandas-based analysis, typed API responses, and a Next.js frontend.

The next major milestone is expanding the analysis toolset and replacing the rule-based planner with a model-assisted planner while keeping deterministic analysis execution.
