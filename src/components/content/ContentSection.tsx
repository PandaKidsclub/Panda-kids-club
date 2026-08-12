import type { ReactNode } from "react";
import { SeeAllLink } from "@/components/content/SeeAllLink";
import type { PageSectionAccent } from "@/lib/content/types";

interface ContentSectionProps {
  children: ReactNode;
  id: string;
  title: string;
  href?: string;
  icon?: ReactNode;
  subtitle?: string;
  tone?: PageSectionAccent;
}

export function ContentSection({
  children,
  id,
  title,
  href,
  icon,
  subtitle,
  tone = "default",
}: ContentSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section className="content-section" data-tone={tone} aria-labelledby={headingId}>
      <div className="content-section__header">
        <div className="content-section__heading-group">
          <div className="content-section__heading-row">
            {icon ? <span className="content-section__icon" aria-hidden="true">{icon}</span> : null}
            <h2 id={headingId}>{title}</h2>
          </div>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {href ? <SeeAllLink href={href} sectionTitle={title} /> : null}
      </div>
      {children}
    </section>
  );
}
