"use client";

import { useState, useEffect } from "react";
import { IconSearch, IconMapPin, IconLayoutGrid, IconList, IconBookmark } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getJobs, type Job } from "../api/jobs.api";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export function JobsSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jwt = localStorage.getItem("jwt");
        const fetchedJobs = await getJobs(jwt || undefined);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleJobTypeToggle = (jobType: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jobType)
        ? prev.filter((type) => type !== jobType)
        : [...prev, jobType]
    );
  };

  const handleClearFilters = () => {
    setSelectedJobTypes([]);
    setMinSalary("");
    setMaxSalary("");
  };

  // Filter jobs based on search, location, job type, and salary
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !location ||
      (job.location && job.location.toLowerCase().includes(location.toLowerCase()));

    const matchesJobType =
      selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);

    const matchesSalary =
      (!minSalary || !job.minSalary || job.minSalary >= parseFloat(minSalary)) &&
      (!maxSalary || !job.maxSalary || job.maxSalary <= parseFloat(maxSalary));

    return matchesSearch && matchesLocation && matchesJobType && matchesSalary;
  });

  const handleSearch = () => {
    // Filtering is done automatically via filteredJobs
    // This function can be used for additional search logic if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Search Bar Section */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Find Your Dream Job
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover opportunities that match your passion
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, company, or keywords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex-1 relative">
                <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Search Jobs
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filter Jobs</h2>
                <Button
                  variant="link"
                  className="text-primary h-auto p-0"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={["job-type", "salary-range"]}>
                {/* Job Type Filter */}
                <AccordionItem value="job-type">
                  <AccordionTrigger>Job Type</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {["Remote", "Full-Time", "Part-Time", "Contract", "Internship"].map(
                        (type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`job-type-${type}`}
                              checked={selectedJobTypes.includes(type)}
                              onCheckedChange={() => handleJobTypeToggle(type)}
                            />
                            <Label
                              htmlFor={`job-type-${type}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Salary Range Filter */}
                <AccordionItem value="salary-range">
                  <AccordionTrigger>Salary Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-salary" className="text-sm">
                          Min Salary
                        </Label>
                        <Input
                          id="min-salary"
                          type="number"
                          placeholder="Min"
                          value={minSalary}
                          onChange={(e) => setMinSalary(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-salary" className="text-sm">
                          Max Salary
                        </Label>
                        <Input
                          id="max-salary"
                          type="number"
                          placeholder="Max"
                          value={maxSalary}
                          onChange={(e) => setMaxSalary(e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Showing {filteredJobs.length} jobs</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <IconLayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <IconList className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No jobs found. Try adjusting your filters.</p>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "flex flex-col gap-4"
                }
              >
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const formattedDate = job.publishedAt
    ? format(new Date(job.publishedAt), "do MMM yyyy")
    : format(new Date(job.createdAt), "do MMM yyyy");

  const salaryDisplay = job.minSalary && job.maxSalary
    ? `ETB ${job.minSalary.toLocaleString()}/mo - ETB ${job.maxSalary.toLocaleString()}/mo`
    : job.minSalary
    ? `ETB ${job.minSalary.toLocaleString()}/mo+`
    : job.maxSalary
    ? `Up to ETB ${job.maxSalary.toLocaleString()}/mo`
    : "Salary not specified";

  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
        {/* Company Logo */}
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {job.category?.name?.[0]?.toUpperCase() || "J"}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">{job.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {job.category?.name || "Company Name"}
              </p>
              <p className="text-sm text-muted-foreground">{job.location || "Location not specified"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Handle bookmark functionality
              }}
            >
              <IconBookmark className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              {job.jobType}
            </Badge>
            {job.category && (
              <Badge variant="outline">{job.category.name}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formattedDate}</span>
              <span>{salaryDisplay}</span>
            </div>
            <Button variant="outline" size="sm" className="bg-gray-100">
              Applied
            </Button>
          </div>
        </div>
      </div>
      </Card>
    </Link>
  );
}

