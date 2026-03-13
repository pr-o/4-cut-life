"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Camera, ImageUp } from "lucide-react";
import NavigationGuard from "@/components/NavigationGuard";
import GoBackButton from "@/components/GoBackButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { ROUTES } from "@/lib/routes";
import type { ShootingMode } from "@/store/usePhotoStore";
import { cn } from "@/lib/utils";

function ModeSelectContent() {
  const t = useTranslations("modeSelect");
  const router = useRouter();
  const setShootingMode = usePhotoStore((s) => s.setShootingMode);

  const modes: { mode: ShootingMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      mode: "camera",
      label: t("cameraLabel"),
      description: t("cameraDescription"),
      icon: <Camera size={32} strokeWidth={1.5} />,
    },
    {
      mode: "upload",
      label: t("uploadLabel"),
      description: t("uploadDescription"),
      icon: <ImageUp size={32} strokeWidth={1.5} />,
    },
  ];

  function handleSelect(mode: ShootingMode) {
    setShootingMode(mode);
    switch (mode) {
      case "camera":
        router.push(ROUTES.instructions);
        break;
      case "upload":
        router.push(ROUTES.upload);
        break;
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("heading")}</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {modes.map(({ mode, label, description, icon }) => (
          <button
            key={mode}
            onClick={() => handleSelect(mode)}
            className={cn(
              "flex-1 flex flex-col items-center gap-3 rounded-2xl border-2 border-border p-8",
              "hover:border-primary hover:bg-primary/5 transition-colors text-center",
            )}
          >
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-lg font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </button>
        ))}
      </div>

      <GoBackButton href={ROUTES.layoutSelect} />
    </main>
  );
}

export default function ModeSelectPage() {
  const layout = usePhotoStore((s) => s.layout);
  return (
    <NavigationGuard check={() => (!layout ? ROUTES.layoutSelect : null)}>
      <ModeSelectContent />
    </NavigationGuard>
  );
}
