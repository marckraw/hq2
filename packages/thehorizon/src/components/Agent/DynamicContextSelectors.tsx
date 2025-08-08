import { useEffect, useState } from "react";
import { ContextSelector } from "./ContextSelector";
import { StoryblokSpaceSelector } from "./StoryblokSpaceSelector";
import { StorySelector } from "./StorySelector";
import {
  BlogCategorySelector,
  BlogTagsSelector,
  LandingPageTemplateSelector,
  ProductCategorySelector,
  PriceRangeSelector,
} from "./MockDataSelectors";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface DynamicContextSelectorsProps {
  disabled?: boolean;
  onContextDataChange: (data: any) => void;
  className?: string;
}

export interface ContextData {
  contextType: string;
  [key: string]: any;
}

export const DynamicContextSelectors = ({
  disabled,
  onContextDataChange,
  className,
}: DynamicContextSelectorsProps) => {
  const [contextType, setContextType] = useState<string>("");
  const [subSelections, setSubSelections] = useState<Record<string, string>>({});

  // Reset sub-selections when context type changes
  useEffect(() => {
    setSubSelections({});
  }, [contextType]);

  // Update parent with context data changes
  useEffect(() => {
    const contextData: ContextData = {
      contextType,
      ...subSelections,
    };
    onContextDataChange(contextData);
  }, [contextType, subSelections, onContextDataChange]);

  const updateSubSelection = (key: string, value: string) => {
    setSubSelections((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderSubSelectors = () => {
    switch (contextType) {
      case "blog-post":
        return (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[180px]">
              <BlogCategorySelector
                value={subSelections.category || ""}
                onValueChange={(value) => updateSubSelection("category", value)}
                disabled={disabled}
                placeholder="Category"
              />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[180px]">
              <BlogTagsSelector
                value={subSelections.tags || ""}
                onValueChange={(value) => updateSubSelection("tags", value)}
                disabled={disabled}
                placeholder="Tags"
              />
            </div>
          </>
        );

      case "landing-page":
        return (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[200px]">
              <LandingPageTemplateSelector
                value={subSelections.template || ""}
                onValueChange={(value) => updateSubSelection("template", value)}
                disabled={disabled}
                placeholder="Template"
              />
            </div>
          </>
        );

      case "product-page":
        return (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[200px]">
              <ProductCategorySelector
                value={subSelections.productCategory || ""}
                onValueChange={(value) =>
                  updateSubSelection("productCategory", value)
                }
                disabled={disabled}
                placeholder="Product Category"
              />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[180px]">
              <PriceRangeSelector
                value={subSelections.priceRange || ""}
                onValueChange={(value) => updateSubSelection("priceRange", value)}
                disabled={disabled}
                placeholder="Price Range"
              />
            </div>
          </>
        );

      case "storyblok-context":
        return (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-[200px]">
              <StoryblokSpaceSelector
                value={subSelections.selectedSpace || ""}
                onValueChange={(value) =>
                  updateSubSelection("selectedSpace", value)
                }
                disabled={disabled}
              />
            </div>
            {subSelections.selectedSpace && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-[200px]">
                  <StorySelector
                    value={subSelections.selectedStory || ""}
                    onValueChange={(value) =>
                      updateSubSelection("selectedStory", value)
                    }
                    selectedSpace={subSelections.selectedSpace}
                    disabled={disabled}
                  />
                </div>
              </>
            )}
          </>
        );

      case "hero-section":
      case "feature-grid":
        // These don't have sub-selectors yet
        return null;

      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="min-w-[200px] flex-shrink-0">
        <ContextSelector
          value={contextType}
          onValueChange={setContextType}
          disabled={disabled}
        />
      </div>
      {contextType && (
        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
          {renderSubSelectors()}
        </div>
      )}
    </div>
  );
};

// Helper component for displaying selected context in a compact way
export const CompactContextDisplay = ({
  contextData,
}: {
  contextData: ContextData;
}) => {
  if (!contextData.contextType) {
    return null;
  }

  const getDisplayText = () => {
    switch (contextData.contextType) {
      case "blog-post":
        return `Blog: ${contextData.category || "No category"}${
          contextData.tags ? ` (${contextData.tags.split(",").length} tags)` : ""
        }`;
      case "landing-page":
        return `Landing: ${contextData.template || "No template"}`;
      case "product-page":
        return `Product: ${contextData.productCategory || "No category"} ${
          contextData.priceRange ? `($${contextData.priceRange})` : ""
        }`;
      case "storyblok-context":
        return `Storyblok: ${contextData.selectedStory || "No story selected"}`;
      default:
        return contextData.contextType;
    }
  };

  return (
    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
      {getDisplayText()}
    </Button>
  );
};