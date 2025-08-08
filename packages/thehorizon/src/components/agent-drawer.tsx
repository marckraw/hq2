import { Agent } from "./Agent/Agent";
import { Button } from "./ui/button";
import { X, Maximize2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDrawer({ isOpen, onClose }: AgentDrawerProps) {
  const router = useRouter();

  const handleMaximize = () => {
    router.push("/agent");
    onClose();
  };

  // Add event listener for Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    // Add event listener when drawer is open
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Solid drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[500px] transform transition-transform duration-300 ease-in-out z-[51] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Solid background wrapper */}
        <div className="absolute inset-0 bg-background border-l shadow-xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          <div className="flex flex-col gap-2 p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMaximize}
                  title="Open in full screen"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Maximize</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Need more space? Click the maximize button for full-screen mode
            </p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <Agent />
          </div>
        </div>
      </div>
    </>
  );
}
