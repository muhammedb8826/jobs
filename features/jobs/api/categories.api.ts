import { strapiFetch } from "@/lib/strapi/client";
import { StrapiCollectionResponse } from "@/lib/strapi/types";

export type Category = {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
};

type StrapiCategoryResponse = StrapiCollectionResponse<Category>;

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await strapiFetch<StrapiCategoryResponse>("categories", {
      params: { populate: "*" },
      next: { revalidate: 60 },
    });

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

