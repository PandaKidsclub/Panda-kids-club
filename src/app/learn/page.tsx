import type { Metadata } from "next";
import { LibraryPage } from "@/components/layout/LibraryPage";
import { getFeaturedProgrammeForRoute, getProgrammeById, learnLibraryPage } from "@/lib/content/fixtures";

export const metadata: Metadata = {
  title: "Learn",
};

export default function LearnPage() {
  const fallbackProgramme = getProgrammeById(learnLibraryPage.featuredProgrammeId);
  const initialProgramme = getFeaturedProgrammeForRoute("learn", learnLibraryPage.featuredProgrammeId);

  if (!fallbackProgramme) {
    throw new Error("Learn library requires its configured featured programme.");
  }

  return <LibraryPage configuration={learnLibraryPage} initialProgramme={initialProgramme} />;
}
