"use client";

import { WhisperChat } from "@/app/agent-v3/_components/AgentV3/WhisperChat";
import { useRouter } from "next/navigation";

export default function AgentV3Page() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* WhisperChat takes full viewport */}
      <WhisperChat />
    </div>
  );
}
