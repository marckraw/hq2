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

export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  created_at: string;
  updated_at: string;
  published_at?: string;
  is_folder: boolean;
  parent_id?: number;
  position: number;
  tag_list: string[];
  published: boolean;
  uuid: string;
  is_startpage: boolean;
}

interface StorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  selectedSpace: string;
  disabled?: boolean;
}

export const StorySelector = ({
  value,
  onValueChange,
  selectedSpace,
  disabled = false,
}: StorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [stories, setStories] = useState<StoryblokStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Search function
  const searchStories = useCallback(async (spaceId: string, search: string) => {
    if (!spaceId || search.length < 3) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/storyblok/spaces/${spaceId}/stories?search=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStories(result.data);
          setHasSearched(true);
          console.log(
            `🔍 Found ${result.count} stories matching "${search}" in space ${spaceId}`
          );
        } else {
          setError(result.error || "Failed to search stories");
        }
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to search stories:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use a ref to store the timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler
  const debouncedSearch = useCallback((spaceId: string, search: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchStories(spaceId, search);
    }, 500);
  }, [searchStories]);

  // Handle search input changes
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);

    if (search.length >= 3 && selectedSpace) {
      debouncedSearch(selectedSpace, search);
    } else if (search.length < 3) {
      setStories([]);
      setHasSearched(false);
      setError(null);
    }
  };

  // Track previous space to detect actual changes
  const prevSpaceRef = useRef(selectedSpace);

  // Reset when selectedSpace changes
  useEffect(() => {
    if (prevSpaceRef.current !== selectedSpace) {
      setStories([]);
      setSearchTerm("");
      setHasSearched(false);
      setError(null);
      // Only reset the value if the space actually changed
      if (prevSpaceRef.current && value) {
        onValueChange("");
      }
      prevSpaceRef.current = selectedSpace;
    }
  }, [selectedSpace, value, onValueChange]);

  const getStoryIcon = (story: StoryblokStory): string => {
    if (story.is_startpage) return "🏠";
    if (story.is_folder) return "📁";
    if (story.name.toLowerCase().includes("blog")) return "📝";
    if (story.name.toLowerCase().includes("product")) return "🛍️";
    if (story.name.toLowerCase().includes("contact")) return "📞";
    if (story.name.toLowerCase().includes("about")) return "ℹ️";
    if (story.name.toLowerCase().includes("pricing")) return "💰";
    if (story.name.toLowerCase().includes("faq")) return "❓";
    if (story.name.toLowerCase().includes("help")) return "🆘";
    if (story.name.toLowerCase().includes("doc")) return "📖";
    if (story.name.toLowerCase().includes("api")) return "⚙️";
    if (story.name.toLowerCase().includes("tutorial")) return "🎓";
    if (story.name.toLowerCase().includes("cart")) return "🛒";
    return "📄";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const selectedStory = stories.find((story) => story.id.toString() === value);

  if (!selectedSpace) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-auto min-h-[2.5rem] p-3"
            disabled
          >
            <span className="text-muted-foreground/70 dark:text-muted-foreground">
              Select a space first
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </Popover>
    );
  }

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
          {selectedStory ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-base">{getStoryIcon(selectedStory)}</span>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground">
                  {selectedStory.name}
                </span>
                <span className="text-xs text-muted-foreground/80 dark:text-muted-foreground truncate max-w-full">
                  /{selectedStory.full_slug} •{" "}
                  {selectedStory.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground/70 dark:text-muted-foreground">
              Search for a story...
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
            placeholder="Type 3+ characters to search stories by slug..."
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? "🔍 Searching stories..."
                : error
                ? `❌ Error: ${error}`
                : searchTerm.length < 3
                ? "Type at least 3 characters to search"
                : hasSearched
                ? `No stories found with slug containing "${searchTerm}"`
                : "Start typing to search stories..."}
            </CommandEmpty>
            <CommandGroup>
              {stories.map((story) => (
                <CommandItem
                  key={story.id}
                  value={story.id.toString()}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === story.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base">{getStoryIcon(story)}</span>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground">
                        {story.name}
                      </span>
                      <span className="text-xs text-muted-foreground/90 dark:text-muted-foreground">
                        /{story.full_slug}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            story.published
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {story.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs bg-muted/60 dark:bg-muted text-muted-foreground/90 dark:text-muted-foreground px-1.5 py-0.5 rounded">
                          {formatDate(story.updated_at)}
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
