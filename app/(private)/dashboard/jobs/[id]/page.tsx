"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobDetails } from "@/features/jobs/components/JobDetails";
import { getJobs, type Job } from "@/features/jobs/api/jobs.api";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const jwt = localStorage.getItem("jwt");
        const jobs = await getJobs(jwt || undefined);
        const jobId = parseInt(params.id as string);
        const foundJob = jobs.find((j) => j.id === jobId);
        
        if (!foundJob) {
          router.push("/dashboard/jobs/find");
          return;
        }
        
        setJob(foundJob);
      } catch (error) {
        console.error("Failed to fetch job:", error);
        router.push("/dashboard/jobs/find");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchJob();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <JobDetails job={job} />
      </div>
    </div>
  );
}

