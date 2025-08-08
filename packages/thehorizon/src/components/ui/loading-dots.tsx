import { cn } from "@/lib/utils";

export interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots = ({ className }: LoadingDotsProps) => {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[loading_1.4s_ease-in-out_infinite]" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[loading_1.4s_ease-in-out_0.2s_infinite]" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[loading_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
};
