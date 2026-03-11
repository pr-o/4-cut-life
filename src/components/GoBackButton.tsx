"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  href: string;
};

export default function GoBackButton({ href }: Props) {
  const router = useRouter();
  return (
    <Button variant="outline" size="lg" onClick={() => router.push(href)}>
      Go back
    </Button>
  );
}
