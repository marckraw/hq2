import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { NextAuthProvider } from "@/providers/session-provider";
import { UserBadge } from "@/components/user/user-badge";
// Auth protection is handled by middleware; no need to call auth() here

export const metadata = {
  title: "Kinship AI",
  description: "AI assistant portal",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAuthProvider>
          <ThemeProvider>
            <UserBadge />
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
