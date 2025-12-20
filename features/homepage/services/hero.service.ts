import { strapiFetch } from "@/lib/strapi/client";
import { StrapiSingleResponse } from "@/lib/strapi/types";
import { HeroSection } from "../types/hero.types";

const HERO_COMPONENT = "homepage.hero";

const HERO_POPULATE = {
  blocks: {
    on: {
      [HERO_COMPONENT]: {
        populate: "*",
      },
    },
  },
};

type StrapiHeroBlock = {
  __component: typeof HERO_COMPONENT;
  id: number;
  heading: string;
  subHeading: string;
  description: string;
  buttons: Array<{
    id: number;
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  cards: Array<{
    id: number;
    title: string;
    description: string;
    icon: {
      width: number;
      height: number;
      iconData: string;
      iconName: string;
      isSvgEditable: boolean;
      isIconNameEditable: boolean;
    };
  }>;
};

type StrapiHomePageData = {
  id: number;
  documentId: string;
  blocks: StrapiHeroBlock[];
};

type StrapiHomePageResponse = StrapiSingleResponse<StrapiHomePageData>;

export async function fetchHomepageHero(): Promise<HeroSection | null> {
  try {
    const response = await strapiFetch<StrapiHomePageResponse>("home-page", {
      params: { populate: HERO_POPULATE },
      next: { revalidate: 60 },
    });

    if (!response.data?.blocks) {
      return null;
    }

    const heroBlock = response.data.blocks.find(
      (block): block is StrapiHeroBlock => block.__component === HERO_COMPONENT
    );

    if (!heroBlock) {
      return null;
    }

    return {
      id: heroBlock.id,
      heading: heroBlock.heading,
      subHeading: heroBlock.subHeading,
      description: heroBlock.description,
      buttons: heroBlock.buttons,
      cards: heroBlock.cards,
    };
  } catch (error) {
    console.warn("Failed to fetch homepage hero:", error);
    return null;
  }
}

