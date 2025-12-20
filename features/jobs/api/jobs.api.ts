import { getStrapiURL } from "@/lib/strapi/client";
import { StrapiCollectionResponse } from "@/lib/strapi/types";

export type Job = {
  id: number;
  documentId: string;
  title: string;
  location: string | null;
  jobType: string;
  minSalary: number | null;
  maxSalary: number | null;
  jobDescription: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
  requirements: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
  category?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

type StrapiJobResponse = StrapiCollectionResponse<Job>;

export async function getJobs(jwt?: string): Promise<Job[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    const response = await fetch(`${getStrapiURL()}/api/jobs?populate=category`, {
      headers,
      next: { revalidate: 0 }, // Don't cache for now
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const data: StrapiJobResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

