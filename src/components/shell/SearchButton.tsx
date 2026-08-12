import Link from "next/link";

export function SearchButton() {
  return (
    <Link className="icon-button icon-button--search" href="/search" aria-label="Open search">
      <span className="control-icon control-icon--search" aria-hidden="true" />
    </Link>
  );
}
