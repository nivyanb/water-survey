import { Router } from "express";
import { db } from "../../../db";
import { surveys, questions, responses, answers } from "../../../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ok, fail } from "~/lib/respond";
import createLogger from "~/lib/logger";

const router = Router();
const log = createLogger("SurveyDetail");

// GET /api/surveys/:id — survey with questions
router.get("/:id", async (req, res, next) => {
  try {
    const surveyId = parseInt(req.params.id, 10);
    if (isNaN(surveyId)) return fail(res, "Invalid survey id.", 400);

    const [survey] = await db
      .select({
        id:          surveys.id,
        title:       surveys.title,
        description: surveys.description,
        isPublished: surveys.isPublished,
      })
      .from(surveys)
      .where(eq(surveys.id, surveyId));

    if (!survey || !survey.isPublished) {
      return fail(res, "Survey not found.", 404);
    }

    const userId = req.session?.userId as number;
    const [existing] = await db
      .select({ id: responses.id })
      .from(responses)
      .where(and(eq(responses.surveyId, surveyId), eq(responses.userId, userId)));

    const qs = await db
      .select({
        id:         questions.id,
        text:       questions.text,
        type:       questions.type,
        options:    questions.options,
        isRequired: questions.isRequired,
        orderIndex: questions.orderIndex,
      })
      .from(questions)
      .where(eq(questions.surveyId, surveyId))
      .orderBy(asc(questions.orderIndex));

    const parsed = qs.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }));

    ok(res, {
      survey: {
        ...survey,
        completed: !!existing,
        questions: parsed,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/surveys/:id/submit — submit answers
router.post("/:id/submit", async (req, res, next) => {
  try {
    const surveyId = parseInt(req.params.id, 10);
    if (isNaN(surveyId)) return fail(res, "Invalid survey id.", 400);

    const userId = req.session?.userId as number;
    const body = req.body as { answers: { questionId: number; value: string }[] };

    if (!Array.isArray(body.answers)) {
      return fail(res, "answers array is required.", 400);
    }

    // Check survey exists
    const [survey] = await db
      .select({ id: surveys.id })
      .from(surveys)
      .where(and(eq(surveys.id, surveyId), eq(surveys.isPublished, true)));

    if (!survey) return fail(res, "Survey not found.", 404);

    // Prevent duplicate submission
    const [existing] = await db
      .select({ id: responses.id })
      .from(responses)
      .where(and(eq(responses.surveyId, surveyId), eq(responses.userId, userId)));

    if (existing) return fail(res, "You have already completed this survey.", 409);

    // Validate required questions
    const qs = await db
      .select({ id: questions.id, isRequired: questions.isRequired })
      .from(questions)
      .where(eq(questions.surveyId, surveyId));

    const answerMap = new Map(body.answers.map((a) => [a.questionId, a.value]));

    for (const q of qs) {
      if (q.isRequired) {
        const val = answerMap.get(q.id);
        if (!val || val.trim() === "") {
          return fail(res, `Question ${q.id} is required.`, 400);
        }
      }
    }

    // Insert response + answers
    const [response] = await db
      .insert(responses)
      .values({ surveyId, userId })
      .returning({ id: responses.id });

    const answerRows = body.answers
      .filter((a) => a.value && a.value.trim() !== "")
      .map((a) => ({
        responseId: response.id,
        questionId: a.questionId,
        value: a.value,
      }));

    if (answerRows.length > 0) {
      await db.insert(answers).values(answerRows);
    }

    log.info("Survey submitted", { userId, surveyId, responseId: response.id });
    ok(res, { responseId: response.id }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/surveys/:id/response — user's completed response
router.get("/:id/response", async (req, res, next) => {
  try {
    const surveyId = parseInt(req.params.id, 10);
    if (isNaN(surveyId)) return fail(res, "Invalid survey id.", 400);

    const userId = req.session?.userId as number;

    const [response] = await db
      .select({ id: responses.id, submittedAt: responses.submittedAt })
      .from(responses)
      .where(and(eq(responses.surveyId, surveyId), eq(responses.userId, userId)));

    if (!response) return fail(res, "No response found for this survey.", 404);

    const [survey] = await db
      .select({ title: surveys.title, description: surveys.description })
      .from(surveys)
      .where(eq(surveys.id, surveyId));

    const userAnswers = await db
      .select({
        questionId:   answers.questionId,
        value:        answers.value,
        questionText: questions.text,
        questionType: questions.type,
        options:      questions.options,
        orderIndex:   questions.orderIndex,
        isRequired:   questions.isRequired,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(answers.responseId, response.id))
      .orderBy(asc(questions.orderIndex));

    const parsed = userAnswers.map((a) => ({
      ...a,
      options: a.options ? JSON.parse(a.options) : null,
    }));

    ok(res, {
      survey: survey,
      submittedAt: response.submittedAt,
      answers: parsed,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
