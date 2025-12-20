import { strapiFetch } from "@/lib/strapi/client";
import { StrapiCollectionResponse } from "@/lib/strapi/types";
import type { DropdownOption } from "../types/registration.types";

type StrapiEnumOption = {
  id: number;
  name: string;
  value?: string;
  displayOrder?: number;
};

type StrapiCountry = {
  id: number;
  documentId?: string | null;
  name: string;
  iso2?: string | null;
  phoneCode?: string | null;
  isActive?: boolean;
};

type StrapiCity = {
  id: number;
  documentId?: string | null;
  name: string;
  isActive?: boolean;
};

type StrapiFieldOfStudy = {
  id: number;
  documentId?: string | null;
  name: string;
  academicCode?: string | null;
  isActive?: boolean;
  // New relation: each field of study belongs to a program level
  program_level?: {
    id: number;
    documentId?: string | null;
    name: string;
    abbreviation?: string | null;
  } | null;
};

type StrapiProgramLevel = {
  id: number;
  documentId?: string | null;
  name: string;
  abbreviation?: string | null;
};

type StrapiEmploymentInformation = {
  id: number;
  documentId?: string | null;
  name: string;
  isActive?: boolean;
};

type StrapiIndustry = {
  id: number;
  documentId?: string | null;
  name: string;
  isActive?: boolean;
  employment_information?: {
    id: number;
    documentId?: string | null;
    name: string;
  } | null;
};

type StrapiCountryResponse = StrapiCollectionResponse<StrapiCountry>;
type StrapiCityResponse = StrapiCollectionResponse<StrapiCity>;
type StrapiFieldOfStudyResponse = StrapiCollectionResponse<StrapiFieldOfStudy>;
type StrapiProgramLevelResponse = StrapiCollectionResponse<StrapiProgramLevel>;
type StrapiEmploymentInformationResponse = StrapiCollectionResponse<StrapiEmploymentInformation>;
type StrapiIndustryResponse = StrapiCollectionResponse<StrapiIndustry>;

// Fetch gender options from Strapi
export async function fetchGenderOptions(): Promise<DropdownOption[]> {
  try {
    // Assuming you have a 'gender' collection type or enum in Strapi
    // Adjust the endpoint based on your Strapi setup
    const response = await strapiFetch<StrapiCollectionResponse<StrapiEnumOption>>("genders", {
      params: {
        sort: ["displayOrder:asc", "name:asc"],
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: item.value || item.name.toLowerCase(),
    }));
  } catch (error) {
    console.warn("Failed to fetch gender options:", error);
    // Return default options if Strapi fetch fails
    return [
      { id: "1", label: "Male", value: "male" },
      { id: "2", label: "Female", value: "female" },
      { id: "3", label: "Other", value: "other" },
    ];
  }
}

// Fetch nationality options from Strapi
export async function fetchNationalityOptions(): Promise<DropdownOption[]> {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiEnumOption>>("nationalities", {
      params: {
        sort: ["displayOrder:asc", "name:asc"],
      },
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: item.value || item.name.toLowerCase(),
    }));
  } catch (error) {
    console.warn("Failed to fetch nationality options:", error);
    return [];
  }
}

// Fetch alumni category options from Strapi
export async function fetchAlumniCategoryOptions(): Promise<DropdownOption[]> {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiEnumOption>>("alumni-categories", {
      params: {
        sort: ["displayOrder:asc", "name:asc"],
      },
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: item.value || item.name.toLowerCase(),
    }));
  } catch (error) {
    console.warn("Failed to fetch alumni category options:", error);
    return [];
  }
}

// Fetch marital status options (enum field, not a collection)
export async function fetchMaritalStatusOptions(): Promise<DropdownOption[]> {
  // Marital status is an enum field in Strapi, so return the enum values directly
  return [
    { id: "1", label: "Single", value: "Single" },
    { id: "2", label: "Married", value: "Married" },
    { id: "3", label: "Widowed", value: "Widowed" },
    { id: "4", label: "Divorced", value: "Divorced" },
  ];
}

