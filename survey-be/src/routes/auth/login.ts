import { Router } from "express";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setSessionCookie } from "~/lib/auth";
import { ok, fail } from "~/lib/respond";
import createLogger from "~/lib/logger";

const router = Router();
const log    = createLogger("Login");

router.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, "email and password are required.", 400);
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      log.warn("Failed login attempt", { email });
      return fail(res, "Invalid email or password.", 401);
    }

    log.info("User logged in", { userId: user.id });

    const token = await signToken({ userId: user.id, role: user.role });
    setSessionCookie(res, token);
    ok(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
