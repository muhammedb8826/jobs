import { fetchHomepageHero } from "../services/hero.service";
import { HeroSection } from "../types/hero.types";

export async function getHomepageHero(): Promise<HeroSection | null> {
  return fetchHomepageHero();
}

