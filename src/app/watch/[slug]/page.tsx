import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchPlayer } from "@/components/watch/WatchPlayer";
import { getProgrammeBySlug } from "@/lib/content/fixtures";
import { getSafeWatchReturnPath } from "@/lib/navigation/watch-links";

export const metadata: Metadata = {
  title: "Watch",
};

interface WatchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const programme = getProgrammeBySlug(slug);

  if (!programme) {
    notFound();
  }

  const sourcePath = Array.isArray(from) ? from[0] : from;
  const backHref = getSafeWatchReturnPath(sourcePath, programme.slug);

  return <WatchPlayer backHref={backHref} programme={programme} />;
}
