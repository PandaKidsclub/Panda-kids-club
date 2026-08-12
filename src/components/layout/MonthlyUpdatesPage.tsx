import { ContentRail } from "@/components/content/ContentRail";
import { ContentSection } from "@/components/content/ContentSection";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  developmentMonthlyUpdatesPageSections,
  getProgrammesForSection,
} from "@/lib/content/fixtures";

export function MonthlyUpdatesEditorialPage() {
  return (
    <PageContainer theme="monthly-updates">
      <section className="monthly-masthead" aria-labelledby="monthly-updates-heading">
        <div className="monthly-masthead__inner">
          <p className="monthly-masthead__eyebrow">Monthly Updates</p>
          <h1 id="monthly-updates-heading">Monthly Updates</h1>
          <p className="monthly-masthead__promise">15 New Exciting Titles Every Month</p>
        </div>
      </section>
      <div className="monthly-updates-page">
        <section className="monthly-release-summary" aria-labelledby="monthly-release-summary-heading">
          <h2 id="monthly-release-summary-heading" className="visually-hidden">
            15 new titles every month
          </h2>
          <div className="monthly-release-summary__lead">
            <p className="monthly-release-summary__number" aria-hidden="true">15</p>
            <p className="monthly-release-summary__title">
              New Titles<br />Every Month
            </p>
          </div>
          <dl className="monthly-release-summary__distribution">
            <div>
              <dd>5</dd>
              <dt>Educational</dt>
            </div>
            <div>
              <dd>5</dd>
              <dt>Storytime Adventures</dt>
            </div>
            <div>
              <dd>5</dd>
              <dt>Heroes &amp; Folktales</dt>
            </div>
          </dl>
        </section>
        {developmentMonthlyUpdatesPageSections.map((section) => (
          <ContentSection key={section.id} id={section.id} title={section.heading} tone={section.accent}>
            <ContentRail
              items={getProgrammesForSection("monthly-updates", section.id, section.programmeIds)}
              sectionLabel={section.heading}
            />
          </ContentSection>
        ))}
      </div>
    </PageContainer>
  );
}
