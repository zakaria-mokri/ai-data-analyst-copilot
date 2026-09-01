# AI Data Analyst Copilot

AI Data Analyst Copilot is a full-stack data analysis application that allows users to upload a CSV file, ask questions about the dataset in natural language, and receive structured analysis with a plain-English explanation.

The current version uses a deterministic rule-based planner instead of a paid LLM API. This keeps the project free and predictable to run while preserving a planner → tool → result architecture that can later be extended with an LLM.

## Features

* Upload and inspect CSV files
* Automatic dataset profiling
* Natural-language analysis requests
* Rule-based analysis planning
* Automatic tool selection
* Numeric summary analysis
* Top-values analysis
* Pearson correlation analysis
* Plain-English answers
* Visual result cards and charts
* Structured Pydantic API responses
* FastAPI backend
* Next.js frontend
* Interactive API documentation
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
     ▼
Tool Selection
     │
     ├── Numeric Summary
     ├── Top Values
     └── Correlation
     │
     ▼
Pandas Analysis
     │
     ▼
Structured Result
     │
     ▼
Plain-English Answer
     │
     ▼
Frontend Visualization
```

## Analysis Tools

### Numeric Summary

Supports questions such as:

* What is the average Identifier?
* What is the median Sales?
* What is the maximum Revenue?

The tool calculates:

* Count
* Minimum
* Maximum
* Mean
* Median

Example result:

```json
{
  "count": 120,
  "min": 15.0,
  "max": 950.0,
  "mean": 384.42,
  "median": 351.0
}
```

### Top Values

Supports questions such as:

* What are the most common Last name values?
* What are the top categories?
* What is the most frequent product?

The tool calculates the frequency of values in a selected column and returns the most common results.

It also handles ties when multiple values have the same frequency.

### Correlation

Supports questions such as:

* What is the correlation between Sales and Advertising?

The tool calculates the Pearson correlation coefficient between two numeric columns.

The result includes both the numeric correlation value and a plain-English interpretation of the relationship.

## Screenshots

### Correlation Analysis

<p align="center">
  <img src="screenshots/correlation/01-upload.png" width="620" alt="CSV upload interface">
</p>

<p align="center">
  <em>Start by choosing a CSV dataset to analyze.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/02-answer.png" width="620" alt="Correlation analysis question">
</p>

<p align="center">
  <em>Upload a dataset with numeric columns and ask about the relationship between Sales and Advertising.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/03-result.png" width="620" alt="Correlation analysis result">
</p>

<p align="center">
  <em>The planner selects the correlation tool and returns a correlation score, relationship interpretation, visualization, and structured result.</em>
</p>

---

### Top Values Analysis

<p align="center">
  <img src="screenshots/top-values/02-answer.png" width="620" alt="Top values analysis question">
</p>

<p align="center">
  <em>Upload the dataset and ask which values are most common in a selected column.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/top-values/03-result.png" width="620" alt="Top values analysis result">
</p>

<p align="center">
  <em>The planner selects the top-values tool and returns frequency counts, tie-aware output, a bar visualization, and the structured tool result.</em>
</p>

## Tech Stack

### Backend

* Python
* FastAPI
* Pandas
* Pydantic
* Uvicorn

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Architecture

```text
┌──────────────────────┐
│      Next.js UI      │
│  React + TypeScript  │
└──────────┬───────────┘
           │
           │ HTTP
           ▼
┌──────────────────────┐
│       FastAPI        │
│       main.py        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Planner        │
│     planner.py       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Analysis Tools     │
│      tools.py        │
├──────────────────────┤
│ Numeric Summary      │
│ Top Values           │
│ Correlation          │
└──────────┬───────────┘
           │
           ▼
      Pandas Analysis
           │
           ▼
     Pydantic Result
           │
           ▼
       Frontend UI
```

## Backend Design

The backend is separated into focused modules.

```text
backend/
├── main.py
├── models.py
├── planner.py
└── tools.py
```

### `main.py`

Handles:

* FastAPI application configuration
* CSV uploads
* Dataset profiling
* Analysis endpoints
* Analysis orchestration
* Error responses
* CORS configuration

### `planner.py`

Handles:

* Natural-language question normalization
* Analysis tool selection
* Column identification
* Multi-column matching for correlation analysis

### `tools.py`

Contains the Pandas-based analysis functions used by the application.

```text
numeric_summary()
top_values()
correlation()
```

### `models.py`

Defines Pydantic models used to provide structured and predictable API responses.

## Rule-Based Planner

The current version intentionally uses deterministic keyword matching rather than an external LLM.

For example:

```text
average
mean
median
minimum
maximum
    │
    ▼
