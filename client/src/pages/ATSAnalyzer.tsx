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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  CheckCircle, 
  AlertCircle,
  FileText,
  Upload
} from "lucide-react";

interface ATSAnalysis {
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

export default function ATSAnalyzer() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);

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

  const analyzeResumeMutation = useMutation({
    mutationFn: async (data: { resumeText: string; targetJob?: string }) => {
      const response = await apiRequest("POST", "/api/ai/analyze-resume", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAtsAnalysis(data);
      toast({
        title: "ATS Analysis Complete",
        description: `Your resume scored ${data.score}/100 for ATS compatibility.`,
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
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please paste your resume text for ATS analysis.",
        variant: "destructive",
      });
      return;
    }
    
    analyzeResumeMutation.mutate({
      resumeText: resumeText,
      targetJob: jobDescription.trim() || undefined
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "File Type Error",
        description: "Please upload a .txt file containing your resume text.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ATS Resume Analyzer</h1>
          <p className="text-slate-600">Analyze your resume for ATS compatibility and get actionable improvement tips</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Resume Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Resume File (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">Click to upload</span> your resume
                        </p>
                        <p className="text-xs text-slate-500">TXT files only</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".txt"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resume Text *
                  </label>
                  <Textarea
                    rows={12}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your complete resume text here for ATS analysis..."
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Target Job Description (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Description
                  </label>
                  <Textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description to get targeted analysis and keyword matching..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Adding a job description will provide more targeted keyword analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleAnalyzeResume}
                  disabled={analyzeResumeMutation.isPending || !resumeText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {analyzeResumeMutation.isPending ? (
                    <>
                      <TrendingUp className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Analyze ATS Compatibility
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {atsAnalysis ? (
              <>
                {/* Overall Score */}
                <Card>
                  <CardHeader>
                    <CardTitle>ATS Compatibility Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-6xl font-bold mb-2 ${getScoreColor(atsAnalysis.score)}`}>
                        {atsAnalysis.score}
                      </div>
                      <div className="text-slate-600 mb-4">out of 100</div>
                      <Progress value={atsAnalysis.score} className="mb-4" />
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(atsAnalysis.score)} ${getScoreColor(atsAnalysis.score)}`}>
                        {atsAnalysis.score >= 80 ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1" />
                        )}
                        {atsAnalysis.score >= 80 ? "Excellent" : atsAnalysis.score >= 60 ? "Good" : "Needs Improvement"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Section Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(atsAnalysis.sectionsAnalysis).map(([section, score]) => (
                      <div key={section} className="flex items-center justify-between">
                        <span className="capitalize font-medium">{section}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={score} className="w-24" />
                          <span className={`font-medium w-10 text-right ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Improvement Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {atsAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Keywords Analysis */}
                {(atsAnalysis.keywordMatches.length > 0 || atsAnalysis.missingKeywords.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {atsAnalysis.keywordMatches.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-600 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Found Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {atsAnalysis.keywordMatches.map((keyword, index) => (
                              <Badge key={index} className="bg-green-100 text-green-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {atsAnalysis.missingKeywords.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Missing Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {atsAnalysis.missingKeywords.map((keyword, index) => (
                              <Badge key={index} className="bg-red-100 text-red-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Consider adding these keywords naturally to your resume
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Format Issues */}
                {atsAnalysis.formatIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Format Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {atsAnalysis.formatIssues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* ATS Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle>ATS Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm">Use Standard Headers</h4>
                          <p className="text-xs text-slate-600">Use headers like "Work Experience", "Education", "Skills"</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm">Include Relevant Keywords</h4>
                          <p className="text-xs text-slate-600">Match keywords from job descriptions naturally</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm">Simple Formatting</h4>
                          <p className="text-xs text-slate-600">Avoid tables, graphics, or complex layouts</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-sm">Standard File Formats</h4>
                          <p className="text-xs text-slate-600">Submit as .docx or .pdf for best compatibility</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-slate-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                  <p>Paste your resume text and click "Analyze ATS Compatibility" to get started.</p>
                  <div className="mt-4 text-sm">
                    <p className="font-medium mb-1">What we'll analyze:</p>
                    <ul className="text-left inline-block">
                      <li>• ATS compatibility score (0-100)</li>
                      <li>• Keyword matching and gaps</li>
                      <li>• Format optimization</li>
                      <li>• Section-by-section breakdown</li>
                      <li>• Actionable improvement tips</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}