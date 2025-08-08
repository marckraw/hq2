import { useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Layers, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { ContextOption } from "./ContextSelector";
import { StoryblokSpaceSelector } from "./StoryblokSpaceSelector";
import { StorySelector } from "./StorySelector";
import {
  BlogCategorySelector,
  BlogTagsSelector,
  LandingPageTemplateSelector,
  ProductCategorySelector,
  PriceRangeSelector,
} from "./MockDataSelectors";

interface ContextSelectorPopoverProps {
  contextData: ContextData;
  onContextDataChange: (data: ContextData) => void;
  disabled?: boolean;
}

export interface ContextData {
  contextType: string;
  [key: string]: any;
}

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

export const ContextSelectorPopover = ({ contextData, onContextDataChange, disabled }: ContextSelectorPopoverProps) => {
  const [open, setOpen] = useState(false);

  const handleContextTypeSelect = (value: string) => {
    const newContextData: ContextData = {
      contextType: value,
    };
    onContextDataChange(newContextData);
  };

  const updateSubSelection = useCallback(
    (key: string, value: string) => {
      // Create a new object only if the value actually changed
      if (contextData[key] !== value) {
        onContextDataChange({
          ...contextData,
          [key]: value,
        });
      }
    },
    [contextData, onContextDataChange]
  );

  const getButtonText = () => {
    if (!contextData.contextType) {
      return "Add context";
    }
    const option = contextOptions.find((opt) => opt.value === contextData.contextType);

    // Shorter display for specific types with sub-selections
    if (contextData.contextType === "blog-post" && contextData.category) {
      return `${option?.icon} ${contextData.category}`;
    }
    if (contextData.contextType === "storyblok-context" && contextData.selectedStory) {
      return `${option?.icon} Story`;
    }

    return option ? option.name : contextData.contextType;
  };

  const selectedContext = contextOptions.find((opt) => opt.value === contextData.contextType);

  const getTooltipContent = () => {
    if (!contextData.contextType) {
      return "Click to add context to your conversation";
    }
    let content = selectedContext?.name || contextData.contextType;

    // Add sub-selection details
    if (contextData.contextType === "blog-post") {
      if (contextData.category) content += ` • ${contextData.category}`;
      if (contextData.tags) content += ` • ${contextData.tags.split(",").length} tags`;
    } else if (contextData.contextType === "landing-page") {
      if (contextData.template) content += ` • ${contextData.template}`;
    } else if (contextData.contextType === "product-page") {
      if (contextData.productCategory) content += ` • ${contextData.productCategory}`;
      if (contextData.priceRange) content += ` • $${contextData.priceRange}`;
    } else if (contextData.contextType === "storyblok-context") {
      if (contextData.selectedStory) content += ` • ${contextData.selectedStory}`;
    }

    return content;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-accent hover:text-accent-foreground text-foreground/70 hover:text-foreground"
          disabled={disabled}
        >
          <Layers className="h-4 w-4 mr-1" />
          <span className="text-xs">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[40rem] p-0 max-w-[calc(100vw-2rem)]" align="start" side="top" sideOffset={8}>
        <div>
          {/* Header */}
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Select Context</h4>
            <p className="text-xs text-muted-foreground mt-1">Choose the content type and provide additional context</p>
          </div>

          {/* Two-panel layout */}
          <div className="flex">
            {/* Left Panel - Context Types */}
            <div className="w-[16rem] border-r">
              <Command>
                <CommandInput placeholder="Search context types..." className="h-9" />
                <CommandList className="max-h-[350px]">
                  <CommandEmpty>No context type found.</CommandEmpty>
                  <CommandGroup heading="Content Types">
                    {contextOptions.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.value}
                        onSelect={() => handleContextTypeSelect(option.value)}
                        className={cn(
                          "flex items-center justify-between p-3 cursor-pointer",
                          contextData.contextType === option.value && "bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{option.icon}</span>
                          <div className="text-left">
                            <div className="font-medium text-sm">{option.name}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                        {contextData.contextType === option.value && <Check className="h-4 w-4 text-primary" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>

            {/* Right Panel - Dynamic Sub-selectors */}
            {contextData.contextType && (
              <div className="flex-1 bg-muted/20 animate-in slide-in-from-right-2 duration-200">
                <div className="p-4">
                  <h5 className="font-medium text-sm mb-3">Configure {selectedContext?.name}</h5>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {contextData.contextType === "blog-post" && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Category</label>
                          <div className="mt-1">
                            <BlogCategorySelector
                              value={contextData.category || ""}
                              onValueChange={(value) => updateSubSelection("category", value)}
                              disabled={disabled}
                              placeholder="Select category"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Tags</label>
                          <div className="mt-1">
                            <BlogTagsSelector
                              value={contextData.tags || ""}
                              onValueChange={(value) => updateSubSelection("tags", value)}
                              disabled={disabled}
                              placeholder="Select tags"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {contextData.contextType === "landing-page" && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Template</label>
                        <div className="mt-1">
                          <LandingPageTemplateSelector
                            value={contextData.template || ""}
                            onValueChange={(value) => updateSubSelection("template", value)}
                            disabled={disabled}
                            placeholder="Select template"
                          />
                        </div>
                      </div>
                    )}

                    {contextData.contextType === "product-page" && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Product Category</label>
                          <div className="mt-1">
                            <ProductCategorySelector
                              value={contextData.productCategory || ""}
                              onValueChange={(value) => updateSubSelection("productCategory", value)}
                              disabled={disabled}
                              placeholder="Select category"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Price Range</label>
                          <div className="mt-1">
                            <PriceRangeSelector
                              value={contextData.priceRange || ""}
                              onValueChange={(value) => updateSubSelection("priceRange", value)}
                              disabled={disabled}
                              placeholder="Select price range"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {contextData.contextType === "storyblok-context" && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Storyblok Space</label>
                          <div className="mt-1">
                            <StoryblokSpaceSelector
                              value={contextData.selectedSpace || ""}
                              onValueChange={(value) => updateSubSelection("selectedSpace", value)}
                              disabled={disabled}
                            />
                          </div>
                        </div>
                        {contextData.selectedSpace && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Story</label>
                            <div className="mt-1">
                              <StorySelector
                                value={contextData.selectedStory || ""}
                                onValueChange={(value) => updateSubSelection("selectedStoryId", value)}
                                selectedSpace={contextData.selectedSpace}
                                disabled={disabled}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {(contextData.contextType === "hero-section" || contextData.contextType === "feature-grid") && (
                      <div className="text-xs text-muted-foreground text-center py-8">
                        No additional configuration needed for this context type
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
