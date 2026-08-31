"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!file || !question) {
      return;
    }

    setLoading(true);
    setAnswer("");

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
        setAnswer(data.detail || "Something went wrong.");
        return;
      }

      setAnswer(data.answer);
    } catch {
      setAnswer("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
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

            <input
              type="file"
              accept=".csv"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
              }}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-900">
              Question
            </label>

            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What is the average Identifier?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {answer && (
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="font-medium text-gray-900">Answer</p>
              <p className="mt-2 text-gray-700">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}