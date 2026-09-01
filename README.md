# AI Data Analyst Copilot

AI Data Analyst Copilot is an AI-native portfolio project that lets a user upload a CSV file, ask a natural-language question, and receive a structured analysis with a plain-English answer.

The current v0.1 uses a free rule-based planner instead of a paid LLM API, while keeping the architecture ready for a real model later.

## Features

- Upload and inspect CSV files
- Automatic dataset profiling
- Natural-language analysis requests
- Planner selects the right analysis tool
- Numeric summary analysis
- Top-values analysis
- Correlation analysis
- Plain-English answers
- Visual result cards and charts
- FastAPI backend
- Next.js frontend
- Typed Pydantic response models
- Health endpoint

## How It Works

User question  
↓  
Planner  
↓  
Tool selection  
↓  
Data analysis  
↓  
Structured result  
↓  
Plain-English answer

## Analysis Tools

### Numeric Summary

Supports questions such as:

- What is the average Identifier?
- What is the median Sales?
- What is the maximum Revenue?

The tool calculates:

- count
- minimum
- maximum
- mean
- median

### Top Values

Supports questions such as:

- What are the most common Last name?
- What are the top categories?

The tool returns the most frequent values and handles ties.

### Correlation

Supports questions such as:

- What is the correlation between Sales and Advertising?

The tool calculates Pearson correlation between two numeric columns and returns a plain-English interpretation.

## Screenshots

### Numeric Summary

<p align="center">
  <img src="screenshots/numeric-summary/01-upload.png" width="620" />
</p>

<p align="center">
  <em>Upload a CSV containing numeric data and inspect the detected columns.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/numeric-summary/02-answer.png" width="620" />
</p>

<p align="center">
  <em>Ask for an average, median, minimum, or maximum using natural language.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/numeric-summary/03-result.png" width="620" />
</p>

<p align="center">
  <em>The numeric summary tool returns structured statistics and a plain-English answer.</em>
</p>

---

### Correlation Analysis

<p align="center">
  <img src="screenshots/correlation/01-upload.png" width="620" />
</p>

<p align="center">
  <em>Upload a dataset containing two numeric columns for relationship analysis.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/02-answer.png" width="620" />
</p>

<p align="center">
  <em>Ask about the relationship between two columns and let the planner select the correlation tool.</em>
</p>

<br>

<p align="center">
  <img src="screenshots/correlation/03-result.png" width="620" />
</p>

<p align="center">
  <em>Review the correlation score, relationship strength, visualization, and structured tool result.</em>
</p>

## Tech Stack

### Backend

- Python
- FastAPI
- Pandas
- Pydantic
- Uvicorn

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS

## Project Structure

ai-data-analyst-copilot/
├── backend/
│   ├── main.py
│   ├── planner.py
│   ├── tools.py
│   └── models.py
├── frontend/
├── screenshots/
│   ├── numeric-summary/
│   └── correlation/
└── README.md

## Running Locally

### Backend

cd backend
source .venv/bin/activate
uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

API docs:

http://127.0.0.1:8000/docs

### Frontend

In a second terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:3000

## Current AI Approach

The current version uses a deterministic rule-based planner to map natural-language questions to analysis tools.

This keeps the project free to run while still demonstrating an AI-native architecture:

question → planner → tool → result → answer

A future version could replace the rule-based planner with an LLM without changing the core tool execution layer.

## Future Improvements

- LLM-powered planning
- More analysis tools
- Scatter plots
- Automatic chart selection
- Better column matching
- Conversation history
- Larger dataset support

## Status

v0.1 — working local prototype
