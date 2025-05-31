import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Download, 
  FileText, 
  Brain, 
  Sparkles,
  Copy,
  RefreshCw,
  X,
  Briefcase
} from "lucide-react";

export default function CoverLetterGenerator() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generator");
  
  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [userBackground, setUserBackground] = useState("");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  
  // Generated content state
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [improvementFeedback, setImprovementFeedback] = useState("");
  const [improvedCoverLetter, setImprovedCoverLetter] = useState("");

  // Get user's job applications for quick access to job details
  const { data: appliedJobs = [] } = useQuery({
    queryKey: ["/api/applications/my"],
    enabled: isAuthenticated,
  });

  // Get available jobs for reference
  const { data: availableJobs = [] } = useQuery({
    queryKey: ["/api/jobs", { limit: 20 }],
    enabled: isAuthenticated,
  });

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
    if (user) {
      setUserBackground(user.bio || "");
    }
  }, [user]);

  // Auto-fill when job is selected
  useEffect(() => {
    if (selectedJobId) {
      const job = availableJobs.find((j: any) => j.id.toString() === selectedJobId);
      if (job) {
        setJobTitle(job.title);
        setCompanyName(job.company?.name || "");
        setJobDescription(job.description);
      }
    }
  }, [selectedJobId, availableJobs]);

  const generateCoverLetterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-cover-letter", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCoverLetter(data.coverLetter);
      setActiveTab("preview");
      toast({
        title: "Cover Letter Generated",
        description: "Your AI-powered cover letter has been created successfully!",
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
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const improveCoverLetterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/improve-cover-letter", data);
      return response.json();
    },
    onSuccess: (data) => {
      setImprovedCoverLetter(data.improvedCoverLetter);
      setActiveTab("improved");
      toast({
        title: "Cover Letter Improved",
        description: "Your cover letter has been enhanced based on your feedback!",
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
        description: "Failed to improve cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCoverLetter = () => {
    const userName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Applicant";
    
    const data = {
      jobTitle,
      companyName,
      jobDescription,
      userBackground,
      userSkills,
      userName
    };
    
    generateCoverLetterMutation.mutate(data);
  };

  const handleImproveCoverLetter = () => {
    if (!generatedCoverLetter || !improvementFeedback.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide feedback for improvement.",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      originalCoverLetter: generatedCoverLetter,
      jobDescription,
      feedback: improvementFeedback
    };
    
    improveCoverLetterMutation.mutate(data);
  };

  const addSkill = () => {
    if (skillInput.trim() && !userSkills.includes(skillInput.trim())) {
      setUserSkills([...userSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Cover letter copied to clipboard",
    });
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Cover Letter Generator</h1>
          <p className="text-slate-600">Create personalized, professional cover letters with AI assistance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="improved">Improved</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Input Form */}
              <div className="space-y-6">
                
                {/* Quick Job Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Select from Available Jobs
                        </label>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a job to auto-fill details" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableJobs.map((job: any) => (
                              <SelectItem key={job.id} value={job.id.toString()}>
                                {job.title} at {job.company?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-slate-500">
                        Or fill out the details manually below
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Job Title *
                        </label>
                        <Input
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Company Name *
                        </label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g., Tech Corp"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Job Description *
                      </label>
                      <Textarea
                        rows={6}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Your Background */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Professional Background
                      </label>
                      <Textarea
                        rows={4}
                        value={userBackground}
                        onChange={(e) => setUserBackground(e.target.value)}
                        placeholder="Briefly describe your professional background, experience, and career highlights..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Relevant Skills
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            placeholder="Add a relevant skill"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                          <Button onClick={addSkill} type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {userSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {userSkills.map((skill, index) => (
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Generation */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      AI Cover Letter Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">What our AI will do:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Analyze the job requirements and match them to your skills</li>
                          <li>• Create a personalized, professional cover letter</li>
                          <li>• Include relevant keywords for ATS compatibility</li>
                          <li>• Maintain an appropriate tone and structure</li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={generateCoverLetterMutation.isPending || !jobTitle || !companyName || !jobDescription}
                        className="w-full"
                      >
                        {generateCoverLetterMutation.isPending ? (
                          <>
                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                            Generating Cover Letter...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate AI Cover Letter
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {generatedCoverLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {generatedCoverLetter.substring(0, 300)}...
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
                          onClick={() => copyToClipboard(generatedCoverLetter)}
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

                {/* Improvement Section */}
                {generatedCoverLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
                        Improve Your Cover Letter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          What would you like to improve?
                        </label>
                        <Textarea
                          rows={3}
                          value={improvementFeedback}
                          onChange={(e) => setImprovementFeedback(e.target.value)}
                          placeholder="e.g., Make it more enthusiastic, add more technical details, focus on leadership experience..."
                        />
                      </div>
                      <Button
                        onClick={handleImproveCoverLetter}
                        disabled={improveCoverLetterMutation.isPending || !improvementFeedback.trim()}
                        className="w-full"
                      >
                        {improveCoverLetterMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Improving Cover Letter...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Improve Cover Letter
                          </>
                        )}
                      </Button>
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
                  <CardTitle>Generated Cover Letter</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(generatedCoverLetter)}
                      variant="outline"
                      size="sm"
                      disabled={!generatedCoverLetter}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsText(generatedCoverLetter, 'cover-letter.txt')}
                      size="sm"
                      disabled={!generatedCoverLetter}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {generatedCoverLetter ? (
                  <div className="bg-white border rounded-lg p-8">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedCoverLetter}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No cover letter generated yet. Go to the Generator tab to create one.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Improved Tab */}
          <TabsContent value="improved">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
                    Improved Cover Letter
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(improvedCoverLetter)}
                      variant="outline"
                      size="sm"
                      disabled={!improvedCoverLetter}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsText(improvedCoverLetter, 'improved-cover-letter.txt')}
                      size="sm"
                      disabled={!improvedCoverLetter}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {improvedCoverLetter ? (
                  <div className="space-y-6">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Improvements Applied:</h4>
                      <p className="text-sm text-orange-800">{improvementFeedback}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-8">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {improvedCoverLetter}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No improved cover letter yet. Generate a cover letter first, then request improvements.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-slate-900">Strong Opening</h4>
                      <p className="text-sm text-slate-600">Start with enthusiasm and mention the specific role you're applying for.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Match Requirements</h4>
                      <p className="text-sm text-slate-600">Directly address the key requirements mentioned in the job posting.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Show Value</h4>
                      <p className="text-sm text-slate-600">Explain what you can bring to the company, not just what you want from them.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Call to Action</h4>
                      <p className="text-sm text-slate-600">End with a clear next step and express your interest in an interview.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Mistakes to Avoid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-red-600">Generic Content</h4>
                      <p className="text-sm text-slate-600">Avoid using the same cover letter for every application.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">Repeating Your Resume</h4>
                      <p className="text-sm text-slate-600">Use the cover letter to expand on your resume, not repeat it.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">Too Long</h4>
                      <p className="text-sm text-slate-600">Keep it concise - aim for 3-4 paragraphs maximum.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">Poor Formatting</h4>
                      <p className="text-sm text-slate-600">Use a clean, professional format that's easy to read.</p>
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