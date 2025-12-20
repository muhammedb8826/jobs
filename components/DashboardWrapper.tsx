"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getCurrentUser, type User } from "@/lib/auth/user";
import data from "@/app/(private)/dashboard/data.json";

export function DashboardWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    }

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {user.userType === "employer" ? (
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

