import Image from "next/image";
import Link from "next/link";
import { ContinueWatchingAction } from "@/components/title/ContinueWatchingAction";
import { PageContainer } from "@/components/layout/PageContainer";
import { MyListButton } from "@/components/my-list/MyListButton";
import { formatProgrammeMetadata, getProgrammeBadgeLabels } from "@/lib/content/programme-formatting";
import type { Programme } from "@/lib/content/types";
import { getWatchHref } from "@/lib/navigation/watch-links";
import type { ProgrammeAttribution } from "@/lib/content/types";

interface TitleDetailPageProps {
  programme: Programme;
}

interface CreditEntry {
  label: string;
  value: string;
}

function getCreditEntries(attribution: ProgrammeAttribution): CreditEntry[] {
  const entries: Array<[string, string | undefined]> = [
    ["Original title", attribution.originalTitle],
    ["Source", attribution.sourceName],
    ["Author", attribution.author],
    ["Adapter", attribution.adapter],
    ["Translator", attribution.translator],
    ["Illustrator", attribution.illustrator],
    ["Copyright", attribution.copyrightNotice],
    ["Licence", attribution.licenseName],
    ["Adaptation note", attribution.adaptationNote],
  ];

  return entries.flatMap(([label, value]) => value ? [{ label, value }] : []);
}

function getBackHref(programme: Programme): string {
  switch (programme.category) {
    case "stories":
      return "/stories";
    case "learn":
      return "/learn";
    case "heroes":
      return "/heroes";
    case "specials":
      return "/specials";
    case "monthly-updates":
      return "/coming-soon";
  }
}

export function TitleDetailPage({ programme }: TitleDetailPageProps) {
  const metadata = formatProgrammeMetadata(programme);
  const badges = getProgrammeBadgeLabels(programme);
  const primaryDescription = programme.shortDescription || programme.longDescription;
  const aboutDescription = programme.longDescription !== primaryDescription ? programme.longDescription : null;
  const watchHref = programme.fullVideo ? getWatchHref(programme.slug, `/title/${programme.slug}`) : null;
  const attribution = programme.attribution;
  const creditEntries = attribution ? getCreditEntries(attribution) : [];
  const hasCredits = Boolean(attribution && (creditEntries.length > 0 || attribution.attributionText || attribution.sourceUrl || attribution.licenseUrl));
  const backHref = getBackHref(programme);

  return (
    <PageContainer theme="title">
      <article className="title-detail" aria-labelledby="title-detail-heading">
        <section className="title-detail__hero">
          <div className="title-detail__media" aria-hidden="true">
            {programme.heroPosterImage ? (
              <Image alt="" fill priority sizes="100vw" src={programme.heroPosterImage.src} />
            ) : null}
          </div>
          <div className="title-detail__scrim" aria-hidden="true" />
          <div className="title-detail__safe-area">
            <Link className="title-detail__back" href={backHref}>
              <span className="title-detail__back-icon" aria-hidden="true" />
              Back
            </Link>
            <div className="title-detail__content">
              {programme.titleLogoImage ? (
                <>
                  <h1 id="title-detail-heading" className="visually-hidden">{programme.name}</h1>
                  <Image
                    alt={programme.titleLogoImage.alt}
                    className="title-detail__logo"
                    height={programme.titleLogoImage.height ?? 140}
                    src={programme.titleLogoImage.src}
                    width={programme.titleLogoImage.width ?? 440}
                  />
                </>
              ) : (
                <h1 id="title-detail-heading">{programme.name}</h1>
              )}
              {primaryDescription ? <p className="title-detail__description">{primaryDescription}</p> : null}
              {metadata ? <p className="title-detail__metadata">{metadata}</p> : null}
              {badges.length > 0 ? (
                <ul className="title-detail__badges" aria-label="Programme highlights">
                  {badges.map((badge) => <li key={badge}>{badge}</li>)}
                </ul>
              ) : null}
              <div className="title-detail__actions" aria-label="Programme actions">
                {watchHref ? (
                  <ContinueWatchingAction href={watchHref} slug={programme.slug} />
                ) : null}
                <MyListButton className="button--secondary" programme={programme} />
              </div>
            </div>
          </div>
        </section>
        {aboutDescription ? (
          <section className="title-detail__about" aria-labelledby="title-detail-about-heading">
            <h2 id="title-detail-about-heading">About this programme</h2>
            <p>{aboutDescription}</p>
          </section>
        ) : null}
        {hasCredits && attribution ? (
          <section className="title-detail__credits" aria-labelledby="title-detail-credits-heading">
            <h2 id="title-detail-credits-heading">Credits &amp; Source</h2>
            {attribution.attributionText ? <p>{attribution.attributionText}</p> : null}
            {creditEntries.length > 0 ? (
              <dl>
                {creditEntries.map((entry) => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd>{entry.label === "Licence" && attribution.licenseUrl ? (
                      <a href={attribution.licenseUrl} rel="noreferrer" target="_blank">{entry.value}</a>
                    ) : entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {attribution.sourceUrl ? (
              <p>
                <a className="title-detail__source-link" href={attribution.sourceUrl} rel="noreferrer" target="_blank">
                  View source [download free book]
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
      </article>
    </PageContainer>
  );
}
