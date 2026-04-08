"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import type { AnswerView } from "@/types/survey";

interface ResponseData {
  survey: { title: string; description: string | null };
  submittedAt: string;
  answers: AnswerView[];
}

export default function ViewResponsePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error } = useFetch<ResponseData>(`/api/surveys/${id}/response`);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-gray-500">Loading response...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-red-600">{error ?? "Response not found."}</p>
      </main>
    );
  }

  const { survey, submittedAt, answers } = data;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-500">{survey.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Submitted on {new Date(submittedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className="badge-success">Completed</span>
      </div>

      <div className="flex flex-col gap-6">
        {answers.map((a, idx) => (
          <div key={a.questionId} className="card">
            <p className="text-sm font-medium text-gray-800 mb-2">
              {idx + 1}. {a.questionText}
              {a.isRequired && <span className="text-red-500 ml-1">*</span>}
            </p>

            {a.questionType === "multiple_choice" && a.options ? (
              <div className="flex flex-col gap-2">
                {a.options.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={a.value === option}
                      disabled
                      className="accent-blue-600"
                    />
                    <span className={`text-sm ${a.value === option ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            ) : a.questionType === "rating" ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-10 h-10 rounded-md border text-sm font-medium flex items-center justify-center ${
                      a.value === String(n)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-300 border-gray-200"
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                {a.value}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button onClick={() => router.push("/surveys")} className="btn-secondary">
          Back to Surveys
        </button>
      </div>
    </main>
  );
}
