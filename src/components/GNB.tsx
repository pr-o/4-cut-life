"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function GNB() {
  const pathname = usePathname();

  if (pathname === ROUTES.landing) return null;

  const isEdit = pathname === ROUTES.edit;

  return (
    <nav
      className={[
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm px-6",
        // On /edit + mobile: stack into two rows. md+ always single row.
        isEdit
          ? "flex flex-col py-2 gap-1 md:flex-row md:items-center md:justify-between md:h-12 md:py-0 md:gap-0"
          : "flex items-center justify-between h-12",
      ].join(" ")}
    >
      <Link
        href={ROUTES.landing}
        className="text-sm font-semibold tracking-tight shrink-0"
      >
        네컷인생 &middot; 4-Cut Life
      </Link>
      {/* Portal target — inline on md+, full-width second row on mobile /edit */}
      <div
        id="gnb-portal"
        className={[
          "flex items-center gap-2 flex-wrap",
          isEdit ? "w-full md:w-auto" : "",
        ].join(" ")}
      />
    </nav>
  );
}
