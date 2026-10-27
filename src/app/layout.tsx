import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Toasts } from "@/components/Toasts";

export const metadata: Metadata = {
  title: "Vinod Patel Group – B2B Trade Portal",
  description: "Wholesale ice-machine parts for trade customers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>
        <AppProvider>
          {children}
          <Toasts />
        </AppProvider>
      </body>
    </html>
  );
}
