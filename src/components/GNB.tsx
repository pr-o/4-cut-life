"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function GNB() {
  const pathname = usePathname();

  if (pathname === ROUTES.landing) return null;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm px-6 h-12 flex items-center justify-between">
      <Link
        href={ROUTES.landing}
        className="text-sm font-semibold tracking-tight"
      >
        네컷인생 &middot; 4-Cut Life
      </Link>
      {/* Route-specific actions injected here via portal */}
      <div id="gnb-portal" className="flex items-center gap-2" />
    </nav>
  );
}
