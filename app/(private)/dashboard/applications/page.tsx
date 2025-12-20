"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationsTable } from "@/components/shared/applications-table";
import { 
  getEmployerApplications, 
  getUserApplications,
  type Application 
} from "@/features/applications/api/applications.api";
import { getCurrentUser, type User } from "@/lib/auth/user";
import { getJobs, type Job } from "@/features/jobs/api/jobs.api";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          router.push("/login");
          return;
        }

        // Fetch current user to determine user type
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        // Fetch applications based on user type
        let fetchedApplications: Application[] = [];
        if (currentUser.userType === "employer") {
          // For employers, fetch all applications and filter by their jobs
          const allApplications = await getEmployerApplications(jwt);
          const employerJobs = await getJobs(jwt);
          const employerJobIds = new Set(employerJobs.map(job => job.id));
          
          // Filter applications to only those for jobs owned by this employer
          fetchedApplications = allApplications.filter(app => {
            if (typeof app.job === "object" && app.job?.id) {
              return employerJobIds.has(app.job.id);
            }
            return false;
          });
        } else {
          // For jobseekers, fetch their own applications
          fetchedApplications = await getUserApplications(jwt);
        }

        setApplications(fetchedApplications);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading applications...</div>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.userType === "employer" ? "Applications" : "My Applications"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.userType === "employer"
              ? "Review and manage job applications from candidates."
              : "Track the status of your job applications."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Total applications: {applications.length}
          </p>
        </div>
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}

