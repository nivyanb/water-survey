const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`[Config] Missing required environment variable: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const config = {
  env:   optional("NODE_ENV", "development"),
  isDev: optional("NODE_ENV", "development") === "development",

  server: {
    port: parseInt(optional("PORT", "4000"), 10),
  },

  db: {
    url: required("DATABASE_URL"),
  },

  auth: {
    secret:         required("AUTH_SECRET"),
    tokenExpiresIn: optional("AUTH_TOKEN_EXPIRES_IN", "7d"),
  },

  frontend: {
    url: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  },
};
