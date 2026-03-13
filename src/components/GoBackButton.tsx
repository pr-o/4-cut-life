"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  href: string;
};

export default function GoBackButton({ href }: Props) {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <Button variant="outline" size="lg" onClick={() => router.push(href)}>
      {t("goBack")}
    </Button>
  );
}
