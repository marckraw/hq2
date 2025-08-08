import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
}

export function LoadingAnimation({
  message = "Loading...",
  className,
  size = "md",
  overlay = false,
}: LoadingAnimationProps) {
  const gridSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const containerSize = {
    sm: "w-[200px]",
    md: "w-[300px]",
    lg: "w-[400px]",
  };

  const Component = overlay ? "div" : "span";

  return (
    <Component
      className={cn(
        "flex items-center justify-center",
        overlay && "fixed inset-0 bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className={cn("relative", containerSize[size])}>
        {/* Grid animation */}
        <div className="grid grid-cols-8 gap-1 animate-grid-fade">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={cn("rounded-sm bg-primary/10", gridSize[size])}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </Component>
  );
}
