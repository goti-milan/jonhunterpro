import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Briefcase, TrendingUp, Building, MapPinIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs", { limit: 6 }],
  });

  const { data: trendingSearches = [] } = useQuery({
    queryKey: ["/api/trending/searches"],
  });

  const { data: popularCities = [] } = useQuery({
    queryKey: ["/api/popular/cities"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search submitted:", { searchQuery, locationQuery });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Next Great Job</h1>
            <p className="text-xl text-blue-100 mb-8">Millions of jobs. Find the one that's right for you.</p>
            
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="job-search" className="sr-only">Job title or keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      id="job-search"
                      type="text"
                      placeholder="Job title or keyword"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="location-search" className="sr-only">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      id="location-search"
                      type="text"
                      placeholder="City or state"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="search-input text-slate-900"
                    />
                  </div>
                </div>
                <Button type="submit" className="btn-primary px-8 py-3">
                  Find Jobs
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Welcome Section */}
        <Card className="mb-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to JobConnect!</h2>
            <p className="text-slate-600 mb-6">Create an account or sign in to see your personalized job recommendations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="btn-primary"
              >
                Get Started
              </Button>
              <a href="#" className="text-primary hover:text-secondary font-medium flex items-center justify-center">
                Post your resume - It only takes a few seconds
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Employers: <a href="#" className="text-primary hover:text-secondary font-medium">Post a job</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trending Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">What's trending on JobConnect</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Trending Searches */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                  <TrendingUp className="text-orange-500 mr-2 h-5 w-5" />
                  Trending Searches
                </h3>
                <div className="space-y-2">
                  {trendingSearches.slice(0, 8).map((item: any, index: number) => (
                    <a
                      key={index}
                      href="#"
                      className="block text-primary hover:text-secondary hover:underline transition-colors"
                    >
                      {item.search}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Jobs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Briefcase className="text-blue-500 mr-2 h-5 w-5" />
                  Trending Jobs
                </h3>
                <div className="space-y-2">
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Internship Opportunities</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Fresher Positions</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Remote Work Opportunities</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Part Time Jobs</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Human Resources</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Manual Testing</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Web Development</a>
                  <a href="#" className="block text-primary hover:text-secondary hover:underline transition-colors">Customer Support</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Jobs</h2>
            <a href="#" className="text-primary hover:text-secondary font-medium">
              View all jobs →
            </a>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* Popular Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Popular Cities */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <MapPinIcon className="text-blue-500 mr-2 h-5 w-5" />
                Popular Cities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {popularCities.slice(0, 12).map((city: any, index: number) => (
                  <a
                    key={index}
                    href="#"
                    className="text-primary hover:text-secondary hover:underline transition-colors text-sm"
                  >
                    {city.city}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Companies */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Building className="text-green-500 mr-2 h-5 w-5" />
                Popular Companies
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">TCS</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Infosys</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Wipro</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Accenture</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Amazon</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Google</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Microsoft</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Flipkart</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Zomato</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Paytm</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">Swiggy</a>
                <a href="#" className="text-primary hover:text-secondary hover:underline transition-colors text-sm">IBM</a>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      <Footer />
    </div>
  );
}
