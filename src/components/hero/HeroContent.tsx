import Link from "next/link";
import { MyListButton } from "@/components/my-list/MyListButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Programme } from "@/lib/content/types";

interface HeroContentProps {
  eyebrow: string;
  headingId: string;
  title: string;
  description?: string | null;
  metadata?: string;
  playHref?: string | null;
  moreInfoHref?: string | null;
  programme?: Programme | null;
  headingLevel?: "h1" | "h2";
  compactTitle?: boolean;
}

export function HeroContent({
  eyebrow,
  headingId,
  title,
  description,
  metadata,
  playHref,
  moreInfoHref,
  programme,
  headingLevel = "h1",
  compactTitle = false,
}: HeroContentProps) {
  const Heading = headingLevel;

  return (
    <div className="hero-stage__content">
      <Badge tone="neutral">{eyebrow}</Badge>
      <Heading id={headingId} className={compactTitle ? "hero-stage__title--compact" : undefined}>
        {title}
      </Heading>
      {description ? <p className="hero-stage__description">{description}</p> : null}
      {metadata ? <p className="hero-stage__metadata">{metadata}</p> : null}
      <div className="hero-stage__actions" aria-label="Programme actions">
        {playHref ? (
          <Link className="button button--primary" href={playHref}>
            <span className="control-icon control-icon--play" aria-hidden="true" />
            Play
          </Link>
        ) : null}
        {moreInfoHref ? (
          <Link className="button button--tertiary" href={moreInfoHref}>
            More Info
          </Link>
        ) : null}
        {programme ? <MyListButton className="button--secondary" programme={programme} /> : (
          <Button className="button--secondary" disabled>My List</Button>
        )}
      </div>
    </div>
  );
}
