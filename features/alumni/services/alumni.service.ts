import { strapiFetch, getStrapiURL } from "@/lib/strapi/client";
import { resolveImageUrl } from "@/lib/strapi/media";
import type { StrapiCollectionResponse, StrapiSingleResponse } from "@/lib/strapi/types";
import type { AlumniListItem, AlumniDetail } from "../types/alumni.types";

type StrapiImage = {
  url: string;
  alternativeText?: string | null;
  formats?: Record<string, { url: string }>;
};

type StrapiCountry = {
  id: number;
  documentId?: string | null;
  name: string;
  iso2?: string | null;
  phoneCode?: string | null;
};

type StrapiCity = {
  id: number;
  documentId?: string | null;
  name: string;
};

type StrapiGender = {
  id: number;
  documentId?: string | null;
  name: string;
  value?: string | null;
};

type StrapiNationality = {
  id: number;
  documentId?: string | null;
  name: string;
  value?: string | null;
};

type StrapiAlumniCategory = {
  id: number;
  documentId?: string | null;
  name: string;
  value?: string | null;
};

type StrapiAlumni = {
  id: number;
  documentId?: string | null;
  slug?: string | null;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  phoneNumber?: string | null;
  email?: string | null;
  birthDate?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  address?: string | null;
  profileImage?: StrapiImage | null;
  gender?: StrapiGender[] | null;
  nationality?: StrapiNationality[] | null;
  alumniCategory?: StrapiAlumniCategory[] | null;
  maritalStatus?: string | null;
  title?: string | null;
  birthCountry?: StrapiCountry | null;
  birthCity?: StrapiCity | null;
  residentialCountry?: StrapiCountry | null;
  residentialCity?: StrapiCity | null;
  facebook?: string | null;
  whatsapp?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  // New single relations based on updated Strapi schema
  programLevel?: {
    id: number;
    documentId?: string | null;
    name: string;
    abbreviation?: string | null;
  } | null;
  fieldOfStudy?: {
    id: number;
    documentId?: string | null;
    name: string;
    academicCode?: string | null;
    // program_level relation comes from field-of-studies schema
    program_level?: {
      id: number;
      documentId?: string | null;
      name: string;
      abbreviation?: string | null;
    } | null;
  } | null;
  specialization?: string | null;
  dateOfGraduation?: string | null;
  statementAccepted?: boolean | null;
  // Work experience fields
  employmentInformation?: {
    id: number;
    documentId?: string | null;
    name: string;
    isActive?: boolean;
  } | null;
  industryJoined?: {
    id: number;
    documentId?: string | null;
    name: string;
    isActive?: boolean;
  } | null;
  workingCountry?: StrapiCountry | null;
  workingCity?: StrapiCity | null;
  yearOfExperience?: number | null;
  positionServed?: string | null;
  briefDescriptionAboutMe?: string | null;
  experienceAttachment?: StrapiImage | null;
};

type StrapiAlumniListResponse = StrapiCollectionResponse<StrapiAlumni>;
type StrapiAlumniDetailResponse = StrapiSingleResponse<StrapiAlumni>;

const ALUMNI_POPULATE = {
  populate: {
    profileImage: {
      populate: "*",
    },
    gender: {
      populate: "*",
    },
    nationality: {
      populate: "*",
    },
    alumniCategory: {
      populate: "*",
    },
    birthCountry: {
      populate: "*",
    },
    birthCity: {
      populate: "*",
    },
    residentialCountry: {
      populate: "*",
    },
    residentialCity: {
      populate: "*",
    },
    // New relations
    programLevel: {
      populate: "*",
    },
    fieldOfStudy: {
      populate: "*",
    },
    // Work experience relations
    employmentInformation: {
      populate: "*",
    },
    industryJoined: {
      populate: "*",
    },
    workingCountry: {
      populate: "*",
    },
    workingCity: {
      populate: "*",
    },
    experienceAttachment: {
      populate: "*",
    },
  },
};

