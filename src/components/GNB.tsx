"use client";

import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function GNB() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  if (pathname === ROUTES.landing) return null;

  const otherLocale = locale === "en" ? "ko" : "en";

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm px-6 flex flex-wrap items-center gap-x-2 gap-y-1 min-h-12 py-1.5">
      <Link
        href={ROUTES.landing}
        className="text-sm font-semibold tracking-tight shrink-0 mr-auto"
      >
        네컷인생 &middot; 4-Cut Life
      </Link>
      {/* Portal target — action buttons injected here from /edit */}
      <div id="gnb-portal" className="flex items-center gap-2 flex-wrap" />
      <Button
        variant="outline"
        size="icon"
        onClick={switchLocale}
        title={otherLocale === "ko" ? "한국어로 전환" : "Switch to English"}
        className="shrink-0"
      >
        <Languages size={16} />
      </Button>
    </nav>
  );
}
