import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Calendar, BookmarkIcon, DollarSign } from "lucide-react";
import type { Job, Company } from "@shared/schema";

interface JobCardProps {
  job: Job & { company?: Company };
}

export default function JobCard({ job }: JobCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const getJobTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'remote': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'full-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'part-time': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'contract': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getUrgencyColor = (daysAgo: number) => {
    if (daysAgo <= 1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (daysAgo <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return null;
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Posted ${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getDaysAgo = (date: string | Date) => {
    const now = new Date();
    const posted = new Date(date);
    return Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      return;
    }
    
    saveJobMutation.mutate(job.id);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    // Navigate to job details page for application
    window.location.href = `/jobs/${job.id}`;
  };

  const daysAgo = getDaysAgo(job.createdAt);
  const urgencyColor = getUrgencyColor(daysAgo);

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="job-card cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center text-primary font-medium mb-1">
                <Building className="h-4 w-4 mr-1" />
                {job.company?.name || 'Company'}
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-400 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center text-slate-600 dark:text-slate-400 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getJobTypeColor(job.jobType)}>
                {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
              </Badge>
              {urgencyColor && (
                <Badge className={urgencyColor}>
                  {daysAgo <= 1 ? 'Urgent' : 'New'}
                </Badge>
              )}
              {job.experienceLevel && (
                <Badge variant="outline" className="text-xs">
                  {job.experienceLevel} level
                </Badge>
              )}
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
            {job.description}
          </p>

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {job.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {formatTimeAgo(job.createdAt)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveJob}
                disabled={saveJobMutation.isPending}
                className="flex items-center gap-1"
              >
                <BookmarkIcon className="h-4 w-4" />
                {saveJobMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                onClick={handleApplyClick}
                className="bg-primary text-white hover:bg-secondary transition-colors"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
