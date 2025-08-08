import React from "react";
import type { TimelineItem } from "../ChatInterface.types";
import { MentionWithTooltip } from "./MentionWithTooltip";
import { RenderExecutionGroup } from "./RenderExecutionGroup";
import { groupExecutionSteps, renderTimelineItem } from "../ChatArea.utils";

interface ChatMessagesProps {
  displayItems: TimelineItem[];
  isLoading: boolean;
  snippetSuggestions: Array<{
    id: string;
    title: string;
    description: string | undefined;
    insertText: string;
  }>;
  ttsActions: {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    isLoading: boolean;
    currentText: string | null;
  };
}

export function ChatMessages({
  displayItems,
  isLoading,
  snippetSuggestions,
  ttsActions,
}: ChatMessagesProps) {
  return (
    <>
      {groupExecutionSteps(displayItems).map((item, index) => {
        if (item.type === "execution_group") {
          return (
            <RenderExecutionGroup
              key={`group-${item.executionId}`}
              group={item}
              index={index}
            />
          );
        } else {
          return renderTimelineItem(
            item,
            index,
            displayItems,
            isLoading,
            MentionWithTooltip,
            snippetSuggestions,
            ttsActions
          );
        }
      })}
    </>
  );
}
