'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export function StaggeredList({
  children,
  className,
  itemClassName,
  staggerDelay = 0.1,
  duration = 0.5,
  threshold = 0.1,
  once = true,
  direction = 'up',
  distance = 20,
}: StaggeredListProps) {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold 
  });

  // Convert children to array to work with them
  const childrenArray = React.Children.toArray(children);

  // Define initial and animate states based on direction
  const getVariants = () => {
    const variants = {
      hidden: { opacity: 0 },
      visible: (i: number) => ({
        opacity: 1,
        transition: {
          delay: i * staggerDelay,
          duration,
          ease: [0.22, 1, 0.36, 1]
        }
      })
    };

    switch (direction) {
      case 'up':
        variants.hidden = { ...variants.hidden, y: distance };
        variants.visible = (i: number) => ({
          ...variants.visible(i),
          y: 0
        });
        break;
      case 'down':
        variants.hidden = { ...variants.hidden, y: -distance };
        variants.visible = (i: number) => ({
          ...variants.visible(i),
          y: 0
        });
        break;
      case 'left':
        variants.hidden = { ...variants.hidden, x: distance };
        variants.visible = (i: number) => ({
          ...variants.visible(i),
          x: 0
        });
        break;
      case 'right':
        variants.hidden = { ...variants.hidden, x: -distance };
        variants.visible = (i: number) => ({
          ...variants.visible(i),
          x: 0
        });
        break;
      case 'none':
      default:
        // Just fade in with no translation
        break;
    }

    return variants;
  };

  const variants = getVariants();

  return (
    <ul ref={ref} className={className}>
      {childrenArray.map((child, index) => (
        <motion.li
          key={index}
          custom={index}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={variants}
          className={cn("will-change-transform", itemClassName)}
        >
          {child}
        </motion.li>
      ))}
    </ul>
  );
}