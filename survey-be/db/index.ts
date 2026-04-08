import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("[DB] Missing DATABASE_URL");

const client = postgres(url, {
  max:             10,
  idle_timeout:    30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
