import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

function Skeleton({ className, as: Component = "div", ...props }: SkeletonProps) {
  return (
    <Component
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }