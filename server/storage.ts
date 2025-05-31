import {
  users,
  companies,
  jobs,
  applications,
  savedJobs,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompaniesByEmployer(employerId: string): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(options?: {
    search?: string;
    location?: string;
    jobType?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Job[]>;
  getJobById(id: number): Promise<(Job & { company: Company; poster: User }) | undefined>;
  getJobsByCompany(companyId: number): Promise<Job[]>;
  getJobsByPoster(posterId: string): Promise<Job[]>;
  updateJob(id: number, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByJob(jobId: number): Promise<(Application & { applicant: User })[]>;
  getApplicationsByUser(userId: string): Promise<(Application & { job: Job & { company: Company } })[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Saved jobs operations
  saveJob(userId: string, jobId: number): Promise<void>;
  unsaveJob(userId: string, jobId: number): Promise<void>;
  getSavedJobs(userId: string): Promise<(Job & { company: Company })[]>;
  
  // Trending/popular data
  getTrendingSearches(): Promise<{ search: string; count: number }[]>;
  getPopularCities(): Promise<{ city: string; count: number }[]>;
  getPopularCompanies(): Promise<{ company: Company; jobCount: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompaniesByEmployer(employerId: string): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.employerId, employerId));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJobs(options: {
    search?: string;
    location?: string;
    jobType?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Job[]> {
    const { search, location, jobType, category, limit = 50, offset = 0 } = options;

    let query = db.select().from(jobs).where(eq(jobs.isActive, true));

    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`)
        )
      );
    }
    
    if (location) {
      conditions.push(ilike(jobs.location, `%${location}%`));
    }
    
    if (jobType) {
      conditions.push(eq(jobs.jobType, jobType));
    }
    
    if (category) {
      conditions.push(eq(jobs.category, category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getJobById(id: number): Promise<(Job & { company: Company; poster: User }) | undefined> {
    const result = await db
      .select()
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .innerJoin(users, eq(jobs.postedBy, users.id))
      .where(eq(jobs.id, id));

    if (result.length === 0) return undefined;

    const { jobs: job, companies: company, users: poster } = result[0];
    return { ...job, company, poster };
  }

  async getJobsByCompany(companyId: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.companyId, companyId), eq(jobs.isActive, true)))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsByPoster(posterId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.postedBy, posterId))
      .orderBy(desc(jobs.createdAt));
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: number): Promise<void> {
    await db.update(jobs).set({ isActive: false }).where(eq(jobs.id, id));
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplicationsByJob(jobId: number): Promise<(Application & { applicant: User })[]> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(users, eq(applications.applicantId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    return result.map(({ applications: app, users: applicant }) => ({ ...app, applicant }));
  }

  async getApplicationsByUser(userId: string): Promise<(Application & { job: Job & { company: Company } })[]> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.applicantId, userId))
      .orderBy(desc(applications.appliedAt));

    return result.map(({ applications: app, jobs: job, companies: company }) => ({
      ...app,
      job: { ...job, company }
    }));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Saved jobs operations
  async saveJob(userId: string, jobId: number): Promise<void> {
    await db.insert(savedJobs).values({ userId, jobId }).onConflictDoNothing();
  }

  async unsaveJob(userId: string, jobId: number): Promise<void> {
    await db.delete(savedJobs).where(
      and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId))
    );
  }

  async getSavedJobs(userId: string): Promise<(Job & { company: Company })[]> {
    const result = await db
      .select()
      .from(savedJobs)
      .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(savedJobs.userId, userId))
      .orderBy(desc(savedJobs.savedAt));

    return result.map(({ jobs: job, companies: company }) => ({ ...job, company }));
  }

  // Trending/popular data
  async getTrendingSearches(): Promise<{ search: string; count: number }[]> {
    // This would typically come from search analytics
    // For now, return static trending searches
    return [
      { search: "Content Writer Remote", count: 1250 },
      { search: "Digital Marketing Remote", count: 980 },
      { search: "Software Developer Bangalore", count: 850 },
      { search: "Data Analyst Mumbai", count: 720 },
      { search: "HR Executive Delhi", count: 650 },
      { search: "Java Developer Remote", count: 580 },
      { search: "Graphic Designer Remote", count: 420 },
      { search: "Sales Executive Chennai", count: 380 },
    ];
  }

  async getPopularCities(): Promise<{ city: string; count: number }[]> {
    // This would be derived from job locations
    return [
      { city: "Bangalore, Karnataka", count: 2340 },
      { city: "Mumbai, Maharashtra", count: 1890 },
      { city: "Delhi, Delhi", count: 1650 },
      { city: "Pune, Maharashtra", count: 1420 },
      { city: "Chennai, Tamil Nadu", count: 1180 },
      { city: "Hyderabad, Telangana", count: 980 },
      { city: "Kolkata, West Bengal", count: 750 },
      { city: "Ahmedabad, Gujarat", count: 680 },
      { city: "Jaipur, Rajasthan", count: 520 },
      { city: "Kochi, Kerala", count: 450 },
      { city: "Lucknow, Uttar Pradesh", count: 380 },
      { city: "Remote", count: 3200 },
    ];
  }

  async getPopularCompanies(): Promise<{ company: Company; jobCount: number }[]> {
    // This would be derived from actual job postings
    // For now, return empty array since we need real companies
    return [];
  }
}

export const storage = new DatabaseStorage();
