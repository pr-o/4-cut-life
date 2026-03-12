"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirects to `redirectTo` on mount if `condition` is false.
 * Returns true when the guard has passed and the page can render.
 */
export function useNavigationGuard(condition: boolean, redirectTo: string) {
  const router = useRouter();

  useEffect(() => {
    if (!condition) router.replace(redirectTo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return condition;
}
