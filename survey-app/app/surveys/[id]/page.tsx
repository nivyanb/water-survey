"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import { useMutation } from "@/hooks/use-mutation";
import type { SurveyDetail, AnswerPayload } from "@/types/survey";
import { QuestionCard } from "@/components/survey/question-card";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error } = useFetch<{ survey: SurveyDetail }>(`/api/surveys/${id}`);
  const { mutate, loading: submitting, error: submitError } = useMutation(`/api/surveys/${id}/submit`);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, survey.questions.length - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
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
  const hasQuestions = survey.questions.length > 0;
  const currentQuestion = hasQuestions ? survey.questions[currentQuestionIndex] : null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

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

      {hasQuestions ? (
        <>
          <div className="mb-6">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={survey.questions.length}
              label="Question progress"
            />
          </div>

          <QuestionCard
            question={currentQuestion}
            index={currentQuestionIndex}
            value={answers[currentQuestion.id] ?? ""}
            onChange={(value) => setAnswer(currentQuestion.id, value)}
            showValidation={Boolean(validationError)}
          />
        </>
      ) : (
        <div className="card">
          <p className="text-gray-600">This survey has no questions yet.</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {hasQuestions && (
          <button
            type="button"
            onClick={goToPreviousQuestion}
            disabled={isFirstQuestion}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
        )}

        {hasQuestions && !isLastQuestion ? (
          <button
            type="button"
            onClick={goToNextQuestion}
            className="btn-primary"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Submitting..." : "Submit Survey"}
          </button>
        )}

        <button type="button" onClick={() => router.push("/surveys")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </main>
  );
}