numeric_summary
```

```text
top
common
most frequent
popular
    │
    ▼
top_values
```

```text
correlation
correlate
relationship
    │
    ▼
correlation
```

The planner also matches dataset column names against the user's question to determine which columns should be analyzed.

This architecture keeps tool execution separate from planning logic, making it possible to replace the deterministic planner with an LLM later without rewriting the analysis layer.

## Dataset Profiling

When a CSV file is uploaded, the backend inspects the dataset and returns useful metadata.

This can include:

* Filename
* Row count
* Column count
* Column names
* Data types
* Missing-value counts
* Dataset preview
* Numeric summaries

The dataset profile helps users understand the uploaded data before performing analysis.

## API Endpoints

### Health Check

```http
GET /health
```

Returns the current API status.

Example:

```json
{
  "status": "ok"
}
```

### Upload Dataset

```http
POST /upload
```

Accepts a CSV file and returns a structured dataset profile.

### Plan Analysis

```http
POST /plan
```

Accepts a natural-language question and dataset columns.

The planner returns the selected analysis tool and relevant columns.

Example:

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

Accepts:

* A CSV file
* A natural-language question

The backend then:

1. Reads the CSV file.
2. Analyzes the user's question.
3. Selects the appropriate tool.
4. Identifies the relevant dataset columns.
5. Runs the Pandas analysis.
6. Creates a structured result.
7. Generates a plain-English answer.

### Numeric Summary

```http
POST /analyze/numeric-summary
```

Runs numeric summary analysis directly against a selected numeric column.

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
│   │   ├── 01-upload.png
│   │   ├── 02-answer.png
│   │   └── 03-result.png
│   │
│   └── top-values/
│       ├── 02-answer.png
│       └── 03-result.png
│
├── .gitignore
└── README.md
```

## Getting Started

### Requirements

Make sure the following are installed:

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

Install the required backend packages.

If the project contains a `requirements.txt` file:

```bash
pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## 3. Frontend Setup

Open another terminal and navigate to the frontend:

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

The frontend will normally run at:

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

Start the production build:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Error Handling

The API handles common invalid input scenarios, including:

* Non-CSV file uploads
* Unreadable CSV files
* Missing dataset columns
* Numeric analysis against non-numeric columns
* Unsupported natural-language questions
* Questions where a matching column cannot be identified

Errors are returned through appropriate HTTP responses so the frontend can provide useful feedback.

## Current AI Approach

The current version uses a deterministic rule-based planner rather than a large language model.

```text
Question
   │
   ▼
Planner
   │
   ▼
Tool
   │
   ▼
Pandas Analysis
   │
   ▼
Structured Result
   │
   ▼
Plain-English Answer
```

This approach provides several advantages for the current version:

* No paid AI API is required
* Predictable analysis behavior
* Easier debugging
* Deterministic tool execution
* Analysis results are generated from actual Pandas operations
* Clear separation between planning and execution
* Straightforward path to future LLM integration

## Engineering Concepts Demonstrated

This project demonstrates experience with:

* Python backend development
* FastAPI
* REST API design
* Pandas data analysis
* CSV processing
* Pydantic models
* Structured API responses
* Next.js
* React
* TypeScript
* Tailwind CSS
* Full-stack frontend/backend integration
* Natural-language command routing
* Rule-based planning
* Tool abstraction
* Data validation
* Error handling
* Data visualization
* Modular application architecture

## Current Limitations

The current version intentionally supports a focused set of analysis operations.

It does not yet provide:

* Open-ended statistical reasoning
* Arbitrary Python execution
* LLM-powered planning
* SQL generation
* Multi-turn conversations
* Persistent uploaded datasets
* Large-file processing
* Advanced statistical analysis

Natural-language understanding currently relies on deterministic keywords and column-name matching, so questions outside supported patterns may not be recognized.

## Future Improvements

Potential improvements include:

* LLM-powered planning
* Semantic column matching
* Additional statistical analysis tools
* Scatter plots
* Histograms
* Time-series analysis
* Grouped aggregations
* Automatic chart selection
* Excel and JSON file support
* More robust CSV parsing
* Conversation history
* Dataset persistence
* Larger dataset support
* Automated backend tests
* Frontend component tests
* Docker support
* GitHub Actions CI/CD
* Production deployment

## Status

**v0.1 — Working Local Prototype**

The current version provides a functional full-stack CSV analysis workflow with deterministic natural-language tool selection, Pandas-based analysis, typed API responses, and a Next.js frontend.

The next major milestone is expanding the analysis toolset and introducing model-assisted planning while keeping the actual data analysis deterministic and tool-based.
