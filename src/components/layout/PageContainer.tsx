import type { ReactNode } from "react";
import type { PageTheme } from "@/lib/theme/page-themes";

interface PageContainerProps {
  children: ReactNode;
  theme: PageTheme;
}

export function PageContainer({ children, theme }: PageContainerProps) {
  return (
    <main id="main-content" className="page-container" data-page-theme={theme}>
      {children}
    </main>
  );
}

