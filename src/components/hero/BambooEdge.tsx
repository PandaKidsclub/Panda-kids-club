import Image from "next/image";

export function BambooEdge() {
  return (
    <div className="hero-stage__bamboo" aria-hidden="true">
      <Image
        alt=""
        className="hero-stage__bamboo-image"
        height={1080}
        priority
        src="/brand/bamboo-edge.png"
        width={1920}
      />
    </div>
  );
}
