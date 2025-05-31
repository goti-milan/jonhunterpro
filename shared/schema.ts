import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("job_seeker"), // 'job_seeker' or 'employer'
  resumeUrl: varchar("resume_url"),
  phone: varchar("phone"),
  location: varchar("location"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  website: varchar("website"),
  location: varchar("location"),
  logoUrl: varchar("logo_url"),
  industry: varchar("industry"),
  employerId: varchar("employer_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: varchar("location").notNull(),
  jobType: varchar("job_type").notNull(), // 'full-time', 'part-time', 'contract', 'remote'
  salaryMin: decimal("salary_min"),
  salaryMax: decimal("salary_max"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  postedBy: varchar("posted_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  experienceLevel: varchar("experience_level"), // 'entry', 'mid', 'senior'
  category: varchar("category"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending', 'reviewed', 'interview', 'rejected', 'hired'
  coverLetter: text("cover_letter"),
  resumeUrl: varchar("resume_url"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Saved jobs table
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  companies: many(companies),
  postedJobs: many(jobs),
  applications: many(applications),
  savedJobs: many(savedJobs),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  employer: one(users, {
    fields: [companies.employerId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  poster: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
  }),
  applications: many(applications),
  savedBy: many(savedJobs),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

// Schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
