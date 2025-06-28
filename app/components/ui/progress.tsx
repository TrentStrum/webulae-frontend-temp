"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  animated?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, animated = true, ...props }, ref) => {
  const [hasRendered, setHasRendered] = React.useState(false);
  
  React.useEffect(() => {
    setHasRendered(true);
  }, []);
  
  const IndicatorComponent = animated ? motion.div : "div";
  const animationProps = animated && hasRendered ? {
    initial: { width: 0 },
    animate: { width: `${value || 0}%` },
    transition: { 
      duration: 0.8, 
      ease: [0.34, 1.56, 0.64, 1] // Custom spring-like easing
    }
  } : {};
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800",
        className
      )}
      {...props}
    >
      <IndicatorComponent
        className="h-full w-full flex-1 bg-primary transition-colors"
        style={!animated ? { transform: `translateX(-${100 - (value || 0)}%)` } : undefined}
        {...animationProps}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }