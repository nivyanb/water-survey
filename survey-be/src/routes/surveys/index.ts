import { Router } from "express";
import { db } from "../../../db";
import { surveys, responses } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { ok } from "~/lib/respond";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session?.userId as number;

    const allSurveys = await db
      .select({
        id:          surveys.id,
        title:       surveys.title,
        description: surveys.description,
        isPublished: surveys.isPublished,
        createdAt:   surveys.createdAt,
      })
      .from(surveys)
      .where(eq(surveys.isPublished, true));

    const userResponses = await db
      .select({ surveyId: responses.surveyId })
      .from(responses)
      .where(eq(responses.userId, userId));

    const completedSurveyIds = new Set(userResponses.map((r) => r.surveyId));

    const result = allSurveys.map((s) => ({
      ...s,
      completed: completedSurveyIds.has(s.id),
    }));

    ok(res, { surveys: result });
  } catch (err) {
    next(err);
  }
});

export default router;
