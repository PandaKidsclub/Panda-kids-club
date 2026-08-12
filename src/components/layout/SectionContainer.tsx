import type { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  labelledBy: string;
}

export function SectionContainer({ children, labelledBy }: SectionContainerProps) {
  return (
    <section className="section-container" aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

