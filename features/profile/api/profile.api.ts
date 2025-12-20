import { getStrapiURL } from "@/lib/strapi/client";

export type Company = {
  id: number;
  name: string;
  description?: string | null;
  logo?: {
    id: number;
    url: string;
    formats?: Record<string, { url: string }>;
  } | null;
};

export async function updateUserProfile(
  userId: number,
  data: {
    fullName?: string;
    email?: string;
    profileImage?: number | { id: number } | null;
    company?: number;
  },
  jwt: string
): Promise<void> {
  // Build payload, excluding undefined values
  const payload: Record<string, unknown> = {};
  if (data.fullName !== undefined) payload.fullName = data.fullName;
  if (data.email !== undefined) payload.email = data.email;
  if (data.profileImage !== undefined && data.profileImage !== null) {
    // Use same format as registration: { id: number }
    payload.profileImage = data.profileImage;
  }
  if (data.company !== undefined && data.company !== null) {
    // Company relation should be sent as just the ID number
    payload.company = data.company;
  }
  
  console.log("Updating user profile with payload:", payload);

  const response = await fetch(`${getStrapiURL()}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: { message: errorText || `Failed to update profile: ${response.status}` } };
    }
    const errorMessage = error.error?.message || error.message || `Failed to update profile: ${response.status}`;
    console.error("Profile update error:", errorMessage, "Full error:", error);
    throw new Error(errorMessage);
  }
}

export async function updateCompany(
  companyId: number,
  data: {
    name?: string;
    description?: string;
    logo?: number | { id: number } | null;
  },
  jwt: string
): Promise<void> {
  const response = await fetch(`${getStrapiURL()}/api/companies/${companyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to update company: ${response.status}`);
  }
}

export async function createCompany(
  data: {
    name: string;
    description?: string;
    logo?: number | { id: number } | null;
  },
  jwt: string
): Promise<Company> {
  const response = await fetch(`${getStrapiURL()}/api/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to create company: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export async function uploadFile(file: File, jwt?: string): Promise<number> {
  const formData = new FormData();
  formData.append("files", file);

  const headers: HeadersInit = {};
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  const response = await fetch(`${getStrapiURL()}/api/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to upload file");
  }

  const uploadedFiles = await response.json();
  if (!uploadedFiles || !uploadedFiles[0] || !uploadedFiles[0].id) {
    throw new Error("Upload response did not contain file ID");
  }

  return uploadedFiles[0].id;
}

