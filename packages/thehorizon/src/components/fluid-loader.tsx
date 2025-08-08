"use client";

import { Loader2 } from "lucide-react";

interface FluidLoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const FluidLoader = ({ size = "md", message }: FluidLoaderProps) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizeClass[size]} animate-spin text-primary`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};
