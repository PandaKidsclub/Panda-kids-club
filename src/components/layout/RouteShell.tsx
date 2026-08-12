import { HeroStage } from "@/components/hero/HeroStage";
import { PageContainer } from "@/components/layout/PageContainer";
import type { PageTheme } from "@/lib/theme/page-themes";

interface RouteShellProps {
  title: string;
  theme: PageTheme;
}

export function RouteShell({ title, theme }: RouteShellProps) {
  return (
    <PageContainer theme={theme}>
      <HeroStage title={title} theme={theme} />
      <section className="page-content-foundation" aria-label="Coming Soon">
        <div className="page-content-foundation__inner" />
      </section>
    </PageContainer>
  );
}
