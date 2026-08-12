import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { MyListCatalogue } from "@/features/my-list/MyListCatalogue";

export const metadata: Metadata = {
  title: "My List",
};

export default function MyListPage() {
  return (
    <PageContainer theme="my-list">
      <MyListCatalogue />
    </PageContainer>
  );
}
