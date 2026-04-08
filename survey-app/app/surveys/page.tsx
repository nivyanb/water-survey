"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import type { Survey } from "@/types/survey";

export default function SurveysPage() {
  const { data, loading, error } = useFetch<{ surveys: Survey[] }>("/api/surveys");

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-gray-500">Loading surveys...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const surveys = data?.surveys ?? [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6">Surveys</h1>

      {surveys.length === 0 ? (
        <p className="text-gray-500">No surveys available yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {surveys.map((survey) => (
            <Link
              key={survey.id}
              href={survey.completed ? `/surveys/${survey.id}/response` : `/surveys/${survey.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="mb-1">{survey.title}</h3>
                  {survey.description && (
                    <p className="text-sm text-gray-500">{survey.description}</p>
                  )}
                </div>
                {survey.completed ? (
                  <span className="badge-success">Completed</span>
                ) : (
                  <span className="badge-warning">Pending</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
