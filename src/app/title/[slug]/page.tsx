import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetailPage } from "@/components/title/TitleDetailPage";
import { getProgrammeBySlug } from "@/lib/content/fixtures";

export const metadata: Metadata = {
  title: "Title",
};

interface TitlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const programme = getProgrammeBySlug(slug);

  if (!programme) {
    notFound();
  }

  return <TitleDetailPage programme={programme} />;
}
