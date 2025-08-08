import { cn } from "@/lib/utils";
import {
  Home,
  BarChart2,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  Bug,
  Activity,
  Shield,
  GitBranch,
  Figma,
  Bot,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: Shield,
  },
  {
    title: "Pipelines",
    href: "/pipelines",
    icon: GitBranch,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Figma Analyzer",
    href: "/figma-analyzer",
    icon: Figma,
  },
  {
    title: "Webhook Tester",
    href: "/webhook-tester",
    icon: Bug,
  },
  {
    title: "AI Assistant",
    href: "/agent",
    icon: Bot,
  },
  {
    title: "Whisper UI",
    href: "/agent-v3",
    icon: Bot,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: Activity,
  },
];

interface MainNavProps {
  className?: string;
  onLogout: () => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function MainNav({
  className,
  onLogout,
  isExpanded = true,
  onExpandedChange,
}: MainNavProps) {
  const pathname = usePathname();
  const [internalExpanded, setInternalExpanded] = useState(true);

  const expanded = onExpandedChange ? isExpanded : internalExpanded;
  const setExpanded = onExpandedChange || setInternalExpanded;

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-background border-r transition-all duration-300",
        expanded ? "w-64" : "w-16",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b h-14">
        {expanded && <span className="font-bold text-lg">Horizon</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className={cn("ml-auto", !expanded && "mx-auto")}
        >
          {expanded ? <ChevronLeft /> : <Menu />}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="space-y-2 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent",
                        !expanded && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {expanded && <span>{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center space-x-2",
                !expanded && "justify-center px-0"
              )}
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 min-w-5" />
              {expanded && <span>Logout</span>}
            </Button>
          </TooltipTrigger>
          {!expanded && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
}
