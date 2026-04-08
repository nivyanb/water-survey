import { Router } from "express";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, setSessionCookie } from "~/lib/auth";
import { ok, fail } from "~/lib/respond";
import createLogger from "~/lib/logger";

const router = Router();
const log    = createLogger("Signup");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return fail(res, "name, email, and password are required.", 400);
    }
    if (password.length < 8) {
      return fail(res, "Password must be at least 8 characters.", 400);
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      log.warn("Signup attempted with existing email", { email });
      return fail(res, "An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({
      id:    users.id,
      name:  users.name,
      email: users.email,
      role:  users.role,
    });

    log.info("New user registered", { userId: user.id });

    const token = await signToken({ userId: user.id, role: user.role });
    setSessionCookie(res, token);
    ok(res, { user }, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
