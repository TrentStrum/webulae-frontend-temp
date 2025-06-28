'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTabsProps {
  tabs: {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }[];
  defaultTab?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  onChange?: (id: string) => void;
}

export function AnimatedTabs({
  tabs,
  defaultTab,
  orientation = 'horizontal',
  className,
  tabsClassName,
  contentClassName,
  onChange,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <div 
      className={cn(
        "w-full",
        isHorizontal ? "flex flex-col" : "flex flex-row gap-6",
        className
      )}
    >
      <div 
        className={cn(
          "relative",
          isHorizontal 
            ? "flex flex-row border-b border-border/50" 
            : "flex flex-col border-r border-border/50 pr-6",
          tabsClassName
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors",
              isHorizontal ? "mr-2" : "mb-2 text-left",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-selected={activeTab === tab.id}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div
                className={cn(
                  "absolute bg-primary",
                  isHorizontal 
                    ? "h-0.5 bottom-0 left-0 right-0" 
                    : "w-0.5 top-0 bottom-0 right-0"
                )}
                layoutId="activeTab"
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className={cn("relative flex-1 overflow-hidden", contentClassName)}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 w-full h-full",
              activeTab !== tab.id && "pointer-events-none"
            )}
            aria-hidden={activeTab !== tab.id}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: activeTab === tab.id ? 1 : 0,
                y: activeTab === tab.id ? 0 : 10,
                transition: { 
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              className="h-full"
            >
              {tab.content}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}