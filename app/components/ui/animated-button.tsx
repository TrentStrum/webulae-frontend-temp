'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'scale' | 'pulse' | 'bounce' | 'shine' | 'none';
  animationDuration?: number;
  hoverScale?: number;
  pressScale?: number;
  children: React.ReactNode;
}

export function AnimatedButton({
  animationType = 'scale',
  animationDuration = 0.3,
  hoverScale = 1.05,
  pressScale = 0.95,
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  // Define animation variants based on type
  const getAnimationProps = () => {
    switch (animationType) {
      case 'scale':
        return {
          whileHover: { scale: hoverScale },
          whileTap: { scale: pressScale },
          transition: { duration: animationDuration }
        };
      case 'pulse':
        return {
          whileHover: { 
            scale: [1, hoverScale, 1],
            transition: { 
              duration: animationDuration * 2,
              repeat: Infinity
            }
          },
          whileTap: { scale: pressScale }
        };
      case 'bounce':
        return {
          whileHover: { 
            y: [0, -5, 0],
            transition: { 
              duration: animationDuration * 2,
              repeat: Infinity
            }
          },
          whileTap: { scale: pressScale }
        };
      case 'shine':
        return {
          whileHover: { 
            boxShadow: [
              '0 0 0 0 rgba(var(--primary-rgb), 0)',
              '0 0 0 8px rgba(var(--primary-rgb), 0.2)',
              '0 0 0 0 rgba(var(--primary-rgb), 0)'
            ],
            transition: { 
              duration: animationDuration * 2,
              repeat: Infinity
            }
          },
          whileTap: { scale: pressScale }
        };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="inline-block"
      {...getAnimationProps()}
    >
      <Button
        className={cn("transition-all duration-300", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}