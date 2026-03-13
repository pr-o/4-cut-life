import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: "4-Cut Life | 인생네컷",
  description: "Your own Life-4-Cuts photo booth experience",
  openGraph: {
    title: "4-Cut Life | 인생네컷",
    description: "Your own Life-4-Cuts photo booth experience",
    images: [
      {
        url: "/assets/images/og-image-1200-630.webp",
        width: 1200,
        height: 630,
        alt: "4-Cut Life — 네컷인생",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "4-Cut Life | 인생네컷",
    description: "Your own Life-4-Cuts photo booth experience",
    images: ["/assets/images/og-image-1200-630.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${roboto.className} antialiased flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
