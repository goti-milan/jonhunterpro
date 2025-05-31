import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CoverLetterRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  userBackground: string;
  userSkills: string[];
  userName: string;
}

export interface ResumeRequest {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  targetRole: string;
}

export interface ATSAnalysisResult {
  score: number;
  recommendations: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  formatIssues: string[];
  sectionsAnalysis: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
}

export async function generateCoverLetter(request: CoverLetterRequest): Promise<string> {
  try {
    const prompt = `Create a professional cover letter for ${request.userName} applying for the position of ${request.jobTitle} at ${request.companyName}.

Job Description:
${request.jobDescription}

Applicant Background:
${request.userBackground}

Applicant Skills:
${request.userSkills.join(", ")}

Requirements:
- Make it professional and engaging
- Match the tone to the company and role
- Highlight relevant skills and experience
- Include specific examples when possible
- Keep it concise (3-4 paragraphs)
- End with a strong call to action
- Use proper business letter format

Please create a personalized cover letter that effectively matches the candidate's background to the job requirements.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "Failed to generate cover letter";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter with AI");
  }
}

export async function generateResume(request: ResumeRequest): Promise<string> {
  try {
    const prompt = `Create a professional, ATS-optimized resume for ${request.personalInfo.name} targeting the role of ${request.targetRole}.

Personal Information:
- Name: ${request.personalInfo.name}
- Email: ${request.personalInfo.email}
- Phone: ${request.personalInfo.phone}
- Location: ${request.personalInfo.location}
- Summary: ${request.personalInfo.summary}

Work Experience:
${request.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}`).join('\n')}

Education:
${request.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}

Skills:
${request.skills.join(', ')}

Requirements:
- Use a clean, ATS-friendly format
- Include quantifiable achievements where possible
- Use strong action verbs
- Optimize for the target role
- Include relevant keywords
- Use standard section headers
- Keep it professional and concise
- Format as plain text with clear section divisions

Create a compelling resume that highlights the candidate's strengths for the target role.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 1200,
    });

    return response.choices[0].message.content || "Failed to generate resume";
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to generate resume with AI");
  }
}

export async function analyzeResumeATS(resumeText: string, targetJob?: string): Promise<ATSAnalysisResult> {
  try {
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed scoring and recommendations.

Resume Text:
${resumeText}

${targetJob ? `Target Job Description:\n${targetJob}\n` : ''}

Please provide a comprehensive ATS analysis with:
1. Overall ATS compatibility score (0-100)
2. Specific recommendations for improvement
3. Keywords found that match common job requirements
4. Missing keywords that should be added
5. Format issues that could cause ATS problems
6. Section-by-section analysis (contact, summary, experience, education, skills) with scores 0-100

Respond in JSON format with this structure:
{
  "score": number,
  "recommendations": ["recommendation1", "recommendation2"],
  "keywordMatches": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "formatIssues": ["issue1", "issue2"],
  "sectionsAnalysis": {
    "contact": number,
    "summary": number,
    "experience": number,
    "education": number,
    "skills": number
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS and resume analysis specialist. Provide detailed, actionable feedback for improving resume ATS compatibility. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure all required fields exist with defaults
    return {
      score: analysis.score || 50,
      recommendations: analysis.recommendations || ["Add more relevant keywords", "Improve formatting consistency"],
      keywordMatches: analysis.keywordMatches || [],
      missingKeywords: analysis.missingKeywords || [],
      formatIssues: analysis.formatIssues || [],
      sectionsAnalysis: {
        contact: analysis.sectionsAnalysis?.contact || 70,
        summary: analysis.sectionsAnalysis?.summary || 60,
        experience: analysis.sectionsAnalysis?.experience || 65,
        education: analysis.sectionsAnalysis?.education || 75,
        skills: analysis.sectionsAnalysis?.skills || 55
      }
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume with AI");
  }
}

export async function improveCoverLetter(
  originalCoverLetter: string,
  jobDescription: string,
  feedback: string
): Promise<string> {
  try {
    const prompt = `Improve this cover letter based on the specific feedback provided.

Original Cover Letter:
${originalCoverLetter}

Job Description:
${jobDescription}

Improvement Feedback:
${feedback}

Requirements:
- Apply the specific feedback requested
- Maintain the professional tone and structure
- Keep the same length or make it more concise
- Ensure it remains relevant to the job description
- Preserve the core message while enhancing weak areas
- Make the improvements natural and seamless

Please provide the improved cover letter that addresses the feedback while maintaining professionalism.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "Failed to improve cover letter";
  } catch (error) {
    console.error("Error improving cover letter:", error);
    throw new Error("Failed to improve cover letter with AI");
  }
}