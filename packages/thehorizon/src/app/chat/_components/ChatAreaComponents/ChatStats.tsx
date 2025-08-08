"use client";

import React from "react";
import {
  useConversationState,
  useChatUIState,
  useCurrentSelection,
  useStreaming,
  useAutonomousMode,
} from "../../_state/chat";

export function ChatStats() {
  // Access state through clean hooks - no prop drilling! 🚀
  const { messageStats, isLoading } = useConversationState();
  const { currentSelection } = useCurrentSelection();
  const { canSubmit, attachments } = useChatUIState();
  const { isAutonomousMode } = useAutonomousMode();
  const { connectionStatus, progressMessages } = useStreaming();

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        Chat Statistics (Zero Prop Drilling! 🎉)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Messages:</strong> {messageStats.total}
          </p>
          <p>
            <strong>User:</strong> {messageStats.user}
          </p>
          <p>
            <strong>Assistant:</strong> {messageStats.assistant}
          </p>
        </div>

        <div>
          <p>
            <strong>Model:</strong> {currentSelection?.item.name || "None"}
          </p>
          <p>
            <strong>Type:</strong> {currentSelection?.type || "None"}
          </p>
          <p>
            <strong>Can Submit:</strong> {canSubmit.canSubmit ? "✅" : "❌"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Loading:</strong> {isLoading ? "🔄" : "✅"}
          </p>
          <p>
            <strong>Attachments:</strong> {attachments.length}
          </p>
          <p>
            <strong>Autonomous:</strong> {isAutonomousMode ? "🤖" : "👤"}
          </p>
        </div>

        <div>
          <p>
            <strong>Connection:</strong> {connectionStatus}
          </p>
          <p>
            <strong>Progress Steps:</strong> {progressMessages.length}
          </p>
          <p>
            <strong>Has Content:</strong> {canSubmit.hasContent ? "✅" : "❌"}
          </p>
        </div>
      </div>
    </div>
  );
}