export async function fetchAlumniList(): Promise<AlumniListItem[]> {
  const response = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
    params: {
      ...ALUMNI_POPULATE,
      sort: ["createdAt:desc"],
      pagination: {
        page: 1,
        pageSize: 100,
      },
    },
  });

  if (!response.data) return [];

  const baseUrl = getStrapiURL();

  return response.data.map((item) => {
    let profileImageUrl: string | null = null;
    if (item.profileImage) {
      profileImageUrl =
        resolveImageUrl(
          {
            url: item.profileImage.url,
            formats: item.profileImage.formats,
          },
          baseUrl
        ) || item.profileImage.url;
    }

    // Generate slug from full name if not provided
    const generateSlug = (firstName: string, fatherName: string, grandFatherName: string): string => {
      const fullName = `${firstName} ${fatherName} ${grandFatherName}`.trim();
      return fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    };

    return {
      id: String(item.id),
      documentId: item.documentId || String(item.id), // Use documentId if available, fallback to id
      slug: item.slug || generateSlug(item.firstName, item.fatherName, item.grandFatherName) || String(item.id),
      fullName: `${item.firstName} ${item.fatherName} ${item.grandFatherName}`.trim(),
      jobTitle: item.jobTitle ?? undefined,
      companyName: item.companyName ?? undefined,
      location: item.address ?? undefined,
      profileImageUrl,
    };
  });
}

export async function fetchAlumniBySlug(slug: string): Promise<AlumniDetail | null> {
  // First, try to find by explicit slug field in Strapi
  const response = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
    params: {
      ...ALUMNI_POPULATE,
      filters: {
        slug: {
          $eq: slug,
        },
      },
      pagination: {
        page: 1,
        pageSize: 1,
      },
    },
    next: { revalidate: 60 },
  });

  let item: StrapiAlumni | undefined = response.data?.[0];

  // If not found by stored slug, fall back to matching against the
  // generated slug logic used in `fetchAlumniList` so links keep working
  if (!item) {
    const fallbackList = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
      params: {
        ...ALUMNI_POPULATE,
        sort: ["createdAt:desc"],
        pagination: {
          page: 1,
          pageSize: 100,
        },
      },
      next: { revalidate: 60 },
    });

    if (fallbackList.data && fallbackList.data.length > 0) {
      const generateSlug = (firstName: string, fatherName: string, grandFatherName: string): string => {
        const fullName = `${firstName} ${fatherName} ${grandFatherName}`.trim();
        return fullName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      };

      item = fallbackList.data.find((candidate) => {
        const candidateSlug =
          candidate.slug ||
          generateSlug(candidate.firstName, candidate.fatherName, candidate.grandFatherName) ||
          String(candidate.id);
        return candidateSlug === slug;
      });
    }
  }

  if (!item) {
    console.warn(`Alumni not found with slug: ${slug}`);
    return null;
  }

  const baseUrl = getStrapiURL();

  let profileImageUrl: string | null = null;
  if (item.profileImage) {
    profileImageUrl =
      resolveImageUrl(
        {
          url: item.profileImage.url,
          formats: item.profileImage.formats,
        },
        baseUrl
      ) || item.profileImage.url;
  }

  return {
    id: String(item.id),
    firstName: item.firstName,
    fatherName: item.fatherName,
    grandFatherName: item.grandFatherName,
    fullName: `${item.firstName} ${item.fatherName} ${item.grandFatherName}`.trim(),
    phoneNumber: item.phoneNumber ?? undefined,
    email: item.email ?? undefined,
    birthDate: item.birthDate ?? undefined,
    jobTitle: item.jobTitle ?? undefined,
    companyName: item.companyName ?? undefined,
    location: item.address ?? undefined,
    profileImageUrl,
  };
}

