export interface Survey {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  completed: boolean;
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  type: "text" | "multiple_choice" | "rating";
  options: string[] | null;
  orderIndex: number;
  isRequired: boolean;
}

export interface SurveyDetail {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  questions: Question[];
}

export interface AnswerPayload {
  questionId: number;
  value: string;
}

export interface AnswerView {
  questionId: number;
  questionText: string;
  questionType: string;
  options: string[] | null;
  orderIndex: number;
  isRequired: boolean;
  value: string;
}
