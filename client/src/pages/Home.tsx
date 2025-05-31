import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import JobCard from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, BookmarkIcon, TrendingUp } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    location: "",
    jobType: "",
    category: "",
    experienceLevel: "",
    salaryRange: [0, 300000] as number[],
    postedWithin: "",
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", searchFilters],
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ["/api/saved-jobs"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications/my"],
  });

  const { data: trendingSearches = [] } = useQuery({
    queryKey: ["/api/trending/searches"],
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Welcome Back Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Job Seeker'}!
            </h1>
            <p className="text-xl text-blue-100">Find your next opportunity</p>
          </div>
          
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-900">{applications.length}</h3>
              <p className="text-slate-600">Applications Sent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <BookmarkIcon className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-900">{savedJobs.length}</h3>
              <p className="text-slate-600">Saved Jobs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-900">{jobs.length}</h3>
              <p className="text-slate-600">Jobs Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Applications</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              {applications.slice(0, 3).map((application: any) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {application.job.title}
                        </h3>
                        <p className="text-primary font-medium mb-2">{application.job.company.name}</p>
                        <p className="text-slate-600 text-sm">
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Job Recommendations */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Recommended Jobs</h2>
            <Button variant="outline" size="sm">View All Jobs</Button>
          </div>
          
          {jobsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                    <div className="h-16 bg-slate-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-8 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Searches */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Trending Searches</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {trendingSearches.slice(0, 10).map((item: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch({ ...searchFilters, search: item.search })}
                    className="text-sm"
                  >
                    {item.search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      <Footer />
    </div>
  );
}
