import { Router } from "express";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { ok } from "~/lib/respond";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      res.status(401).json({ success: false, error: "User not found." });
      return;
    }

    ok(res, { user });
  } catch (err) {
    next(err);
  }
});

export default router;
