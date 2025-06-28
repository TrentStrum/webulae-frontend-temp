import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: React.ElementType;
  animated?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, as: Component = "input", animated = false, ...props }, ref) => {
    const InputComponent = animated ? motion.input : Component;
    
    const animationProps = animated ? {
      initial: { borderColor: "var(--border)" },
      whileFocus: { 
        borderColor: "var(--primary)",
        boxShadow: "0 0 0 3px rgba(var(--primary-rgb), 0.2)"
      },
      transition: { duration: 0.2 }
    } : {};
    
    return (
      <InputComponent
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "mt-1",
          className
        )}
        ref={ref}
        {...animationProps}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }