import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div className={cn("animate-spin rounded-full border-t-transparent border-primary", sizeClasses[size], {
        'border-2': size === 'sm',
        'border-4': size === 'md',
        'border-[6px]': size === 'lg',
      })} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}