// Fetch title options (enum field, not a collection)
export async function fetchTitleOptions(): Promise<DropdownOption[]> {
  // Title is an enum field in Strapi, so return the enum values directly
  return [
    { id: "1", label: "Mr", value: "Mr" },
    { id: "2", label: "Mrs", value: "Mrs" },
    { id: "3", label: "Ms", value: "Ms" },
    { id: "4", label: "Miss", value: "Miss" },
    { id: "5", label: "Dr", value: "Dr" },
  ];
}

// Fetch country options from Strapi
export async function fetchCountryOptions(): Promise<DropdownOption[]> {
  try {
    const response = await strapiFetch<StrapiCountryResponse>("countries", {
      params: {
        filters: {
          isActive: {
            $eq: true,
          },
        },
        sort: ["name:asc"],
      },
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch country options:", error);
    return [];
  }
}

// Fetch city options from Strapi (optionally filtered by country)
export async function fetchCityOptions(countryId?: string): Promise<DropdownOption[]> {
  try {
    const params: {
      filters: {
        isActive: { $eq: boolean };
        country?: { id: { $eq: number } };
      };
      sort: string[];
    } = {
      filters: {
        isActive: {
          $eq: true,
        },
      },
      sort: ["name:asc"],
    };

    // Filter cities by country ID if provided
    if (countryId) {
      params.filters.country = {
        id: {
          $eq: Number(countryId),
        },
      };
    }

    const response = await strapiFetch<StrapiCityResponse>("cities", {
      params,
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch city options:", error);
    return [];
  }
}

// Fetch program level options from Strapi
export async function fetchProgramLevelOptions(): Promise<DropdownOption[]> {
  try {
    const response = await strapiFetch<StrapiProgramLevelResponse>("program-levels", {
      params: {
        sort: ["name:asc"],
      },
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch program level options:", error);
    return [];
  }
}

// Fetch field of study options from Strapi (optionally filtered by program level)
export async function fetchFieldOfStudyOptions(programLevelId?: string): Promise<DropdownOption[]> {
  try {
    const params: {
      filters: {
        isActive: { $eq: boolean };
        program_level?: { id: { $eq: number } };
      };
      sort: string[];
      populate?: string[];
    } = {
      filters: {
        isActive: {
          $eq: true,
        },
      },
      sort: ["name:asc"],
      populate: ["program_level"],
    };

    // Filter by program level if provided
    if (programLevelId) {
      params.filters.program_level = {
        id: {
          $eq: Number(programLevelId),
        },
      };
    }

    const response = await strapiFetch<StrapiFieldOfStudyResponse>("field-of-studies", {
      params,
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch field of study options:", error);
    return [];
  }
}

// Fetch employment information options from Strapi
export async function fetchEmploymentInformationOptions(): Promise<DropdownOption[]> {
  try {
    const response = await strapiFetch<StrapiEmploymentInformationResponse>("employment-informations", {
      params: {
        filters: {
          isActive: {
            $eq: true,
          },
        },
        sort: ["name:asc"],
      },
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch employment information options:", error);
    return [];
  }
}

// Fetch industry options from Strapi (optionally filtered by employment information)
export async function fetchIndustryOptions(employmentInformationId?: string): Promise<DropdownOption[]> {
  try {
    const params: {
      filters: {
        isActive: { $eq: boolean };
        employment_information?: { id: { $eq: number } };
      };
      sort: string[];
      populate?: string[];
    } = {
      filters: {
        isActive: {
          $eq: true,
        },
      },
      sort: ["name:asc"],
      populate: ["employment_information"],
    };

    // Filter by employment information if provided
    if (employmentInformationId) {
      params.filters.employment_information = {
        id: {
          $eq: Number(employmentInformationId),
        },
      };
    }

    const response = await strapiFetch<StrapiIndustryResponse>("industries", {
      params,
      next: { revalidate: 3600 },
    });

    if (!response.data) return [];

    return response.data.map((item) => ({
      id: String(item.id),
      label: item.name,
      value: String(item.id),
    }));
  } catch (error) {
    console.warn("Failed to fetch industry options:", error);
    return [];
  }
}

