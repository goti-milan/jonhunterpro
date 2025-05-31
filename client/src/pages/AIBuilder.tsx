import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Sparkles, FileText, User, Briefcase, GraduationCap, Code } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

export default function AIBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Resume Builder State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    { title: "", company: "", duration: "", description: "" },
  ]);

  const [education, setEducation] = useState<Education[]>([
    { degree: "", institution: "", year: "" },
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [generatedResume, setGeneratedResume] = useState<string>("");

  // Cover Letter State
  const [coverLetterForm, setCoverLetterForm] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    userBackground: "",
    userSkills: [] as string[],
    userName: user?.firstName || "",
  });

  const [coverLetterSkillInput, setCoverLetterSkillInput] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>("");

  // Available jobs query
  const { data: availableJobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Resume generation mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/ai/generate-resume", "POST", {
        personalInfo,
        experience: experiences,
        education,
        skills,
        targetRole,
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedResume(data.resume);
      toast({
        title: "Resume Generated!",
        description: "Your AI-powered resume has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cover letter generation mutation
  const coverLetterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/ai/generate-cover-letter", "POST", coverLetterForm);
      return response;
    },
    onSuccess: (data) => {
      setGeneratedCoverLetter(data.coverLetter);
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions for Resume Builder
  const addExperience = () => {
    setExperiences([...experiences, { title: "", company: "", duration: "", description: "" }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = experiences.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp));
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu));
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Helper functions for Cover Letter
  const addCoverLetterSkill = () => {
    if (coverLetterSkillInput.trim() && !coverLetterForm.userSkills.includes(coverLetterSkillInput.trim())) {
      setCoverLetterForm({
        ...coverLetterForm,
        userSkills: [...coverLetterForm.userSkills, coverLetterSkillInput.trim()]
      });
      setCoverLetterSkillInput("");
    }
  };

  const removeCoverLetterSkill = (skillToRemove: string) => {
    setCoverLetterForm({
      ...coverLetterForm,
      userSkills: coverLetterForm.userSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const fillFromJob = (job: any) => {
    setCoverLetterForm({
      ...coverLetterForm,
      jobTitle: job.title || "",
      companyName: job.company?.name || "",
      jobDescription: job.description || "",
    });
  };

  const downloadResume = () => {
    if (!generatedResume) return;
    
    const blob = new Blob([generatedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name || 'resume'}_resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCoverLetter = () => {
    if (!generatedCoverLetter) return;
    
    const blob = new Blob([generatedCoverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${coverLetterForm.userName || 'cover'}_cover_letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            AI-Powered Career Builder
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create professional resumes and cover letters with the power of AI
          </p>
        </div>

        <Tabs defaultValue="resume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              AI Resume
            </TabsTrigger>
            <TabsTrigger value="cover-letter" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Cover Letter
            </TabsTrigger>
          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="resume" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Resume Input Form */}
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={personalInfo.location}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                        placeholder="Brief summary of your professional background..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                    <Button onClick={addExperience} variant="outline" size="sm">
                      Add Experience
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experiences.map((exp, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          {experiences.length > 1 && (
                            <Button
                              onClick={() => removeExperience(index)}
                              variant="outline"
                              size="sm"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            placeholder="Job Title"
                          />
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            placeholder="Company Name"
                          />
                        </div>
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, "duration", e.target.value)}
                          placeholder="Duration (e.g., Jan 2020 - Present)"
                        />
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                    <Button onClick={addEducation} variant="outline" size="sm">
                      Add Education
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          {education.length > 1 && (
                            <Button
                              onClick={() => removeEducation(index)}
                              variant="outline"
                              size="sm"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="Degree"
                          />
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, "year", e.target.value)}
                            placeholder="Year"
                          />
                        </div>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, "institution", e.target.value)}
                          placeholder="Institution Name"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Enter a skill"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill} type="button">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Target Role */}
                <Card>
                  <CardHeader>
                    <CardTitle>Target Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Marketing Manager"
                    />
                  </CardContent>
                </Card>

                <Button
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {resumeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Resume
                    </>
                  )}
                </Button>
              </div>

              {/* Resume Preview */}
              <div>
                <Card className="h-fit">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Resume</CardTitle>
                    {generatedResume && (
                      <Button onClick={downloadResume} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {generatedResume ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded border">
                          {generatedResume}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your generated resume will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover-letter" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cover Letter Input Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Letter Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Your Name</Label>
                      <Input
                        id="userName"
                        value={coverLetterForm.userName}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, userName: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={coverLetterForm.jobTitle}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobTitle: e.target.value })}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={coverLetterForm.companyName}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, companyName: e.target.value })}
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea
                        id="jobDescription"
                        value={coverLetterForm.jobDescription}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobDescription: e.target.value })}
                        placeholder="Paste the job description here..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="userBackground">Your Background</Label>
                      <Textarea
                        id="userBackground"
                        value={coverLetterForm.userBackground}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, userBackground: e.target.value })}
                        placeholder="Tell us about your professional background, achievements, and relevant experience..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Your Skills</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={coverLetterSkillInput}
                          onChange={(e) => setCoverLetterSkillInput(e.target.value)}
                          placeholder="Enter a skill"
                          onKeyPress={(e) => e.key === "Enter" && addCoverLetterSkill()}
                        />
                        <Button onClick={addCoverLetterSkill} type="button">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coverLetterForm.userSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeCoverLetterSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {Array.isArray(availableJobs) && availableJobs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Fill from Available Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {availableJobs.slice(0, 3).map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-slate-600">{job.company?.name}</p>
                            </div>
                            <Button onClick={() => fillFromJob(job)} variant="outline" size="sm">
                              Use This Job
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={() => coverLetterMutation.mutate()}
                  disabled={coverLetterMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {coverLetterMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Cover Letter
                    </>
                  )}
                </Button>
              </div>

              {/* Cover Letter Preview */}
              <div>
                <Card className="h-fit">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Cover Letter</CardTitle>
                    {generatedCoverLetter && (
                      <Button onClick={downloadCoverLetter} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {generatedCoverLetter ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded border">
                          {generatedCoverLetter}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your generated cover letter will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}