from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import StringIO

from planner import choose_tool, choose_column
from tools import numeric_summary, top_values
from models import AnalyzeResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file.",
        )

    contents = await file.read()

    try:
        text = contents.decode("utf-8")

        df = pd.read_csv(
            StringIO(text),
            sep=None,
            engine="python",
        )

        df.columns = df.columns.str.strip()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the CSV file.",
        )

    numeric_columns = df.select_dtypes(include="number")

    numeric_summary_data = {}

    for column in numeric_columns.columns:
        numeric_summary_data[column] = {
            "min": float(numeric_columns[column].min()),
            "max": float(numeric_columns[column].max()),
            "mean": float(numeric_columns[column].mean()),
        }

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "missing_values": df.isnull().sum().to_dict(),
        "data_types": {
            column: str(dtype)
            for column, dtype in df.dtypes.items()
        },
        "preview": df.head(5).fillna("").to_dict(orient="records"),
        "numeric_summary": numeric_summary_data,
    }


@app.post("/analyze/top-values")
async def analyze_top_values(
    file: UploadFile = File(...),
    column: str = Form(...),
):
    contents = await file.read()

    try:
        text = contents.decode("utf-8")

        df = pd.read_csv(
            StringIO(text),
            sep=None,
            engine="python",
        )

        df.columns = df.columns.str.strip()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the CSV file.",
        )

    try:
        result = top_values(df, column)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "analysis": "top_values",
        "column": column,
        "results": result,
    }


@app.post("/analyze/numeric-summary")
async def analyze_numeric_summary(
    file: UploadFile = File(...),
    column: str = Form(...),
):
    contents = await file.read()

    try:
        text = contents.decode("utf-8")

        df = pd.read_csv(
            StringIO(text),
            sep=None,
            engine="python",
        )

        df.columns = df.columns.str.strip()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the CSV file.",
        )

    try:
        result = numeric_summary(df, column)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "analysis": "numeric_summary",
        "column": column,
        "results": result,
    }


@app.post("/plan")
async def plan_analysis(
    question: str = Form(...),
    columns: str = Form(...),
):
    column_list = [
        column.strip()
        for column in columns.split(",")
    ]

    selected_tool = choose_tool(question)
    selected_column = choose_column(question, column_list)

    return {
        "question": question,
        "selected_tool": selected_tool,
        "selected_column": selected_column,
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    question: str = Form(...),
):
    contents = await file.read()

    try:
        text = contents.decode("utf-8")

        df = pd.read_csv(
            StringIO(text),
            sep=None,
            engine="python",
        )

        df.columns = df.columns.str.strip()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the CSV file.",
        )

    selected_tool = choose_tool(question)

    selected_column = choose_column(
        question,
        df.columns.tolist(),
    )

    if selected_column is None:
        raise HTTPException(
            status_code=400,
            detail="Could not determine which column you are asking about.",
        )

    try:
        if selected_tool == "numeric_summary":
            result = numeric_summary(
                df,
                selected_column,
            )

        elif selected_tool == "top_values":
            result = top_values(
                df,
                selected_column,
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="I could not determine which analysis to run.",
            )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    question_lower = question.lower()

    if selected_tool == "numeric_summary":
        if "average" in question_lower or "mean" in question_lower:
            answer = (
                f"The average {selected_column} is "
                f"{result['mean']:.2f}."
            )

        elif "median" in question_lower:
            answer = (
                f"The median {selected_column} is "
                f"{result['median']:.2f}."
            )

        elif "min" in question_lower:
            answer = (
                f"The minimum {selected_column} is "
                f"{result['min']:.2f}."
            )

        elif "max" in question_lower:
            answer = (
                f"The maximum {selected_column} is "
                f"{result['max']:.2f}."
            )

        else:
            answer = (
                f"I analyzed the {selected_column} column."
            )

    else:
        if result:
            top_value = result[0]

            answer = (
                f"The most common {selected_column} is "
                f"'{top_value['value']}', appearing "
                f"{top_value['count']} time(s)."
            )

        else:
            answer = (
                f"No values were found for {selected_column}."
            )

    return {
        "question": question,
        "plan": {
            "tool": selected_tool,
            "column": selected_column,
        },
        "result": result,
        "answer": answer,
    }