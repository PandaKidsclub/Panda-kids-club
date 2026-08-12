import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { MyListProvider } from "@/features/my-list/MyListProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Panda Kids Club",
    template: "%s | Panda Kids Club",
  },
  description: "Panda Kids Club streaming library.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MyListProvider>
          <AppShell>{children}</AppShell>
        </MyListProvider>
      </body>
    </html>
  );
}
