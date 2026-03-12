import { Redis } from "@upstash/redis";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StripViewer from "./StripViewer";

const redis = Redis.fromEnv();

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const firebaseUrl = await redis.get<string>(`short:${id}`);

  if (!firebaseUrl) return {};

  return {
    title: "4-Cut Life | 인생네컷 — Photo Strip",
    description: "View and download this photo strip.",
    openGraph: {
      title: "4-Cut Life | 인생네컷 — Photo Strip",
      description: "View and download this photo strip.",
      images: [{ url: firebaseUrl, alt: "Photo strip" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "4-Cut Life | 인생네컷 — Photo Strip",
      images: [firebaseUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const firebaseUrl = await redis.get<string>(`short:${id}`);

  if (!firebaseUrl) notFound();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <StripViewer firebaseUrl={firebaseUrl} />
    </main>
  );
}
