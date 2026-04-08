import { Request, Response, NextFunction } from "express";
import createLogger from "~/lib/logger";

const log = createLogger("ErrorHandler");

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  log.error(`${req.method} ${req.url} — unhandled error`, { error: err.message });

  res.status(500).json({
    success: false,
    error:   process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred.",
  });
};
