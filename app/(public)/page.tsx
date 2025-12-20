import {
  HomepageHero,
  // HomeCarousel,
  WhyYouShouldJoinSection,
  HomepageStoriesSection,
  HomepageNotableAlumni,
  HomepageNewsBlogs,
  getHomepageHero,
  getHomepageWhyJoinSection,
  getHomepageStories,
  getHomepageNotableAlumni,
  getHomepageNewsBlogs,
} from "@/features/homepage";
import { HomepageGallery } from "@/features/homepage/components/HomepageGallery";
import { getHomepageGallerySection } from "@/features/homepage/api/gallery.api";

export default async function Home() {
  const [heroSection, whyJoinSection, storiesData, gallerySection, notableAlumniSection, newsBlogsSection] =
    await Promise.allSettled([
      getHomepageHero(),
      getHomepageWhyJoinSection(),
      getHomepageStories(),
      getHomepageGallerySection(),
      getHomepageNotableAlumni(),
      getHomepageNewsBlogs(),
    ]);

  // Debug: Log hero section data
  if (heroSection.status === "fulfilled") {
    console.log("Hero section data:", heroSection.value);
  } else {
    console.warn("Hero section error:", heroSection.reason);
  }

  return (
    <div className="w-full">
      <HomepageHero
        section={heroSection.status === "fulfilled" ? heroSection.value : null}
      />
      <WhyYouShouldJoinSection
        section={whyJoinSection.status === "fulfilled" ? whyJoinSection.value : null}
      />
      <HomepageStoriesSection
        data={storiesData.status === "fulfilled" ? storiesData.value : {}}
      />
      <HomepageGallery
        section={gallerySection.status === "fulfilled" ? gallerySection.value : null}
      />
      <HomepageNotableAlumni
        section={
          notableAlumniSection.status === "fulfilled" ? notableAlumniSection.value : null
        }
      />
      <HomepageNewsBlogs
        section={
          newsBlogsSection.status === "fulfilled" ? newsBlogsSection.value : null
        }
      />
    </div>
  );
}

