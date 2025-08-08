import { useState, useEffect, useCallback, useRef } from "react";
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

export interface StoryblokSpace {
  id: number;
  name: string;
  domain: string;
  stories_count: number;
  plan: string;
}

interface StoryblokSpaceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const StoryblokSpaceSelector = ({
  value,
  onValueChange,
  disabled = false,
}: StoryblokSpaceSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<StoryblokSpace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Create debounced search function - memoized properly
  const searchSpaces = useCallback(async (search: string) => {
    if (search.length < 3) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/storyblok/spaces?search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("🔍 Full API response:", result); // Debug log
        if (result.success) {
          console.log("✅ API success, setting spaces:", result.data); // Debug log
          setSpaces(result.data);
          setHasSearched(true);
          console.log(`📦 Found ${result.count} spaces matching "${search}"`);
        } else {
          console.log("❌ API returned success: false", result); // Debug log
          setError(result.error || "Failed to search spaces");
        }
      } else {
        console.log("❌ HTTP error:", response.status, response.statusText); // Debug log
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to search Storyblok spaces:", error);
      setError(error instanceof Error ? error.message : "Unknown error");

      // Fallback to mock data if API fails
      const mockSpaces = [
        {
          id: 1,
          name: "Marketing Site 🌐",
          domain: "marketing.example.com",
          stories_count: 25,
          plan: "Pro",
        },
        {
          id: 2,
          name: "E-commerce Store 🛒",
          domain: "shop.example.com",
          stories_count: 45,
          plan: "Business",
        },
        {
          id: 3,
          name: "Company Blog 📰",
          domain: "blog.example.com",
          stories_count: 120,
          plan: "Pro",
        },
        {
          id: 4,
          name: "Documentation 📖",
          domain: "docs.example.com",
          stories_count: 80,
          plan: "Team",
        },
        {
          id: 5,
          name: "Help Center 🆘",
          domain: "help.example.com",
          stories_count: 35,
          plan: "Team",
        },
      ].filter((space) =>
        space.name.toLowerCase().includes(search.toLowerCase())
      );
      setSpaces(mockSpaces);
      setHasSearched(true);
      console.log("🔄 Using fallback mock data for spaces");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use a ref to store the timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler
  const debouncedSearch = useCallback((search: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchSpaces(search);
    }, 500);
  }, [searchSpaces]);

  // Handle search input changes
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);

    if (search.length >= 3) {
      debouncedSearch(search);
    } else if (search.length < 3) {
      setSpaces([]);
      setHasSearched(false);
      setError(null);
    }
  };

  const getSpaceIcon = (name: string): string => {
    // Extract emoji from name or provide default based on keywords
    const emojiMatch = name.match(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/);
    if (emojiMatch) return emojiMatch[0];

    // Fallback icons based on keywords
    if (name.toLowerCase().includes("marketing")) return "🌐";
    if (
      name.toLowerCase().includes("shop") ||
      name.toLowerCase().includes("commerce")
    )
      return "🛒";
    if (name.toLowerCase().includes("blog")) return "📰";
    if (name.toLowerCase().includes("doc")) return "📖";
    if (name.toLowerCase().includes("help")) return "🆘";
    return "📦"; // Default icon
  };

  const cleanSpaceName = (name: string): string => {
    return name.replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, "").trim();
  };

  const selectedSpace = spaces.find((space) => space.id.toString() === value);

  // Debug log for spaces state
  useEffect(() => {
    console.log("🎨 Spaces state updated:", spaces, "Count:", spaces.length);
  }, [spaces]);

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
          {selectedSpace ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-base">
                {getSpaceIcon(selectedSpace.name)}
              </span>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground">
                  {cleanSpaceName(selectedSpace.name)}
                </span>
                <span className="text-xs text-muted-foreground/80 dark:text-muted-foreground truncate max-w-full">
                  {selectedSpace.stories_count} stories • {selectedSpace.plan}{" "}
                  plan • {selectedSpace.domain}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground/70 dark:text-muted-foreground">
              Search for a Storyblok space...
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
          shouldFilter={false}
          onKeyDown={(e) => {
            // Prevent Enter key from propagating to parent form
            if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
        >
          <CommandInput
            placeholder="Type 3+ characters to search spaces by name..."
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? "🔍 Searching spaces..."
                : error
                ? `❌ Error: ${error}`
                : searchTerm.length < 3
                ? "Type at least 3 characters to search"
                : hasSearched
                ? `No spaces found with name containing "${searchTerm}"`
                : "Start typing to search spaces..."}
            </CommandEmpty>
            <CommandGroup>
              {spaces.map((space) => (
                <CommandItem
                  key={space.id}
                  value={space.id.toString()}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === space.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base">
                      {getSpaceIcon(space.name)}
                    </span>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground">
                        {cleanSpaceName(space.name)}
                      </span>
                      <span className="text-xs text-muted-foreground/90 dark:text-muted-foreground">
                        {space.domain}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-muted/60 dark:bg-muted text-muted-foreground/90 dark:text-muted-foreground px-1.5 py-0.5 rounded">
                          {space.stories_count} stories
                        </span>
                        <span className="text-xs bg-muted/60 dark:bg-muted text-muted-foreground/90 dark:text-muted-foreground px-1.5 py-0.5 rounded">
                          {space.plan}
                        </span>
                      </div>
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
