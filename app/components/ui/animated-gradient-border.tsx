'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderWidth?: number;
  duration?: number;
  colors?: string[];
  borderRadius?: string;
  hoverEffect?: boolean;
}

export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
  borderWidth = 2,
  duration = 8,
  colors = ['var(--primary-500)', 'var(--secondary-500)', 'var(--accent-500)', 'var(--primary-500)'],
  borderRadius = '0.75rem',
  hoverEffect = true,
}: AnimatedGradientBorderProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <motion.div
        className="absolute inset-0 rounded-[inherit] z-0"
        style={{
          background: `linear-gradient(90deg, ${colors.join(', ')})`,
          backgroundSize: '300% 300%',
          borderRadius,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        whileHover={hoverEffect ? { scale: 1.02, transition: { duration: 0.3 } } : undefined}
      />
      <div
        className={cn(
          "relative z-10 bg-background rounded-[inherit]",
          className
        )}
        style={{
          margin: borderWidth,
          borderRadius,
        }}
      >
        {children}
      </div>
    </div>
  );
}