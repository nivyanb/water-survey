import { Request, Response, NextFunction } from "express";
import { getSession } from "~/lib/auth";
import createLogger from "~/lib/logger";

const log = createLogger("withAuth");

declare global {
  namespace Express {
    interface Request {
      session?: Record<string, any>;
    }
  }
}

export const withAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await getSession(req);

  if (!session) {
    log.warn("Unauthorised access attempt", { url: req.url });
    res.status(401).json({ success: false, error: "Unauthorised." });
    return;
  }

  req.session = session as Record<string, any>;
  next();
};
