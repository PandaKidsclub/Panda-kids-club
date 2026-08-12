import Link from "next/link";
import Image from "next/image";

export function BrandMark() {
  return (
    <Link className="brand-mark" href="/" aria-label="Panda Kids Club home">
      <span className="brand-mark__logo-slot" aria-hidden="true">
        <Image
          alt=""
          className="brand-mark__logo"
          height={1024}
          priority
          src="/brand/panda-kids-club-logo.png"
          width={1536}
        />
      </span>
    </Link>
  );
}
