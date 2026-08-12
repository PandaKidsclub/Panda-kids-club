import { ContentRail } from "@/components/content/ContentRail";
import { ContentSection } from "@/components/content/ContentSection";
import { HeroStage } from "@/components/hero/HeroStage";
import { PageContainer } from "@/components/layout/PageContainer";
import { LibraryHeroPreviewProvider } from "@/features/hero/LibraryHeroPreviewProvider";
import { getPilotRouteForTheme, getProgrammesForSection } from "@/lib/content/fixtures";
import type { LibraryPageConfiguration, Programme } from "@/lib/content/types";

interface LibraryPageProps {
  configuration: LibraryPageConfiguration;
  initialProgramme: Programme;
}

export function LibraryPage({ configuration, initialProgramme }: LibraryPageProps) {
  const pilotRoute = getPilotRouteForTheme(configuration.theme);

  return (
    <PageContainer theme={configuration.theme}>
      <LibraryHeroPreviewProvider initialProgramme={initialProgramme}>
        <HeroStage
          editorialDescription={configuration.heroDescription}
          editorialEyebrow={configuration.heroEyebrow}
          pageHeading={configuration.title}
          theme={configuration.theme}
          title={configuration.title}
        />
        <div className="library-page" data-library-theme={configuration.theme}>
          {configuration.sections.map((section) => (
            <ContentSection key={section.id} id={section.id} title={section.heading} tone={section.accent}>
              <ContentRail
                items={pilotRoute ? getProgrammesForSection(pilotRoute, section.id, section.programmeIds) : []}
                sectionLabel={section.heading}
              />
            </ContentSection>
          ))}
        </div>
      </LibraryHeroPreviewProvider>
    </PageContainer>
  );
}
