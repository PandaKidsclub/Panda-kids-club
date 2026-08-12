import { ContentRail } from "@/components/content/ContentRail";
import { ContentSection } from "@/components/content/ContentSection";
import { HeroStage } from "@/components/hero/HeroStage";
import { PageContainer } from "@/components/layout/PageContainer";
import { LibraryHeroPreviewProvider } from "@/features/hero/LibraryHeroPreviewProvider";
import {
  developmentPageSections,
  getProgrammesForSection,
  getFeaturedDevelopmentProgramme,
} from "@/lib/content/fixtures";

export default function HomePage() {
  const featuredProgramme = getFeaturedDevelopmentProgramme();

  return (
    <PageContainer theme="home">
      <LibraryHeroPreviewProvider initialProgramme={featuredProgramme}>
        <HeroStage compactTitle theme="home" title="Programme" />
        <div className="home-library">
          {developmentPageSections.map((section) => (
            <ContentSection
              key={section.id}
              href={section.href}
              id={section.id}
              title={section.heading}
              tone={section.accent}
            >
              <ContentRail
                items={getProgrammesForSection("home", section.id, section.programmeIds)}
                sectionLabel={section.heading}
              />
            </ContentSection>
          ))}
        </div>
      </LibraryHeroPreviewProvider>
    </PageContainer>
  );
}
