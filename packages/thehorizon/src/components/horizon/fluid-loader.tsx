import { cn } from "@/lib/utils";

interface FluidLoaderProps {
  message?: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function FluidLoader({
  message,
  className,
  size = "sm",
}: FluidLoaderProps) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative">
        {/* Main pulse circle */}
        <div
          className={cn(
            "rounded-full bg-primary/20",
            "animate-fluid-pulse",
            sizeClasses[size]
          )}
        />

        {/* Energy trails */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "absolute w-full h-full rounded-full",
              "border border-primary/40",
              "animate-energy-trail"
            )}
          />
        </div>

        {/* Electric sparks */}
        <div className="absolute -inset-1">
          <div
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0",
              "animate-electric-spark",
              "rounded-full"
            )}
          />
        </div>
      </div>

      {message && (
        <span className="text-xs text-muted-foreground animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
}