export type UserProfile = {
  id: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  phoneNumber?: string;
  email?: string;
  birthDate?: string;
  jobTitle?: string;
  companyName?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  alumniCategory?: string;
  maritalStatus?: string;
  title?: string;
  birthCountryId?: string;
  birthCountryName?: string;
  birthCityId?: string;
  birthCityName?: string;
  residentialCountryId?: string;
  residentialCountryName?: string;
  residentialCityId?: string;
  residentialCityName?: string;
  facebook?: string;
  whatsapp?: string;
  twitter?: string;
  youtube?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  profileImageUrl?: string;
  fieldOfStudyId?: string;
  fieldOfStudyName?: string;
  programLevelId?: string;
  programLevelName?: string;
  specialization?: string;
  dateOfGraduation?: string;
  statementAccepted?: boolean;
  // Work experience fields
  employmentInformationId?: string;
  employmentInformationName?: string;
  industryJoinedId?: string;
  industryJoinedName?: string;
  workingCountryId?: string;
  workingCountryName?: string;
  workingCityId?: string;
  workingCityName?: string;
  yearOfExperience?: number;
  positionServed?: string;
  briefDescriptionAboutMe?: string;
  experienceAttachmentUrl?: string;
};

export async function fetchUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const response = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
      params: {
        ...ALUMNI_POPULATE,
        filters: {
          email: {
            $eq: email,
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      },
      next: { revalidate: 0, tags: ['user-profile'] }, // Always fetch fresh user profile data
    });

    const item = response.data?.[0];
    if (!item) {
      return null;
    }

    return {
      id: String(item.id),
      firstName: item.firstName,
      fatherName: item.fatherName,
      grandFatherName: item.grandFatherName,
      phoneNumber: item.phoneNumber ?? undefined,
      email: item.email ?? undefined,
      birthDate: item.birthDate ?? undefined,
      jobTitle: item.jobTitle ?? undefined,
      companyName: item.companyName ?? undefined,
      address: item.address ?? undefined,
      gender: item.gender?.[0] ? String(item.gender[0].id) : undefined,
      nationality: item.nationality?.[0] ? String(item.nationality[0].id) : undefined,
      alumniCategory: item.alumniCategory?.[0] ? String(item.alumniCategory[0].id) : undefined,
      maritalStatus: item.maritalStatus ?? undefined,
      title: item.title ?? undefined,
      birthCountryId: item.birthCountry ? String(item.birthCountry.id) : undefined,
      birthCountryName: item.birthCountry?.name ?? undefined,
      birthCityId: item.birthCity ? String(item.birthCity.id) : undefined,
      birthCityName: item.birthCity?.name ?? undefined,
      residentialCountryId: item.residentialCountry ? String(item.residentialCountry.id) : undefined,
      residentialCountryName: item.residentialCountry?.name ?? undefined,
      residentialCityId: item.residentialCity ? String(item.residentialCity.id) : undefined,
      residentialCityName: item.residentialCity?.name ?? undefined,
      facebook: item.facebook ?? undefined,
      whatsapp: item.whatsapp ?? undefined,
      twitter: item.twitter ?? undefined,
      youtube: item.youtube ?? undefined,
      telegram: item.telegram ?? undefined,
      instagram: item.instagram ?? undefined,
      tiktok: item.tiktok ?? undefined,
      // Prefer new single relation fieldOfStudy; program level comes via its program_level relation
      fieldOfStudyId: item.fieldOfStudy ? String(item.fieldOfStudy.id) : undefined,
      fieldOfStudyName: item.fieldOfStudy?.name ?? undefined,
      // Derive program level from fieldOfStudy.program_level
      programLevelId: item.fieldOfStudy?.program_level ? String(item.fieldOfStudy.program_level.id) : undefined,
      programLevelName: item.fieldOfStudy?.program_level?.name ?? undefined,
      specialization: item.specialization ?? undefined,
      dateOfGraduation: item.dateOfGraduation ?? undefined,
      statementAccepted: item.statementAccepted ?? undefined,
      // Work experience fields
      employmentInformationId: item.employmentInformation ? String(item.employmentInformation.id) : undefined,
      employmentInformationName: item.employmentInformation?.name ?? undefined,
      industryJoinedId: item.industryJoined ? String(item.industryJoined.id) : undefined,
      industryJoinedName: item.industryJoined?.name ?? undefined,
      workingCountryId: item.workingCountry ? String(item.workingCountry.id) : undefined,
      workingCountryName: item.workingCountry?.name ?? undefined,
      workingCityId: item.workingCity ? String(item.workingCity.id) : undefined,
      workingCityName: item.workingCity?.name ?? undefined,
      yearOfExperience: item.yearOfExperience ?? undefined,
      positionServed: item.positionServed ?? undefined,
      briefDescriptionAboutMe: item.briefDescriptionAboutMe ?? undefined,
      experienceAttachmentUrl: item.experienceAttachment
        ? (() => {
            const baseUrl = getStrapiURL();
            return resolveImageUrl(
              {
                url: item.experienceAttachment.url,
                formats: item.experienceAttachment.formats,
              },
              baseUrl
            ) || `${baseUrl}${item.experienceAttachment.url}`;
          })()
        : undefined,
      profileImageUrl: item.profileImage
        ? (() => {
            const baseUrl = getStrapiURL();
            return resolveImageUrl(
              {
                url: item.profileImage.url,
                formats: item.profileImage.formats,
              },
              baseUrl
            ) || `${baseUrl}${item.profileImage.url}`;
          })()
        : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

// Keep fetchAlumniById for backward compatibility, but it's deprecated
export async function fetchAlumniById(id: string): Promise<AlumniDetail | null> {
  // Determine if id is numeric or documentId
  const isNumericId = !isNaN(Number(id)) && !isNaN(parseFloat(id));

  let item: StrapiAlumni | null = null;

  // Try direct fetch by numeric id first
  if (isNumericId) {
    const directResponse = await strapiFetch<StrapiAlumniDetailResponse>(`almuni-registrations/${id}`, {
      params: ALUMNI_POPULATE,
      next: { revalidate: 60 },
    });

    if (directResponse.data) {
      item = directResponse.data;
    }
  }

  // If direct fetch failed or it's a documentId, try filter by documentId
  if (!item) {
    const filterResponse = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
      params: {
        ...ALUMNI_POPULATE,
        filters: {
          documentId: id,
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      },
      next: { revalidate: 60 },
    });

    if (filterResponse.data && filterResponse.data.length > 0) {
      item = filterResponse.data[0];
    }
  }

  // If still not found and it's numeric, try filter by id as fallback
  if (!item && isNumericId) {
    const idFilterResponse = await strapiFetch<StrapiAlumniListResponse>("almuni-registrations", {
      params: {
        ...ALUMNI_POPULATE,
        filters: {
          id: {
            $eq: Number(id),
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
      },
      next: { revalidate: 60 },
    });

    if (idFilterResponse.data && idFilterResponse.data.length > 0) {
      item = idFilterResponse.data[0];
    }
  }

  if (!item) {
    console.warn(`Alumni not found with id: ${id} (numeric: ${isNumericId})`);
    return null;
  }

  const baseUrl = getStrapiURL();

  let profileImageUrl: string | null = null;
  if (item.profileImage) {
    profileImageUrl =
      resolveImageUrl(
        {
          url: item.profileImage.url,
          formats: item.profileImage.formats,
        },
        baseUrl
      ) || item.profileImage.url;
  }

  return {
    id: String(item.id),
    firstName: item.firstName,
    fatherName: item.fatherName,
    grandFatherName: item.grandFatherName,
    fullName: `${item.firstName} ${item.fatherName} ${item.grandFatherName}`.trim(),
    phoneNumber: item.phoneNumber ?? undefined,
    email: item.email ?? undefined,
    birthDate: item.birthDate ?? undefined,
    jobTitle: item.jobTitle ?? undefined,
    companyName: item.companyName ?? undefined,
    location: item.address ?? undefined,
    profileImageUrl,
  };
}
