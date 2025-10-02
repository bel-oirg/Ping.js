'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/index'
import { ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { OnlineUserData } from '@/lib/socket'

const OnlineUsersDock = () => {
  const { 
    onlineUsers, 
    onlineCount, 
    lastUpdated 
  } = useOnlineUsers()
  
  const [showOnlineUsersDock, setShowOnlineUsersDock] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowOnlineUsersDock(false)
      }
    }
    
    setMounted(true)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsLoading(false)
  }, [onlineUsers])

  const toggleDock = () => {
    setShowOnlineUsersDock(!showOnlineUsersDock)
  }

  const navigateToProfile = (userId: string | number) => {
    router.push(`/dashboard/profile?id=${userId}`)
  }

  if (!mounted) {
    return null
  }

  const lastOnlineUser = onlineUsers[0] || null

  return (
    <div className="fixed bottom-4 left-4 z-20">
      <div className={cn(
        "flex flex-col items-center space-y-1 md:space-y-2 py-3 md:py-4 px-1 md:px-2 rounded-full bg-card hover:bg-card transition-all duration-300",
        !showOnlineUsersDock && "py-2 px-1 md:px-2"
      )}>
        <TooltipProvider>
          {showOnlineUsersDock ? (
            <>
              <div className="flex flex-col items-center gap-2">
                {isLoading ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 md:h-12 md:w-12"
                    disabled
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </Button>
                ) : onlineCount > 0 ? (
                  <>
                    <Badge 
                      variant="secondary" 
                      className="mb-1 px-2 py-1 text-xs"
                    >
                      {onlineCount} online
                    </Badge>
                    {onlineUsers.map((user: OnlineUserData) => (
                      <Tooltip key={user.userId}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-8 w-8 md:h-12 md:w-12"
                            onClick={() => navigateToProfile(user.userId)}
                          >
                            <Avatar className="h-7 w-7 md:h-9 md:w-9">
                              {user.avatar ? (
                                <AvatarImage src={user.avatar} alt={user.username} />
                              ) : (
                                <AvatarFallback>
                                  {user.username ? user.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>@{user.username || "User"}</p>
                          <p className="text-xs text-muted-foreground">
                            Online • {new Date(lastUpdated).toLocaleTimeString()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 md:h-12 md:w-12"
                      >
                        <div className="flex items-center justify-center">
                          <span className="font-medium text-sm">0</span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>No users online</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <div className="w-full border-t my-1 md:my-2"></div>
            </>
          ) : (
            <>
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 md:h-12 md:w-12"
                  disabled
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Button>
              ) : onlineCount > 0 && lastOnlineUser ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 md:h-12 md:w-12 relative"
                      onClick={() => navigateToProfile(lastOnlineUser.userId)}
                    >
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                      >
                        {onlineCount}
                      </Badge>
                      <Avatar className="h-7 w-7 md:h-9 md:w-9">
                        {lastOnlineUser.avatar ? (
                          <AvatarImage src={lastOnlineUser.avatar} alt={lastOnlineUser.username} />
                        ) : (
                          <AvatarFallback>
                            {lastOnlineUser.username ? lastOnlineUser.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>@{lastOnlineUser.username || "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {onlineCount} online • {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 md:h-12 md:w-12"
                    >
                      <div className="flex items-center justify-center">
                        <span className="font-medium text-sm">0</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>No users online</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDock}
                className="rounded-full h-8 w-8 md:h-12 md:w-12"
              >
                {showOnlineUsersDock ? 
                  <ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5" /> :
                  <ChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle Online Users</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default OnlineUsersDock 