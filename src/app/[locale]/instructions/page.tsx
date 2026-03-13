"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import NavigationGuard from "@/components/NavigationGuard";
import GoBackButton from "@/components/GoBackButton";
import SelectOptionButton from "@/components/SelectOptionButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { ROUTES } from "@/lib/routes";

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 10];

function InstructionsContent() {
  const t = useTranslations("instructions");
  const router = useRouter();
  const layout = usePhotoStore((s) => s.layout)!;
  const countdownSeconds = usePhotoStore((s) => s.countdownSeconds);
  const setCountdownSeconds = usePhotoStore((s) => s.setCountdownSeconds);
  const photoCount = usePhotoStore((s) => s.photoCount);
  const setPhotoCount = usePhotoStore((s) => s.setPhotoCount);

  const slotCount = layout.cols * layout.rows;
  const photoCountOptions = [slotCount, slotCount + 2, slotCount + 4, slotCount + 6];
  const resolvedPhotoCount = photoCount ?? slotCount;

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("heading")}</h1>
      </div>

      <div className="max-w-sm w-full bg-muted rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground space-y-4">
        <p>
          {t.rich("body1", {
            strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
        <p>{t("body2")}</p>
        <p>
          {t.rich("body3", {
            strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
      </div>

      {/* Countdown duration */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-sm font-medium">{t("pauseBetween")}</p>
        <div className="flex gap-2">
          {COUNTDOWN_OPTIONS.map((sec) => (
            <SelectOptionButton
              key={sec}
              selected={countdownSeconds === sec}
              onClick={() => setCountdownSeconds(sec)}
            >
              {sec}s
            </SelectOptionButton>
          ))}
        </div>
      </div>

      {/* Photo count */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-sm font-medium">{t("photoCountLabel")}</p>
        <div className="flex gap-2">
          {photoCountOptions.map((count, i) => (
            <SelectOptionButton
              key={count}
              selected={resolvedPhotoCount === count}
              onClick={() => setPhotoCount(count)}
            >
              {count}
              {i === 0 && (
                <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">
                  {t("default")}
                </span>
              )}
            </SelectOptionButton>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <GoBackButton href={ROUTES.modeSelect} />
        <Button size="lg" className="px-12" onClick={() => router.push(ROUTES.capture)}>
          {t("continue")}
        </Button>
      </div>
    </main>
  );
}

export default function InstructionsPage() {
  const layout = usePhotoStore((s) => s.layout);
  const shootingMode = usePhotoStore((s) => s.shootingMode);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return ROUTES.layoutSelect;
        if (!shootingMode) return ROUTES.modeSelect;
        if (shootingMode !== "camera") return ROUTES.capture;
        return null;
      }}
    >
      <InstructionsContent />
    </NavigationGuard>
  );
}
