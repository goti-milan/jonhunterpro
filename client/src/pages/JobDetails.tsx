import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign, 
  Clock, 
  BookmarkIcon,
  Share2,
  ArrowLeft,
  User
} from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { jobId: number; coverLetter: string }) => {
      await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
      setShowApplicationForm(false);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications/my"] });
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
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("POST", "/api/saved-jobs", { jobId });
    },
    onSuccess: () => {
      toast({
        title: "Job Saved",
        description: "Job has been saved to your favorites!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
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
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job?.id) return;
    
    applyMutation.mutate({
      jobId: job.id,
      coverLetter: coverLetter.trim(),
    });
  };

  const handleSaveJob = () => {
    if (!job?.id) return;
    saveJobMutation.mutate(job.id);
  };

  const getJobTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'remote': return 'bg-green-100 text-green-800';
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-slate-200 rounded mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h1>
              <p className="text-slate-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <Button>← Back to Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        {/* Job Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-lg text-primary font-medium mb-4">
                  <Building className="h-5 w-5 mr-2" />
                  {job.company.name}
                </div>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${job.salaryMin} - ${job.salaryMax}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Badge className={getJobTypeColor(job.jobType)}>
                  {job.jobType}
                </Badge>
                {job.experienceLevel && (
                  <Badge variant="outline">
                    {job.experienceLevel} level
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-primary"
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Applying..." : "Apply Now"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSaveJob}
                    disabled={saveJobMutation.isPending}
                  >
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    {saveJobMutation.isPending ? "Saving..." : "Save Job"}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="btn-primary"
                >
                  Sign In to Apply
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        {showApplicationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Apply for {job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label htmlFor="cover-letter" className="block text-sm font-medium text-slate-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <Textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're interested in this position..."
                    rows={6}
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Job Details */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {job.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  About {job.company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.company.description && (
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {job.company.description}
                  </p>
                )}
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  {job.company.industry && (
                    <div>
                      <span className="font-medium text-slate-900">Industry:</span>
                      <span className="text-slate-600 ml-2">{job.company.industry}</span>
                    </div>
                  )}
                  {job.company.location && (
                    <div>
                      <span className="font-medium text-slate-900">Location:</span>
                      <span className="text-slate-600 ml-2">{job.company.location}</span>
                    </div>
                  )}
                  {job.company.website && (
                    <div>
                      <span className="font-medium text-slate-900">Website:</span>
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary ml-2"
                      >
                        Visit Company Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">Job Type:</span>
                  <Badge className={getJobTypeColor(job.jobType)}>
                    {job.jobType}
                  </Badge>
                </div>
                
                {job.experienceLevel && (
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-900">Experience:</span>
                    <span className="text-slate-600">{job.experienceLevel} level</span>
                  </div>
                )}
                
                {job.category && (
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-900">Category:</span>
                    <span className="text-slate-600">{job.category}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">Posted:</span>
                  <span className="text-slate-600">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Posted By */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Posted By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    {job.poster.firstName} {job.poster.lastName}
                  </p>
                  {job.poster.email && (
                    <p className="text-slate-600">{job.poster.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
