import type { Metadata } from "next";
import { LibraryPage } from "@/components/layout/LibraryPage";
import { getFeaturedProgrammeForRoute, getProgrammeById, heroesLibraryPage } from "@/lib/content/fixtures";

export const metadata: Metadata = {
  title: "Heroes",
};

export default function HeroesPage() {
  const fallbackProgramme = getProgrammeById(heroesLibraryPage.featuredProgrammeId);
  const initialProgramme = getFeaturedProgrammeForRoute("heroes", heroesLibraryPage.featuredProgrammeId);

  if (!fallbackProgramme) {
    throw new Error("Heroes library requires its configured featured programme.");
  }

  return <LibraryPage configuration={heroesLibraryPage} initialProgramme={initialProgramme} />;
}
