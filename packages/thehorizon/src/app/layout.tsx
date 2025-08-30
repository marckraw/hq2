import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { NavigationLayout } from "@/components/layouts/navigation-layout";
import { StreamProvider } from "@/providers/stream-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horizon - Your Personal Dashboard",
  description: "A dashboard for your personal AI-driven world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ThemeProvider>
          <QueryProvider>
            <StreamProvider>
              <ToastProvider>
                <NavigationLayout>{children}</NavigationLayout>
              </ToastProvider>
            </StreamProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
