import { Response } from "express";

export const ok = (res: Response, data: any, status = 200): void => {
  res.status(status).json({ success: true, data });
};

export const fail = (res: Response, message: string, status = 400): void => {
  res.status(status).json({ success: false, error: message });
};
