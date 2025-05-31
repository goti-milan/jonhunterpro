import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateCoverLetter, generateResume, analyzeResumeATS, improveCoverLetter } from "./aiServices";
import { insertJobSchema, insertCompanySchema, insertApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const { search, location, jobType, category, limit, offset } = req.query;
      const jobs = await storage.getJobs({
        search: search as string,
        location: location as string,
        jobType: jobType as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobData = insertJobSchema.parse({
        ...req.body,
        postedBy: userId,
      });
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this job or the company
      const existingJob = await storage.getJobById(id);
      if (!existingJob || existingJob.postedBy !== userId) {
        return res.status(403).json({ message: "Unauthorized to edit this job" });
      }

      const updates = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, updates);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this job
      const existingJob = await storage.getJobById(id);
      if (!existingJob || existingJob.postedBy !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this job" });
      }

      await storage.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Company routes
  app.get('/api/companies/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companies = await storage.getCompaniesByEmployer(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyData = insertCompanySchema.parse({
        ...req.body,
        employerId: userId,
      });
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        applicantId: userId,
      });
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/jobs/:id/applications', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this job
      const job = await storage.getJobById(jobId);
      if (!job || job.postedBy !== userId) {
        return res.status(403).json({ message: "Unauthorized to view applications" });
      }

      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Saved jobs routes
  app.post('/api/saved-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobId } = req.body;
      await storage.saveJob(userId, jobId);
      res.status(201).json({ message: "Job saved successfully" });
    } catch (error) {
      console.error("Error saving job:", error);
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  app.delete('/api/saved-jobs/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = parseInt(req.params.jobId);
      await storage.unsaveJob(userId, jobId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unsaving job:", error);
      res.status(500).json({ message: "Failed to unsave job" });
    }
  });

  app.get('/api/saved-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedJobs = await storage.getSavedJobs(userId);
      res.json(savedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  // Trending data routes
  app.get('/api/trending/searches', async (req, res) => {
    try {
      const searches = await storage.getTrendingSearches();
      res.json(searches);
    } catch (error) {
      console.error("Error fetching trending searches:", error);
      res.status(500).json({ message: "Failed to fetch trending searches" });
    }
  });

  app.get('/api/popular/cities', async (req, res) => {
    try {
      const cities = await storage.getPopularCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching popular cities:", error);
      res.status(500).json({ message: "Failed to fetch popular cities" });
    }
  });

  app.get('/api/popular/companies', async (req, res) => {
    try {
      const companies = await storage.getPopularCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching popular companies:", error);
      res.status(500).json({ message: "Failed to fetch popular companies" });
    }
  });

  // AI-powered resume and cover letter routes
  app.post('/api/ai/generate-cover-letter', isAuthenticated, async (req: any, res) => {
    try {
      const { jobTitle, companyName, jobDescription, userBackground, userSkills, userName } = req.body;
      
      if (!jobTitle || !companyName || !jobDescription || !userName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const coverLetter = await generateCoverLetter({
        jobTitle,
        companyName,
        jobDescription,
        userBackground: userBackground || "",
        userSkills: userSkills || [],
        userName
      });

      res.json({ coverLetter });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.post('/api/ai/generate-resume', isAuthenticated, async (req: any, res) => {
    try {
      const { personalInfo, experience, education, skills, targetRole } = req.body;
      
      if (!personalInfo || !personalInfo.name) {
        return res.status(400).json({ message: "Personal information is required" });
      }

      const resume = await generateResume({
        personalInfo,
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        targetRole: targetRole || "Professional"
      });

      res.json({ resume });
    } catch (error) {
      console.error("Error generating resume:", error);
      res.status(500).json({ message: "Failed to generate resume" });
    }
  });

  app.post('/api/ai/analyze-resume', isAuthenticated, async (req: any, res) => {
    try {
      const { resumeText, targetJob } = req.body;
      
      if (!resumeText) {
        return res.status(400).json({ message: "Resume text is required" });
      }

      const analysis = await analyzeResumeATS(resumeText, targetJob);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  app.post('/api/ai/improve-cover-letter', isAuthenticated, async (req: any, res) => {
    try {
      const { originalCoverLetter, jobDescription, feedback } = req.body;
      
      if (!originalCoverLetter || !jobDescription || !feedback) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const improvedCoverLetter = await improveCoverLetter(originalCoverLetter, jobDescription, feedback);
      res.json({ improvedCoverLetter });
    } catch (error) {
      console.error("Error improving cover letter:", error);
      res.status(500).json({ message: "Failed to improve cover letter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
