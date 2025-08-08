"use client";

import { Agent } from "@/components/Agent/Agent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AgentPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Full-screen AI assistant with expanded workspace for longer
          conversations
        </p>
      </div>
      <Agent />
    </div>
  );
}
