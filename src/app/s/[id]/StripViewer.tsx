"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function StripViewer({ firebaseUrl }: { firebaseUrl: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-12 w-full">
      <Button asChild disabled={!loaded}>
        <a href={firebaseUrl} target="_blank" rel="noopener noreferrer">
          Download
        </a>
      </Button>

      <div className="relative">
        {!loaded && (
          <div className="w-64 h-96 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firebaseUrl}
          alt="Photo strip"
          className={`max-w-xs shadow-xl transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
