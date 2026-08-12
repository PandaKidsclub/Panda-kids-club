import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Coming Soon",
};

export default function ComingSoonRoute() {
  return <ComingSoonPage />;
}
