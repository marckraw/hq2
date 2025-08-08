import { useState } from "react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextOption {
  id: string;
  value: string;
  name: string;
  description: string;
  icon: string;
}

interface ContextSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const ContextSelector = ({
  value,
  onValueChange,
  disabled,
}: ContextSelectorProps) => {
  const [open, setOpen] = useState(false);

  const contextOptions: ContextOption[] = [
    {
      id: "blog-post",
      value: "blog-post",
      name: "Blog Post",
      description: "Article or blog content with rich text and media",
      icon: "📝",
    },
    {
      id: "landing-page",
      value: "landing-page",
      name: "Landing Page",
      description: "Marketing page with hero, features, and CTA",
      icon: "🏠",
    },
    {
      id: "product-page",
      value: "product-page",
      name: "Product Page",
      description: "Product showcase with details and purchase options",
      icon: "🛍️",
    },
    {
      id: "hero-section",
      value: "hero-section",
      name: "Hero Section",
      description: "Main banner with headline and call-to-action",
      icon: "🎯",
    },
    {
      id: "feature-grid",
      value: "feature-grid",
      name: "Feature Grid",
      description: "Grid layout showcasing features or services",
      icon: "📊",
    },
    {
      id: "storyblok-context",
      value: "storyblok-context",
      name: "Storyblok Context",
      description: "Edit existing Storyblok content from your spaces",
      icon: "📚",
    },
  ];

  const selectedContext = contextOptions.find(
    (context) => context.value === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[2.5rem] p-3"
          disabled={disabled}
        >
          {selectedContext ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-base">{selectedContext.icon}</span>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground">
                  {selectedContext.name}
                </span>
                <span className="text-xs text-muted-foreground/80 dark:text-muted-foreground truncate max-w-full">
                  {selectedContext.description}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground/70 dark:text-muted-foreground">
              Select content type
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          onKeyDown={(e) => {
            // Prevent Enter key from propagating to parent form
            if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
        >
          <CommandInput placeholder="Search content types..." />
          <CommandList>
            <CommandEmpty>No content type found.</CommandEmpty>
            <CommandGroup>
              {contextOptions.map((context) => (
                <CommandItem
                  key={context.id}
                  value={context.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === context.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base">{context.icon}</span>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground">
                        {context.name}
                      </span>
                      <span className="text-xs text-muted-foreground/90 dark:text-muted-foreground">
                        {context.description}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Export the ContextOption type for use in other components
export type { ContextOption };
