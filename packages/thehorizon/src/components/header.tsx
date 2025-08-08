import { Button } from "./ui/button";
import { LightDarkSwitch } from "@/components/mode-toggle";
import { Bot, Menu } from "lucide-react";
import { CommandMenu } from "./command-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";

interface HeaderProps {
  onToggleAgent: () => void;
  onToggleNav?: () => void;
}

export function Header({ onToggleAgent, onToggleNav }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={onToggleNav}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </div>
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Horizon Dashboard
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="ghost"
              className="relative h-8 w-full justify-start text-sm font-normal md:w-40 lg:w-64 group"
              onClick={() => setShowSearch(true)}
            >
              <span className="hidden lg:inline-flex">Search...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex group-hover:bg-accent group-hover:text-accent-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative", showSearch && "opacity-0")}
              onClick={onToggleAgent}
            >
              <Bot className="h-5 w-5" />
              <span className="sr-only">Toggle Agent</span>
            </Button>
            <LightDarkSwitch />
          </div>
        </div>
      </div>
      <CommandMenu open={showSearch} onOpenChange={setShowSearch} />
    </header>
  );
}
