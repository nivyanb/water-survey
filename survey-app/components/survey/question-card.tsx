"use client";

import type { Question } from "@/types/survey";

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
}

export function QuestionCard({ question, index, value, onChange, showValidation }: QuestionCardProps) {
  const missing = showValidation && question.isRequired && (!value || value.trim() === "");

  return (
    <div className={`card ${missing ? "border-red-300 ring-1 ring-red-200" : ""}`}>
      <label className="block font-medium text-gray-800 mb-3">
        <span className="text-gray-400 mr-1.5">{index + 1}.</span>
        {question.text}
        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      {question.type === "multiple_choice" && question.options ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all duration-150 ${
                value === option
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="accent-blue-600"
              />
              <span className={`text-sm ${value === option ? "text-blue-800 font-medium" : "text-gray-700"}`}>
                {option}
              </span>
            </label>
          ))}
        </div>
      ) : question.type === "rating" ? (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`w-12 h-12 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                value === String(n)
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="self-center ml-2 text-xs text-gray-400">
            {value ? `${value} / 5` : "Select 1-5"}
          </span>
        </div>
      ) : (
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="Type your answer..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {missing && (
        <p className="text-xs text-red-600 mt-2">This question is required.</p>
      )}
    </div>
  );
}
