import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchCatalogue } from "@/features/search/SearchCatalogue";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? q[0] ?? "" : q ?? "";

  return (
    <PageContainer theme="search">
      <SearchCatalogue initialQuery={initialQuery} />
    </PageContainer>
  );
}
