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

interface SelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Blog Category Selector
export const BlogCategorySelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Select category",
}: SelectorProps) => {
  const [open, setOpen] = useState(false);

  const categories = [
    { value: "technology", label: "Technology", icon: "💻" },
    { value: "business", label: "Business", icon: "💼" },
    { value: "lifestyle", label: "Lifestyle", icon: "🌟" },
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "food", label: "Food & Cooking", icon: "🍳" },
    { value: "health", label: "Health & Fitness", icon: "💪" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
  ];

  const selected = categories.find((cat) => cat.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.icon}</span>
              {selected.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Blog Tags Selector (multi-select)
export const BlogTagsSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Select tags",
}: SelectorProps) => {
  const [open, setOpen] = useState(false);

  const tags = [
    "tutorial",
    "how-to",
    "news",
    "opinion",
    "review",
    "case-study",
    "interview",
    "announcement",
    "tips",
    "beginner",
    "advanced",
    "best-practices",
  ];

  const selectedTags = value ? value.split(",").filter(Boolean) : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedTags.length > 0 ? (
            <span className="text-sm">
              {selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""} selected
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={(currentTag) => {
                    const newTags = selectedTags.includes(currentTag)
                      ? selectedTags.filter((t) => t !== currentTag)
                      : [...selectedTags, currentTag];
                    onValueChange(newTags.join(","));
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Landing Page Template Selector
export const LandingPageTemplateSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Select template",
}: SelectorProps) => {
  const [open, setOpen] = useState(false);

  const templates = [
    { value: "saas", label: "SaaS Product", description: "Software as a Service" },
    { value: "app", label: "Mobile App", description: "App download page" },
    { value: "course", label: "Online Course", description: "Educational content" },
    { value: "event", label: "Event", description: "Conference or webinar" },
    { value: "ebook", label: "E-book", description: "Digital download" },
    { value: "newsletter", label: "Newsletter", description: "Email subscription" },
    { value: "waitlist", label: "Waitlist", description: "Coming soon page" },
  ];

  const selected = templates.find((template) => template.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? (
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{selected.label}</span>
              <span className="text-xs text-muted-foreground">
                {selected.description}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search templates..." />
          <CommandList>
            <CommandEmpty>No template found.</CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.value}
                  value={template.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === template.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{template.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {template.description}
                    </span>
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

// Product Category Selector
export const ProductCategorySelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Select product category",
}: SelectorProps) => {
  const [open, setOpen] = useState(false);

  const categories = [
    { value: "electronics", label: "Electronics", icon: "📱" },
    { value: "clothing", label: "Clothing & Fashion", icon: "👕" },
    { value: "home", label: "Home & Garden", icon: "🏠" },
    { value: "beauty", label: "Beauty & Personal Care", icon: "💄" },
    { value: "sports", label: "Sports & Outdoors", icon: "⚽" },
    { value: "books", label: "Books & Media", icon: "📚" },
    { value: "toys", label: "Toys & Games", icon: "🎮" },
    { value: "food", label: "Food & Beverages", icon: "🍕" },
  ];

  const selected = categories.find((cat) => cat.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.icon}</span>
              {selected.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Price Range Selector
export const PriceRangeSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Select price range",
}: SelectorProps) => {
  const [open, setOpen] = useState(false);

  const ranges = [
    { value: "0-25", label: "Under $25", icon: "💵" },
    { value: "25-50", label: "$25 - $50", icon: "💵💵" },
    { value: "50-100", label: "$50 - $100", icon: "💵💵💵" },
    { value: "100-250", label: "$100 - $250", icon: "💵💵💵💵" },
    { value: "250+", label: "Over $250", icon: "💵💵💵💵💵" },
  ];

  const selected = ranges.find((range) => range.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.icon}</span>
              {selected.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search price ranges..." />
          <CommandList>
            <CommandEmpty>No range found.</CommandEmpty>
            <CommandGroup>
              {ranges.map((range) => (
                <CommandItem
                  key={range.value}
                  value={range.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === range.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span>{range.icon}</span>
                    {range.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};