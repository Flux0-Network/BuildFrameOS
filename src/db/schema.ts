import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  client: text("client"),
  status: text("status", { enum: ["aktiv", "abgeschlossen", "pausiert"] })
    .notNull()
    .default("aktiv"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(""),
});

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company"),
  role: text("role"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(""),
});

export const diaryEntries = sqliteTable("diary_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  weather: text("weather"),
  temperature: real("temperature"),
  workers: integer("workers"),
  activities: text("activities"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(""),
});
