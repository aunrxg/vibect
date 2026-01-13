import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import { AuthProvider } from "@/context/AuthContext";
import { Provider } from "@/lib/provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vibect - Collaborative music streaming",
  description:
    "Create spaces where viewers can add songs, vote, and enjoy music together in real-time",
  creator: "Anurag Poddar",
  openGraph: {
    title: "Vibect - Collaborative music streaming",
    description:
      "Create spaces where viewers can add songs, vote, and enjoy music together in real-time",
    url: "http://localhost:3000",
    siteName: "Vibect",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "MusicSpace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibect - Collaborative music streaming",
    description:
      "Create spaces where viewers can add songs, vote, and enjoy music together in real-time",
    images: ["/og_image.png"],
    creator: "@aunrxg",
  },
  // icons: {
  //   icon: "",
  //   shortcut: "",
  //   apple: "",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Provider>
          <main>{children}</main>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
