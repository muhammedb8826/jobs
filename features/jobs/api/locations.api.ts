import { strapiFetch } from "@/lib/strapi/client";
import { StrapiCollectionResponse } from "@/lib/strapi/types";

export type Location = {
  id: number;
  documentId: string;
  name: string;
  isActive: boolean;
  cities?: City[];
};

export type City = {
  id: number;
  documentId: string;
  name: string;
  isActive: boolean;
  location?: Location;
};

type StrapiLocationResponse = StrapiCollectionResponse<Location>;

export async function getLocations(): Promise<Location[]> {
  try {
    const response = await strapiFetch<StrapiLocationResponse>("locations", {
      params: { populate: { cities: true } },
      next: { revalidate: 60 },
    });

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return [];
  }
}

