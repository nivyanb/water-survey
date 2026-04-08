import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { config } from "~/lib/config";
import createLogger from "~/lib/logger";

const log    = createLogger("Auth");
const SECRET = new TextEncoder().encode(config.auth.secret);

const COOKIE_NAME    = "session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
  maxAge:   60 * 60 * 24 * 7,
};

export const hashPassword   = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (payload: object) =>
  new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.auth.tokenExpiresIn)
    .sign(SECRET);

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (err: any) {
    log.warn("Token verification failed", { error: err.message });
    return null;
  }
};

export const getSession = async (req: Request) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
};

export const setSessionCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const clearSessionCookie = (res: Response): void => {
  res.cookie(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
};
