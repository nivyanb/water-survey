"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import { useMutation } from "@/hooks/use-mutation";
import type { SurveyDetail, AnswerPayload } from "@/types/survey";

export default function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error } = useFetch<{ survey: SurveyDetail }>(`/api/surveys/${id}`);
  const { mutate, loading: submitting, error: submitError } = useMutation(`/api/surveys/${id}/submit`);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-gray-500">Loading survey...</p>
      </main>
    );
  }

  if (error || !data?.survey) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-red-600">{error ?? "Survey not found."}</p>
      </main>
    );
  }

  const survey = data.survey;

  if (survey.completed) {
    router.replace(`/surveys/${id}/response`);
    return null;
  }

  const setAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setValidationError(null);

    const missing = survey.questions.filter(
      (q) => q.isRequired && (!answers[q.id] || answers[q.id].trim() === "")
    );

    if (missing.length > 0) {
      setValidationError("Please answer all required questions before submitting.");
      return;
    }

    const payload: AnswerPayload[] = survey.questions
      .filter((q) => answers[q.id] && answers[q.id].trim() !== "")
      .map((q) => ({ questionId: q.id, value: answers[q.id] }));

    const { error: err } = await mutate({ answers: payload });
    if (!err) router.push("/surveys");
  };

  const displayError = validationError ?? submitError;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2">{survey.title}</h1>
      {survey.description && (
        <p className="text-gray-500 mb-8">{survey.description}</p>
      )}

      {displayError && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {survey.questions.map((q, idx) => (
          <div key={q.id} className="card">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              {idx + 1}. {q.text}
              {q.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>

            {q.type === "multiple_choice" && q.options ? (
              <div className="flex flex-col gap-2">
                {q.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => setAnswer(q.id, option)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : q.type === "rating" ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAnswer(q.id, String(n))}
                    className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
                      answers[q.id] === String(n)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                rows={3}
                className="input"
                placeholder="Type your answer..."
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Submitting..." : "Submit Survey"}
        </button>
        <button onClick={() => router.push("/surveys")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </main>
  );
}
