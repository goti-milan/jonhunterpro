import { useState } from "react";
import { Search, MapPin, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SearchFormProps {
  onSearch: (filters: {
    search: string;
    location: string;
    jobType: string;
    category: string;
    experienceLevel: string;
    salaryRange: number[];
    postedWithin: string;
  }) => void;
  initialValues?: {
    search?: string;
    location?: string;
    jobType?: string;
    category?: string;
    experienceLevel?: string;
    salaryRange?: number[];
    postedWithin?: string;
  };
}

export default function SearchForm({ onSearch, initialValues = {} }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialValues.search || "");
  const [locationQuery, setLocationQuery] = useState(initialValues.location || "");
  const [jobType, setJobType] = useState(initialValues.jobType || "");
  const [category, setCategory] = useState(initialValues.category || "");
  const [experienceLevel, setExperienceLevel] = useState(initialValues.experienceLevel || "");
  const [salaryRange, setSalaryRange] = useState<number[]>(initialValues.salaryRange || [0, 300000]);
  const [postedWithin, setPostedWithin] = useState(initialValues.postedWithin || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: searchQuery.trim(),
      location: locationQuery.trim(),
      jobType: jobType === "all" ? "" : jobType,
      category: category === "all" ? "" : category,
      experienceLevel: experienceLevel === "all" ? "" : experienceLevel,
      salaryRange,
      postedWithin: postedWithin === "all" ? "" : postedWithin,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setJobType("");
    setCategory("");
    setExperienceLevel("");
    setSalaryRange([0, 300000]);
    setPostedWithin("");
    onSearch({
      search: "",
      location: "",
      jobType: "",
      category: "",
      experienceLevel: "",
      salaryRange: [0, 300000],
      postedWithin: "",
    });
  };

  const hasActiveFilters = (jobType && jobType !== "all") || (category && category !== "all") || (experienceLevel && experienceLevel !== "all") || (postedWithin && postedWithin !== "all") || (salaryRange[0] > 0 || salaryRange[1] < 300000);

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                className="search-input pl-10 text-slate-900 dark:text-slate-100"
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
                placeholder="City, state, or remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="search-input pl-10 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex items-center gap-2 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {Object.values({ jobType, category, experienceLevel, postedWithin }).filter(Boolean).length + 
                       ((salaryRange[0] > 0 || salaryRange[1] < 300000) ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filter Jobs</h3>
                      {hasActiveFilters && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-primary hover:text-primary/80"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Job Type
                        </label>
                        <Select value={jobType} onValueChange={setJobType}>
                          <SelectTrigger>
                            <SelectValue placeholder="All job types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All job types</SelectItem>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Category
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Customer Service">Customer Service</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Experience Level
                        </label>
                        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="All experience levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All experience levels</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="entry-level">Entry Level</SelectItem>
                            <SelectItem value="associate">Associate</SelectItem>
                            <SelectItem value="mid-level">Mid Level</SelectItem>
                            <SelectItem value="senior-level">Senior Level</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Posted Within
                        </label>
                        <Select value={postedWithin} onValueChange={setPostedWithin}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any time</SelectItem>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                            <SelectItem value="3d">Last 3 days</SelectItem>
                            <SelectItem value="1w">Last week</SelectItem>
                            <SelectItem value="2w">Last 2 weeks</SelectItem>
                            <SelectItem value="1m">Last month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          Salary Range (Annual)
                        </label>
                        <div className="px-2">
                          <Slider
                            value={salaryRange}
                            onValueChange={setSalaryRange}
                            max={300000}
                            min={0}
                            step={5000}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>${salaryRange[0].toLocaleString()}</span>
                            <span>${salaryRange[1].toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="w-full"
                    >
                      Apply Filters
                    </Button>
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>

            <Button type="submit" className="btn-primary px-8">
              Search Jobs
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 py-1">Popular searches:</span>
            {[
              "Remote",
              "Software Engineer",
              "Marketing Manager",
              "Data Analyst",
              "Product Manager",
              "Sales Executive"
            ].map((term) => (
              <Button
                key={term}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery(term);
                  onSearch({
                    search: term,
                    location: locationQuery.trim(),
                    jobType,
                    category,
                    experienceLevel,
                    salaryRange,
                    postedWithin,
                  });
                }}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 px-3 py-1 h-auto text-sm"
              >
                {term}
              </Button>
            ))}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Experience Level Dropdown */}
            <div>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="entry-level">Entry Level</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="mid-level">Mid Level</SelectItem>
                  <SelectItem value="senior-level">Senior Level</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Type Dropdown */}
            <div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Salary Range Dropdown */}
            <div>
              <Select 
                value={
                  salaryRange[0] === 0 && salaryRange[1] === 300000 ? "all" :
                  salaryRange[1] <= 50000 ? "0-50k" :
                  salaryRange[1] <= 100000 ? "50k-100k" :
                  salaryRange[1] <= 150000 ? "100k-150k" :
                  salaryRange[1] <= 200000 ? "150k-200k" : "200k+"
                } 
                onValueChange={(value) => {
                  const ranges: Record<string, [number, number]> = {
                    "all": [0, 300000],
                    "0-50k": [0, 50000],
                    "50k-100k": [50000, 100000],
                    "100k-150k": [100000, 150000],
                    "150k-200k": [150000, 200000],
                    "200k+": [200000, 300000],
                  };
                  setSalaryRange(ranges[value] || [0, 300000]);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Salary Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Salary</SelectItem>
                  <SelectItem value="0-50k">$0 - $50K</SelectItem>
                  <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                  <SelectItem value="100k-150k">$100K - $150K</SelectItem>
                  <SelectItem value="150k-200k">$150K - $200K</SelectItem>
                  <SelectItem value="200k+">$200K+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posted Date Dropdown */}
            <div>
              <Select value={postedWithin} onValueChange={setPostedWithin}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Posted Within" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="3d">Last 3 days</SelectItem>
                  <SelectItem value="1w">Last week</SelectItem>
                  <SelectItem value="2w">Last 2 weeks</SelectItem>
                  <SelectItem value="1m">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {jobType && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setJobType("")}
                  className="text-xs flex items-center gap-1"
                >
                  Job Type: {jobType}
                  <span className="ml-1">×</span>
                </Button>
              )}
              {category && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCategory("")}
                  className="text-xs flex items-center gap-1"
                >
                  Category: {category}
                  <span className="ml-1">×</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
