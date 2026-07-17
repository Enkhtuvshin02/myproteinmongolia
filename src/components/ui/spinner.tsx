import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className = "", size = 24 }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 
        className={`animate-spin text-brand ${className}`} 
        size={size} 
      />
    </div>
  );
}
