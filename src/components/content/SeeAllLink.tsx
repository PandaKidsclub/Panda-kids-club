import Link from "next/link";

interface SeeAllLinkProps {
  href: string;
  sectionTitle: string;
}

export function SeeAllLink({ href, sectionTitle }: SeeAllLinkProps) {
  return (
    <Link className="see-all-link" href={href} aria-label={`See all ${sectionTitle} programmes`}>
      <span>See all</span>
      <span className="see-all-link__arrow" aria-hidden="true" />
    </Link>
  );
}
