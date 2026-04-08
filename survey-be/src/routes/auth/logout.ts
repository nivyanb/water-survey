import { Router } from "express";
import { clearSessionCookie } from "~/lib/auth";
import { ok } from "~/lib/respond";
import createLogger from "~/lib/logger";

const router = Router();
const log    = createLogger("Logout");

router.post("/", (req, res) => {
  log.info("User logged out");
  clearSessionCookie(res);
  ok(res, { message: "Logged out successfully." });
});

export default router;
