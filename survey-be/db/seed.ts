// db/seed.ts
// Run with: npx tsx db/seed.ts

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { users, surveys, questions } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("[Seed] Missing DATABASE_URL");

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_USER = {
  name:     "Admin User",
  email:    "admin@waterlily.com",
  password: "password123",
  role:     "admin",
};

const SURVEY_TITLE       = "Waterlily Customer Experience Survey";
const SURVEY_DESCRIPTION = "Help us understand your experience and expectations. Your feedback shapes our service.";

const SEED_QUESTIONS = [
  {
    text:       "How did you first hear about Waterlily?",
    type:       "multiple_choice",
    options:    JSON.stringify(["Search engine", "Social media", "Friend or family referral", "Advertisement", "Other"]),
    isRequired: true,
    orderIndex: 1,
  },
  {
    text:       "How would you rate your overall experience with Waterlily?",
    type:       "rating",
    options:    null,
    isRequired: false,
    orderIndex: 2,
  },
  {
    text:       "Which of the following best describes your primary reason for using Waterlily?",
    type:       "multiple_choice",
    options:    JSON.stringify(["Personal financial planning", "Long-term care planning", "Estate planning", "Caring for a family member", "Professional research"]),
    isRequired: true,
    orderIndex: 3,
  },
  {
    text:       "How easy was it to navigate the Waterlily platform?",
    type:       "rating",
    options:    null,
    isRequired: false,
    orderIndex: 4,
  },
  {
    text:       "Which features do you use most frequently?",
    type:       "multiple_choice",
    options:    JSON.stringify(["Care cost estimates", "Financial projections", "Family coordination tools", "Educational resources", "Advisor consultations"]),
    isRequired: false,
    orderIndex: 5,
  },
  {
    text:       "How confident do you feel about your long-term care plan after using Waterlily?",
    type:       "rating",
    options:    null,
    isRequired: false,
    orderIndex: 6,
  },
  {
    text:       "How satisfied are you with the quality of information provided?",
    type:       "rating",
    options:    null,
    isRequired: false,
    orderIndex: 7,
  },
  {
    text:       "What is the biggest challenge you face when planning for long-term care?",
    type:       "multiple_choice",
    options:    JSON.stringify(["Understanding costs", "Knowing what care options exist", "Having the financial resources", "Coordinating with family", "Finding trustworthy advice"]),
    isRequired: true,
    orderIndex: 8,
  },
  {
    text:       "How likely are you to recommend Waterlily to a friend or colleague?",
    type:       "rating",
    options:    null,
    isRequired: true,
    orderIndex: 9,
  },
  {
    text:       "How responsive has our support team been when you needed help?",
    type:       "rating",
    options:    null,
    isRequired: false,
    orderIndex: 10,
  },
  {
    text:       "Which device do you primarily use to access Waterlily?",
    type:       "multiple_choice",
    options:    JSON.stringify(["Desktop / laptop", "Tablet", "Smartphone", "Multiple devices equally"]),
    isRequired: false,
    orderIndex: 11,
  },
  {
    text:       "Is there anything else you'd like us to know or improve?",
    type:       "text",
    options:    null,
    isRequired: false,
    orderIndex: 12,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("[Seed] Starting...");

  // 1. Upsert seed user
  let [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, SEED_USER.email));

  if (!user) {
    const passwordHash = await bcrypt.hash(SEED_USER.password, 12);
    [user] = await db.insert(users).values({
      name:         SEED_USER.name,
      email:        SEED_USER.email,
      passwordHash,
      role:         SEED_USER.role,
    }).returning({ id: users.id });
    console.log(`[Seed] Created user: ${SEED_USER.email}`);
  } else {
    console.log(`[Seed] User already exists: ${SEED_USER.email}`);
  }

  // 2. Create survey (always fresh — delete existing with same title first)
  const [existing] = await db
    .select({ id: surveys.id })
    .from(surveys)
    .where(eq(surveys.title, SURVEY_TITLE));

  if (existing) {
    // questions cascade-delete due to onDelete: "cascade"
    await db.delete(surveys).where(eq(surveys.id, existing.id));
    console.log("[Seed] Removed existing survey (and its questions)");
  }

  const [survey] = await db.insert(surveys).values({
    title:       SURVEY_TITLE,
    description: SURVEY_DESCRIPTION,
    createdBy:   user.id,
    isPublished: true,
  }).returning({ id: surveys.id });

  console.log(`[Seed] Created survey id=${survey.id}: "${SURVEY_TITLE}"`);

  // 3. Insert 12 questions
  const rows = SEED_QUESTIONS.map(q => ({ ...q, surveyId: survey.id }));
  await db.insert(questions).values(rows);

  console.log(`[Seed] Inserted ${rows.length} questions`);
  console.log("[Seed] Done.");

  await client.end();
}

seed().catch(err => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
