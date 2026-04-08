import { pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  name:         varchar("name", { length: 255 }).notNull(),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         varchar("role", { length: 50 }).notNull().default("user"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const surveys = pgTable("surveys", {
  id:          serial("id").primaryKey(),
  title:       varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdBy:   integer("created_by").notNull().references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id:         serial("id").primaryKey(),
  surveyId:   integer("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),
  text:       text("text").notNull(),
  type:       varchar("type", { length: 50 }).notNull().default("text"), // text | multiple_choice | rating
  options:    text("options"),  // JSON string for multiple choice options
  isRequired: boolean("is_required").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
});

export const responses = pgTable("responses", {
  id:         serial("id").primaryKey(),
  surveyId:   integer("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),
  userId:     integer("user_id").references(() => users.id),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const answers = pgTable("answers", {
  id:         serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  value:      text("value").notNull(),
});
