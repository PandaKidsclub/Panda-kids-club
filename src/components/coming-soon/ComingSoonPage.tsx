import { ComingSoonShowcase } from "@/components/coming-soon/ComingSoonShowcase";
import { PageContainer } from "@/components/layout/PageContainer";
import { comingSoonRelease, getComingSoonProgrammes } from "@/lib/content/coming-soon-release";

function getRequestTimestamp(): number {
  return new Date().getTime();
}

export function ComingSoonPage() {
  return (
    <PageContainer theme="coming-soon">
      <ComingSoonShowcase
        initialNow={getRequestTimestamp()}
        programmes={getComingSoonProgrammes()}
        releaseAt={comingSoonRelease.releaseAt}
      />
    </PageContainer>
  );
}
