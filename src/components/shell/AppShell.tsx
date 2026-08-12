"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/shell/Header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isWatchRoute = pathname.startsWith("/watch/");

  if (isWatchRoute) {
    return <div className="app-shell app-shell--watch">{children}</div>;
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      {children}
    </div>
  );
}
