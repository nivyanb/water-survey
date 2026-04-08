type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, { label: string; color: string }> = {
  debug: { label: "DEBUG", color: "\x1b[36m" },
  info:  { label: "INFO ", color: "\x1b[32m" },
  warn:  { label: "WARN ", color: "\x1b[33m" },
  error: { label: "ERROR", color: "\x1b[31m" },
};

const RESET = "\x1b[0m";
const DIM   = "\x1b[2m";

const isDev = process.env.NODE_ENV !== "production";

const format = (level: Level, context: string, message: string, meta?: object): string => {
  const { label, color } = LEVELS[level];
  const timestamp = new Date().toISOString();
  const ctx       = context ? `[${context}]` : "";
  const metaStr   = meta ? ` ${JSON.stringify(meta)}` : "";

  return `${DIM}${timestamp}${RESET} ${color}${label}${RESET} ${ctx} ${message}${DIM}${metaStr}${RESET}`;
};

const createLogger = (context = "") => ({
  debug: (message: string, meta?: object) => {
    if (isDev) console.debug(format("debug", context, message, meta));
  },
  info:  (message: string, meta?: object) => console.info(format("info",  context, message, meta)),
  warn:  (message: string, meta?: object) => console.warn(format("warn",  context, message, meta)),
  error: (message: string, meta?: object) => console.error(format("error", context, message, meta)),
});

export const logger = createLogger();
export default createLogger;
