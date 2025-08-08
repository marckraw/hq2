"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { Header } from "@/components/header";
import { AgentDrawer } from "@/components/agent-drawer";
import { NotificationProvider } from "@/components/notification-provider";
import { QueryProvider } from "@/providers/query-provider";
import { cn } from "@/lib/utils";

interface NavigationLayoutProps {
  children: ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't show navigation on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <QueryProvider>
      <NotificationProvider>
        <div className="min-h-screen">
          <MainNav
            className={`${
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed top-0 left-0 h-screen z-40`}
            onLogout={handleLogout}
            isExpanded={isSidebarExpanded}
            onExpandedChange={setIsSidebarExpanded}
          />
          <div
            className={`transition-[margin] duration-300 min-h-screen ${
              isSidebarExpanded ? "md:ml-64" : "md:ml-16"
            }`}
          >
            <Header
              onToggleAgent={() => setIsAgentOpen(!isAgentOpen)}
              onToggleNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
            />
            {pathname === "/figma-analyzer" ||
            pathname === "/chat" ||
            pathname === "/agent-v3" ? (
              <main
                className={cn(
                  "w-full",
                  (pathname === "/chat" || pathname === "/agent-v3") && [
                    "overflow-hidden",
                    "h-[calc(100vh-57px)]", // Full height minus header
                    "w-full", // Full width on mobile
                    // No margin on mobile, proper margin on desktop
                    "ml-0 md:ml-0",
                  ]
                )}
                style={
                  pathname === "/figma-analyzer"
                    ? {
                        padding: "2rem",
                        width: isSidebarExpanded
                          ? "calc(100vw - 17rem)"
                          : "calc(100vw - 5rem)",
                        maxWidth: "100vw",
                      }
                    : undefined
                }
              >
                {children}
              </main>
            ) : (
              <main className="container mx-auto p-4 md:p-8">{children}</main>
            )}
          </div>
          <AgentDrawer
            isOpen={isAgentOpen}
            onClose={() => setIsAgentOpen(false)}
          />
        </div>
      </NotificationProvider>
    </QueryProvider>
  );
}
