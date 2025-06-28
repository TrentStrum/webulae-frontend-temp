'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ThemeToggle({ variant = 'outline', size = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} aria-label="Toggle theme">
          <motion.div
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="relative w-[1.2rem] h-[1.2rem]"
          >
            <motion.div
              initial={false}
              animate={{ 
                opacity: theme === 'dark' ? 0 : 1,
                scale: theme === 'dark' ? 0 : 1,
                rotate: theme === 'dark' ? -90 : 0
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ 
                opacity: theme === 'dark' ? 1 : 0,
                scale: theme === 'dark' ? 1 : 0,
                rotate: theme === 'dark' ? 0 : 90
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}