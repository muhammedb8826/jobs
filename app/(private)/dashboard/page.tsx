"use client";

import { useEffect, useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { getCurrentUser, type User } from "@/lib/auth/user";
import data from "./data.json";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {user?.userType === "employer" ? (
        <>
          {/* Employer Dashboard Content */}
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-4">Employer Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your job postings, view applications, and find the best candidates.
              </p>
            </div>
          </div>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </>
      ) : (
        <>
          {/* Jobseeker Dashboard Content */}
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-bold mb-4">Job Seeker Dashboard</h2>
              <p className="text-muted-foreground">
                Find your next opportunity, track your applications, and manage your job search.
              </p>
            </div>
          </div>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </>
      )}
    </div>
  );
}
