import { Home, BarChart2, Settings, Bug, Activity, Shield, GitBranch, Figma, Bot, BookOpen } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open: controlledOpen, onOpenChange }: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Handle other keyboard shortcuts
      if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            runCommand(() => router.push("/"));
            break;
          case "d":
            e.preventDefault();
            runCommand(() => router.push("/docs"));
            break;
          case "b":
            e.preventDefault();
            runCommand(() => router.push("/habits"));
            break;
          case "p":
            e.preventDefault();
            runCommand(() => router.push("/pipelines"));
            break;
          case "a":
            e.preventDefault();
            runCommand(() => router.push("/approvals"));
            break;
          case "n":
            e.preventDefault();
            runCommand(() => router.push("/analytics"));
            break;
          case "s":
            e.preventDefault();
            runCommand(() => router.push("/settings"));
            break;
          case "f":
            e.preventDefault();
            runCommand(() => router.push("/figma-analyzer"));
            break;
          case "c":
            e.preventDefault();
            runCommand(() => router.push("/chat"));
            break;
          case "i":
            e.preventDefault();
            runCommand(() => router.push("/agent"));
            break;
          case "3":
            e.preventDefault();
            runCommand(() => router.push("/agent-v3"));
            break;
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen, router]);

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
            <CommandShortcut>^H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Documentation</span>
            <CommandShortcut>^D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/pipelines"))}>
            <GitBranch className="mr-2 h-4 w-4" />
            <span>Pipelines</span>
            <CommandShortcut>^P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/approvals"))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Approvals</span>
            <CommandShortcut>^A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/analytics"))}>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
            <CommandShortcut>^N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/fitness"))}>
            <span className="mr-2 h-4 w-4">🏋️</span>
            <span>Fitness</span>
            <CommandShortcut>^F</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/fitness/activities"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Fitness Activity</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/figma-analyzer"))}>
            <Figma className="mr-2 h-4 w-4" />
            <span>Figma Analyzer</span>
            <CommandShortcut>^F</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/webhook-tester"))}>
            <Bug className="mr-2 h-4 w-4" />
            <span>Webhook Tester</span>
            <CommandShortcut>^W</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/agent"))}>
            <Bot className="mr-2 h-4 w-4" />
            <span>AI Assistant</span>
            <CommandShortcut>^I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/agent-v3"))}>
            <Bot className="mr-2 h-4 w-4" />
            <span>Whisper UI</span>
            <CommandShortcut>^3</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/chat"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Chat</span>
            <CommandShortcut>^C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>^S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
