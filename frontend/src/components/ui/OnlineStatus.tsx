'use client'

import React, { useState, useEffect } from 'react'
import { onlineUsersStore } from '@/lib/onlineUsersStore'
import { cn } from '@/utils/index'
import { formatLastOnline } from '@/lib/formatLastOnline'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface OnlineStatusProps {
  userId: number
  showText?: boolean
  showLastOnline?: boolean
  className?: string
  indicatorClassName?: string
}

export function OnlineStatus({ 
  userId, 
  showText = false,
  showLastOnline = false,
  className = '', 
  indicatorClassName = '' 
}: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(onlineUsersStore.isUserOnline(userId))
  const [lastOnlineTime, setLastOnlineTime] = useState<number | undefined>(undefined)
  
  useEffect(() => {
    // Get initial state
    const updateStatus = () => {
      setIsOnline(onlineUsersStore.isUserOnline(userId))
      const userData = onlineUsersStore.getUserById(userId)
      setLastOnlineTime(userData?.lastOnlineTime)
    }
    
    // Subscribe to changes in the online users store
    const unsubscribe = onlineUsersStore.subscribe(() => {
      updateStatus()
    })
    
    updateStatus()
    return unsubscribe
  }, [userId])
  
  const statusIndicator = (
    <span 
      className={cn(
        'h-2.5 w-2.5 rounded-full border-2 border-background',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        indicatorClassName
      )}
    />
  )
  
  const statusText = showText && (
    <span className="text-xs font-medium">
      {isOnline ? 'Online' : 'Offline'}
    </span>
  )
  
  const lastOnlineDisplay = !isOnline && showLastOnline && lastOnlineTime && (
    <span className="text-xs text-muted-foreground ml-1">
      • Last seen {formatLastOnline(lastOnlineTime)}
    </span>
  )
  
  if (showLastOnline && !isOnline && lastOnlineTime) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5', className)}>
              {statusIndicator}
              {statusText}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Last seen {formatLastOnline(lastOnlineTime)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {statusIndicator}
      {statusText}
      {lastOnlineDisplay}
    </div>
  )
} 