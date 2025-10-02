'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { OnlineUserData } from '@/lib/socket'
import { useSocket } from './SocketContext'
// Import the global store and hook
import { onlineUsersStore } from '@/lib/onlineUsersStore'
import { useGlobalOnlineUsers } from '@/hooks/useGlobalOnlineUsers'

interface OnlineUsersContextType {
  onlineUsers: OnlineUserData[]
  onlineCount: number
  isUserOnline: (userId: number) => boolean
  lastUpdated: number
  markListAsViewed: () => void
  refreshOnlineUsers: () => void
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined)

export function OnlineUsersProvider({ children }: { children: React.ReactNode }) {
  const { socket, onlineUsers: socketOnlineUsers, currentUserId } = useSocket()
  const globalOnlineUsers = useGlobalOnlineUsers()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserData[]>([])
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())  
  const previousUsersRef = useRef<OnlineUserData[]>([])
  
  // Update local state when global online users change
  useEffect(() => {
    if (!globalOnlineUsers.onlineUsers || globalOnlineUsers.onlineUsers.length === 0) {
      return;
    }    
    const filtered = currentUserId 
      ? globalOnlineUsers.onlineUsers.filter(user => Number(user.userId) !== Number(currentUserId))
      : [...globalOnlineUsers.onlineUsers];      
    previousUsersRef.current = filtered;
    setOnlineUsers(filtered);
    setLastUpdated(Date.now());
  }, [globalOnlineUsers.onlineUsers, currentUserId]);

  // Update local state when socket online users change
  useEffect(() => {
    if (socketOnlineUsers && socketOnlineUsers.length > 0 && onlineUsers.length === 0) {
      const filtered = currentUserId 
        ? socketOnlineUsers.filter(user => Number(user.userId) !== Number(currentUserId))
        : [...socketOnlineUsers];
        
      setOnlineUsers(filtered);
      previousUsersRef.current = filtered;
      setLastUpdated(Date.now());
    }
  }, [socketOnlineUsers, currentUserId, onlineUsers.length]);

  // Function to manually refresh online users
  const refreshOnlineUsers = useCallback(() => {
    if (socket?.connected) {
      socket.emit('users:online:get')
    }
  }, [socket])

  // Use the store's isUserOnline method for consistency
  const isUserOnline = useCallback((userId: number): boolean => {
    return onlineUsersStore.isUserOnline(userId);
  }, []);

  const onlineCount = onlineUsers.length

  const value: OnlineUsersContextType = {
    onlineUsers,
    onlineCount,
    isUserOnline,
    lastUpdated,
    markListAsViewed: () => {}, // Empty function for API compatibility
    refreshOnlineUsers
  }

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  )
}

export function useOnlineUsersContext(): OnlineUsersContextType {
  const context = useContext(OnlineUsersContext)
  if (context === undefined) {
    throw new Error('useOnlineUsersContext must be used within an OnlineUsersProvider')
  }
  return context
} 