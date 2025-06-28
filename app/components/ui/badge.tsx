import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  animated?: boolean;
}

function Badge({ className, variant, animated = false, ...props }: BadgeProps) {
  const BadgeComponent = animated ? motion.div : "div";
  
  const animationProps = animated ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  } : {};
  
  return (
    <BadgeComponent
      className={cn(badgeVariants({ variant }), className)}
      {...animationProps}
      {...props}
    />
  )
}

export { Badge, badgeVariants }