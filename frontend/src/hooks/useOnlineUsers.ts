import { useCallback } from 'react';
import { useOnlineUsersContext } from '@/context/OnlineUsersContext'
import { OnlineUserData } from '@/lib/socket'
import { useGlobalOnlineUsers } from './useGlobalOnlineUsers'
import { onlineUsersStore } from '@/lib/onlineUsersStore'

export interface OnlineUsersState {
  onlineUsers: OnlineUserData[]
  isUserOnline: (userId: number) => boolean
  onlineCount: number
  lastUpdated: number
  markListAsViewed: () => void
  refreshOnlineUsers: () => void
}

export function useOnlineUsers(): OnlineUsersState {
  const contextData = useOnlineUsersContext()
  const globalData = useGlobalOnlineUsers()  
  const onlineUsers = globalData.onlineUsers.length > 0 ? globalData.onlineUsers : contextData.onlineUsers
  const onlineCount = onlineUsers.length
  
  // Use useCallback to memoize the isUserOnline function
  const isUserOnline = useCallback((userId: number): boolean => {
    return onlineUsersStore.isUserOnline(userId)
  }, [])
  
  return {
    onlineUsers,
    isUserOnline,
    onlineCount,
    lastUpdated: contextData.lastUpdated,
    markListAsViewed: contextData.markListAsViewed,
    refreshOnlineUsers: contextData.refreshOnlineUsers
  }
} 