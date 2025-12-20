import { getStrapiURL } from "@/lib/strapi/client";
import { StrapiCollectionResponse } from "@/lib/strapi/types";

export type ApplicationStatus = "Applied" | "Reviewed" | "Interviewing" | "Rejected" | "Hired";

export type Application = {
  id: number;
  documentId: string;
  applicationStatus: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  job: {
    id: number;
    title: string;
    [key: string]: unknown;
  };
  users_permissions_user: {
    id: number;
    email: string;
    fullName?: string;
    [key: string]: unknown;
  };
  resume: unknown;
};

type StrapiApplicationResponse = StrapiCollectionResponse<Application>;

export async function getApplications(jwt: string): Promise<Application[]> {
  try {
    const response = await fetch(
      `${getStrapiURL()}/api/applications?populate=job,users_permissions_user`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.error(
          "Permission denied. Please enable 'find' permission for Application content type in Strapi. " +
          "Go to Settings > Users & Permissions Plugin > Roles > Authenticated > Application > enable 'find' permission."
        );
        return [];
      }
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }

    const data: StrapiApplicationResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return [];
  }
}

export async function createApplication(jobId: number, jwt: string): Promise<Application> {
  const response = await fetch(`${getStrapiURL()}/api/applications?populate=job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      data: {
        job: jobId,
        applicationStatus: "Applied",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || `Failed to create application: ${response.status}`;
    
    if (response.status === 403) {
      throw new Error(
        `${errorMessage}. Please enable 'create' permission for Application content type in Strapi. ` +
        `Go to Settings > Users & Permissions Plugin > Roles > Authenticated (or Jobseeker) > Application > enable 'create' permission.`
      );
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data;
}

export async function getUserApplications(jwt: string): Promise<Application[]> {
  try {
    // Fetch current user first
    const userResponse = await fetch(`${getStrapiURL()}/api/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch current user");
    }

    const user = await userResponse.json();
    
    // Fetch applications filtered by user
    const response = await fetch(
      `${getStrapiURL()}/api/applications?populate=job&filters[users_permissions_user][id][$eq]=${user.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.error(
          "Permission denied. Please enable 'find' permission for Application content type in Strapi. " +
          "Go to Settings > Users & Permissions Plugin > Roles > Authenticated > Application > enable 'find' permission."
        );
        return [];
      }
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }

    const data: StrapiApplicationResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch user applications:", error);
    return [];
  }
}

