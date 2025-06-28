import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  animated?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, animated = false, ...props }, ref) => {
    const TextareaComponent = animated ? motion.textarea : "textarea";
    
    const animationProps = animated ? {
      initial: { borderColor: "var(--border)" },
      whileFocus: { 
        borderColor: "var(--primary)",
        boxShadow: "0 0 0 3px rgba(var(--primary-rgb), 0.2)"
      },
      transition: { duration: 0.2 }
    } : {};
    
    return (
      <TextareaComponent
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...animationProps}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }