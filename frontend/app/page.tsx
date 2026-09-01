"use client";

import { useState } from "react";

type AnalysisResponse = {
  question: string;
  plan: {
    tool: string;
    column: string | null;
  };
  result: unknown;
  answer: string;
};

type UploadResponse = {
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
};

type TopValueItem = {
  value: string;
  count: number;
};

type CorrelationResult = {
  column_x: string;
  column_y: string;
  correlation: number;
  rows_used: number;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [dataset, setDataset] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile);
    setDataset(null);
    setAnalysis(null);
    setError("");

    if (!selectedFile) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Could not inspect the CSV.");
        return;
      }

      setDataset(data);
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!file || !question.trim()) {
      setError("Please choose a CSV file and enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Something went wrong.");
        return;
      }

      setAnalysis(data);
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  function renderTopValuesChart(result: TopValueItem[]) {
    const maxCount = Math.max(...result.map((item) => item.count), 1);

    return (
      <div className="space-y-3">
        {result.map((item) => {
          const width = (item.count / maxCount) * 100;

          return (
            <div key={item.value}>
              <div className="mb-1 flex justify-between text-sm text-gray-700">
                <span>{item.value}</span>
                <span>{item.count}</span>
              </div>

              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gray-900"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderCorrelationChart(result: CorrelationResult) {
    const position = ((result.correlation + 1) / 2) * 100;

    return (
      <div>
        <div className="mb-2 flex justify-between text-sm text-gray-700">
          <span>-1 Negative</span>
          <span>0</span>
          <span>+1 Positive</span>
        </div>

        <div className="relative h-4 rounded-full bg-gray-200">
          <div
            className="absolute top-0 h-4 w-3 rounded-full bg-gray-900"
            style={{
              left: `calc(${position}% - 6px)`,
            }}
          />
        </div>

        <p className="mt-4 text-center text-2xl font-semibold text-gray-900">
          {result.correlation.toFixed(2)}
        </p>

        <p className="mt-1 text-center text-sm text-gray-500">
          Based on {result.rows_used} rows
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Data Analyst Copilot
        </h1>

        <p className="mt-3 text-gray-600">
          Upload a CSV and ask a question about your data.
        </p>

        <div className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block font-medium text-gray-900">
              CSV file
            </label>

            <label className="inline-flex cursor-pointer items-center rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700">
              Choose CSV

              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] || null)
                }
              />
            </label>

            {uploading && (
              <p className="mt-2 text-sm text-gray-500">
                Inspecting dataset...
              </p>
            )}
          </div>

          {dataset && (
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                {dataset.filename}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Rows
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {dataset.rows}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Columns
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {dataset.columns}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Column names
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {dataset.column_names.map((column) => (
                    <span
                      key={column}
                      className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium text-gray-900">
              Question
            </label>

            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is the average Identifier?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || uploading}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Answer
              </p>

              <p className="mt-2 text-xl font-semibold text-gray-900">
                {analysis.answer}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Selected tool
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {analysis.plan.tool}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Selected column
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {analysis.plan.column || "None"}
                </p>
              </div>
            </div>

            {analysis.plan.tool === "top_values" &&
              Array.isArray(analysis.result) && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                    Chart
                  </p>

                  <div className="mt-4">
                    {renderTopValuesChart(
                      analysis.result as TopValueItem[]
                    )}
                  </div>
                </div>
              )}

            {analysis.plan.tool === "correlation" && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Correlation strength
                </p>

                <div className="mt-5">
                  {renderCorrelationChart(
                    analysis.result as CorrelationResult
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Tool result
              </p>

              <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-950 p-4 text-sm text-gray-100">
                {JSON.stringify(analysis.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}