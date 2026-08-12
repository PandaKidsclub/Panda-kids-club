import type { Metadata } from "next";
import { LibraryPage } from "@/components/layout/LibraryPage";
import { getFeaturedProgrammeForRoute, getProgrammeById, specialsLibraryPage } from "@/lib/content/fixtures";

export const metadata: Metadata = {
  title: "Specials",
};

export default function SpecialsPage() {
  const fallbackProgramme = getProgrammeById(specialsLibraryPage.featuredProgrammeId);
  const initialProgramme = getFeaturedProgrammeForRoute("specials", specialsLibraryPage.featuredProgrammeId);

  if (!fallbackProgramme) {
    throw new Error("Specials library requires its configured featured programme.");
  }

  return <LibraryPage configuration={specialsLibraryPage} initialProgramme={initialProgramme} />;
}
