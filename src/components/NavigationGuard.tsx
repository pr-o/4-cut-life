"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = {
  check: () => string | null; // return redirect path, or null if ok
  children: React.ReactNode;
};

export default function NavigationGuard({ check, children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const redirect = check();
    if (redirect) {
      router.replace(redirect);
    } else {
      setAllowed(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!allowed) return null;
  return <>{children}</>;
}
