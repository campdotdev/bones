import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { BonesForce } from "@camp.dev/bones/react";
import { BonesDevTool } from "@/components/bones-devtool/bones-devtool";
import "@camp.dev/bones/css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bones Demo — Pokédex",
  description: "Inline skeleton loaders for React, powered by the PokeAPI.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const animate = cookieStore.get("bones-animate")?.value ?? "shimmer";
  const isCompareFrame = headerStore.get("x-bones-compare") === "1";

  return (
    <html lang="en">
      <body data-bone-animate={animate}>
        {isCompareFrame ? <BonesForce>{children}</BonesForce> : children}
        {!isCompareFrame && <BonesDevTool />}
      </body>
    </html>
  );
}
