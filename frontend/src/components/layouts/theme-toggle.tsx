'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/index'

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  // Dark mode is now always enabled
  return (
    <Button 
      variant="ghost"
      size="icon"
      aria-label="Dark mode enabled"
      className={cn("rounded-full", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 md:h-5 md:w-5"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </Button>
  );
}

export default ThemeToggle 