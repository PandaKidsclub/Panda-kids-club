import type { Metadata } from "next";
import { LibraryPage } from "@/components/layout/LibraryPage";
import { getFeaturedProgrammeForRoute, getProgrammeById, storiesLibraryPage } from "@/lib/content/fixtures";

export const metadata: Metadata = {
  title: "Stories",
};

export default function StoriesPage() {
  const fallbackProgramme = getProgrammeById(storiesLibraryPage.featuredProgrammeId);
  const initialProgramme = getFeaturedProgrammeForRoute("stories", storiesLibraryPage.featuredProgrammeId);

  if (!fallbackProgramme) {
    throw new Error("Stories library requires its configured featured programme.");
  }

  return <LibraryPage configuration={storiesLibraryPage} initialProgramme={initialProgramme} />;
}
