import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "~/lib/config";
import createLogger from "~/lib/logger";
import { errorHandler } from "~/middleware/error-handler";
import { withAuth } from "~/middleware/with-auth";

import loginRoute  from "~/routes/auth/login";
import logoutRoute from "~/routes/auth/logout";
import signupRoute from "~/routes/auth/signup";
import meRoute     from "~/routes/auth/me";

import surveyListRoute   from "~/routes/surveys/index";
import surveyDetailRoute from "~/routes/surveys/detail";

const log = createLogger("Server");
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: config.frontend.url, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Auth routes (public) ────────────────────────────────────────────────────
app.use("/api/auth/login",  loginRoute);
app.use("/api/auth/logout", logoutRoute);
app.use("/api/auth/signup", signupRoute);

// ─── Auth routes (protected) ─────────────────────────────────────────────────
app.use("/api/auth/me", withAuth, meRoute);

// ─── Survey routes (protected) ───────────────────────────────────────────────
app.use("/api/surveys", withAuth, surveyListRoute);
app.use("/api/surveys", withAuth, surveyDetailRoute);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(config.server.port, () => {
  log.info("Server running", { port: config.server.port, env: config.env });
});
