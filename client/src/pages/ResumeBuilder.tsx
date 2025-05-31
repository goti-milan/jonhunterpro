import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  Brain, 
  CheckCircle,
  X,
  Copy
} from "lucide-react";

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

export default function ResumeBuilder() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("builder");
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: ""
  });
  
  const [experience, setExperience] = useState<Experience[]>([
    { title: "", company: "", duration: "", description: "" }
  ]);
  
  const [education, setEducation] = useState<Education[]>([
    { degree: "", institution: "", year: "" }
  ]);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  
  // Generated content state
  const [generatedResume, setGeneratedResume] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Initialize with user data
  useEffect(() => {
    if (user && typeof user === 'object') {
      const userData = user as any;
      setPersonalInfo(prev => ({
        ...prev,
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || ""
      }));
    }
  }, [user]);

  const generateResumeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-resume", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedResume(data.resume);
      setActiveTab("preview");
      toast({
        title: "Resume Generated",
        description: "Your AI-powered resume has been created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateResume = () => {
    const data = {
      personalInfo,
      experience: experience.filter(exp => exp.title || exp.company),
      education: education.filter(edu => edu.degree || edu.institution),
      skills,
      targetRole
    };
    
    generateResumeMutation.mutate(data);
  };

  const addExperience = () => {
    setExperience([...experience, { title: "", company: "", duration: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setExperience(experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setEducation(education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    ));
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Resume Builder</h1>
          <p className="text-slate-600">Create professional resumes with AI assistance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder">Resume Builder</TabsTrigger>
            <TabsTrigger value="preview">Preview & Generate</TabsTrigger>
            <TabsTrigger value="tips">AI Tips</TabsTrigger>
          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="builder">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Form Section */}
              <div className="space-y-6">
                
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone
                        </label>
                        <Input
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Location
                        </label>
                        <Input
                          value={personalInfo.location}
                          onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Professional Summary
                      </label>
                      <Textarea
                        rows={3}
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                        placeholder="Brief overview of your professional background and career objectives..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Target Role
                      </label>
                      <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Software Engineer, Marketing Manager"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Work Experience */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Work Experience</CardTitle>
                      <Button onClick={addExperience} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {experience.map((exp, index) => (
                      <div key={index} className="space-y-4 pb-6 border-b border-slate-200 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-slate-900">Experience {index + 1}</h4>
                          {experience.length > 1 && (
                            <Button
                              onClick={() => removeExperience(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Job Title
                            </label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(index, "title", e.target.value)}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Company
                            </label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(index, "company", e.target.value)}
                              placeholder="Tech Corp"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Duration
                          </label>
                          <Input
                            value={exp.duration}
                            onChange={(e) => updateExperience(index, "duration", e.target.value)}
                            placeholder="Jan 2020 - Present"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                          </label>
                          <Textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(index, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Education</CardTitle>
                      <Button onClick={addEducation} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {education.map((edu, index) => (
                      <div key={index} className="space-y-4 pb-6 border-b border-slate-200 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-slate-900">Education {index + 1}</h4>
                          {education.length > 1 && (
                            <Button
                              onClick={() => removeEducation(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Degree
                            </label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Institution
                            </label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, "institution", e.target.value)}
                              placeholder="University Name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Year
                          </label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, "year", e.target.value)}
                            placeholder="2020"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button onClick={addSkill} type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      AI Resume Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-slate-600 text-sm">
                        Our AI will create a professional, ATS-optimized resume based on your information. 
                        The AI considers industry best practices and tailors content to your target role.
                      </p>
                      <Button
                        onClick={handleGenerateResume}
                        disabled={generateResumeMutation.isPending || !personalInfo.name || !personalInfo.email}
                        className="w-full"
                      >
                        {generateResumeMutation.isPending ? (
                          <>
                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                            Generating Resume...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate AI Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {generatedResume && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {generatedResume.substring(0, 500)}...
                        </pre>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          onClick={() => setActiveTab("preview")}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Full Preview
                        </Button>
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedResume);
                            toast({
                              title: "Copied",
                              description: "Resume copied to clipboard",
                            });
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResume);
                        toast({
                          title: "Copied",
                          description: "Resume copied to clipboard",
                        });
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!generatedResume}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([generatedResume], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'resume.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      size="sm"
                      disabled={!generatedResume}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {generatedResume ? (
                  <div className="bg-white border rounded-lg p-8">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {generatedResume}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No resume generated yet. Go to the Resume Builder tab to create one.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Use Standard Section Headers</h4>
                        <p className="text-sm text-slate-600">Use headers like "Work Experience", "Education", "Skills" that ATS can recognize.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Include Relevant Keywords</h4>
                        <p className="text-sm text-slate-600">Match keywords from the job description naturally throughout your resume.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Quantify Achievements</h4>
                        <p className="text-sm text-slate-600">Use numbers and percentages to showcase your impact and results.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Keep It Simple</h4>
                        <p className="text-sm text-slate-600">Avoid fancy formatting, tables, or graphics that ATS can't parse.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Resume Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Be Specific with Target Role</h4>
                        <p className="text-sm text-slate-600">The more specific your target role, the better our AI can tailor your resume.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Include Detailed Descriptions</h4>
                        <p className="text-sm text-slate-600">Provide rich context in your experience descriptions for better AI optimization.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Review and Customize</h4>
                        <p className="text-sm text-slate-600">Always review the AI-generated content and make personal adjustments.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Use Our ATS Analyzer</h4>
                        <p className="text-sm text-slate-600">Test your generated resume with our separate ATS Analyzer tool for optimization.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </main>

      <Footer />
    </div>
  );
}