"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { JobsTable } from "@/components/shared/jobs-table";
import { getJobs, type Job } from "@/features/jobs/api/jobs.api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const jwt = localStorage.getItem("jwt");
        const fetchedJobs = await getJobs(jwt || undefined);
        setJobs(fetchedJobs);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Jobs
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage job postings and track applications.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total jobs: {jobs.length}
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard/jobs/post">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Job
            </Link>
          </Button>
        </div>
        <JobsTable jobs={jobs} />
      </div>
    </div>
  );
}

